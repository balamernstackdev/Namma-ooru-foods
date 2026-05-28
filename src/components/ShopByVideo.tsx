'use client';

import Image from 'next/image';
import { useState, useRef, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { Play, ShoppingCart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import ReelsViewer from './ReelsViewer';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// --- OPTIMIZED SUBCOMPONENT: ELIMINATES MOUNT/UNMOUNT ABORT ERRORS ---
const VideoReelItem = memo(({ video, isHovered, onClick, onHoverStart, onHoverEnd }: any) => {
  const videoRefLocal = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRefLocal.current;
    if (!el) return;

    if (isHovered) {
      // Play with promise catch safety to prevent AbortError
      const playPromise = el.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Silent catch - browser autoplay prevention or safe unmount
          console.debug('Mini video playback handled safely:', err.message);
        });
      }
    } else {
      try {
        el.pause();
        el.currentTime = 0;
      } catch (e) {
        // Catch potential DOM state exceptions during pause safely
      }
    }
  }, [isHovered]);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={onClick}
      className="relative flex-shrink-0 w-[180px] sm:w-[220px] md:w-[260px] aspect-[9/16] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden snap-start shadow-xl group cursor-pointer border border-slate-100 transition-all duration-500 bg-slate-900"
    >
      {/* Media Layer */}
      <div className="absolute inset-0">
        {/* Dual Layer Rendering: Cross-fades opacity instead of unmounting DOM nodes */}
        <Image
          src={video.thumbnail || '/logo.webp'}
          alt={video.title}
          fill
          sizes="(max-width: 768px) 50vw, 30vw"
          className={`object-cover transition-opacity duration-700 group-hover:scale-110 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
          unoptimized={video.thumbnail?.startsWith('http')}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo.webp';
          }}
        />

        <video
          ref={videoRefLocal}
          muted
          loop
          playsInline
          preload="none"
          className={`w-full h-full object-cover transition-opacity duration-700 group-hover:scale-110 absolute inset-0 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src={video.videoUrl} type="video/mp4" />
        </video>

        {/* Modern Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-40 pointer-events-none" />
      </div>

      {/* Interaction UI */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100 pointer-events-none">
        <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 text-white">
          <Play className="h-6 w-6 fill-white ml-1" />
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-5 left-5 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 pointer-events-none">
        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[8px] font-black text-white uppercase tracking-widest">Story</span>
      </div>

      {/* Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10 text-left">
        <span className="text-emerald-400 text-[8px] font-black uppercase tracking-widest block mb-1 leading-none">
          {video.vendor?.name || 'Local Farmer'}
        </span>
        <h3 className="text-white font-black text-base md:text-lg leading-tight mb-2 uppercase tracking-tight group-hover:text-amber-400 transition-colors truncate">
          {video.title}
        </h3>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex flex-col">
            <span className="text-white/40 text-[8px] font-black uppercase tracking-widest">Featured</span>
            <span className="text-white font-black text-lg">₹{video.price || video.product?.price || '99'}+</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-white text-emerald-950 flex items-center justify-center shadow-lg group-hover:bg-amber-400 transition-all duration-300">
            <ShoppingCart className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
});

VideoReelItem.displayName = 'VideoReelItem';

const ShopByVideo = () => {
  const { data: videos, error, isLoading } = useSWR(`${API_URL}/api/videos/active`, fetcher);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  
  // Reels Viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-scroll logic for video carousel
  useEffect(() => {
    if (isPaused || !videos || !videos.length || viewerOpen) return;

    const SCROLL_STEP = 300; // Approx video card width
    const scrollRight = () => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
      }
    };

    timerRef.current = setInterval(scrollRight, 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, videos, viewerOpen]);

  const displayVideos = Array.isArray(videos) ? videos : [];

  if (isLoading || (!displayVideos.length && !error)) return null;

  return (
    <section className="w-full relative overflow-hidden py-4 md:py-8 bg-white z-10">
      <div className="standard-container relative z-10">
        {/* Header - Standardized Category Style */}
        <div className="flex flex-col mb-6 md:mb-10">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-5">Visual Commerce</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-3xl md:text-5xl font-black text-emerald-950 tracking-tighter uppercase leading-[1.2] text-left">
              Shop by <span className="text-amber-500 italic lowercase font-serif font-normal">video</span>
            </h2>
            <Link
              href="/videos"
              className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-emerald-950 hover:text-amber-500 transition-colors"
            >
              Explore all stories <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Video Reel Grid/Carousel */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="flex gap-4 md:gap-8 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory px-1 scroll-smooth"
        >
          {displayVideos.map((video: any, index: number) => (
            <VideoReelItem
              key={video.id}
              video={video}
              isHovered={hoveredId === video.id}
              onHoverStart={() => setHoveredId(video.id)}
              onHoverEnd={() => setHoveredId(null)}
              onClick={() => {
                setInitialIndex(index);
                setViewerOpen(true);
              }}
            />
          ))}
        </div>

        <div className="flex justify-center mt-2">
          <Link href="/videos" className="h-14 px-10 rounded-full border border-slate-200 bg-white text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all flex items-center gap-3">
            Explore All Stories <ArrowRight size={14} />
          </Link>
        </div>

        {/* Fullscreen Cinematic Reels Viewer */}
        <ReelsViewer
          videos={displayVideos}
          initialIndex={initialIndex}
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      </div>
    </section>
  );
};

export default ShopByVideo;
