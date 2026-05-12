'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, ShoppingCart, X, Maximize2, Pause, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const ShopByVideo = () => {
  const { data: videos, error, isLoading } = useSWR(`${API_URL}/api/videos/active`, fetcher);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showCenterIcon, setShowCenterIcon] = useState(false);

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
      setShowCenterIcon(true);
      setTimeout(() => setShowCenterIcon(false), 800);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const closeVideo = () => {
    setActiveVideo(null);
    setVideoError(false);
    setIsMuted(true);
    setIsPlaying(true);
    setProgress(0);
  };

  const displayVideos = Array.isArray(videos) ? videos : [];

  if (isLoading || (!displayVideos.length && !error)) return null;

  return (
    <section className={`w-full relative overflow-hidden py-4 md:py-8 bg-white ${activeVideo ? 'z-[9999]' : 'z-10'}`}>
      <div className="standard-container relative z-10">
        {/* Header - Standardized Category Style */}
        <div className="flex flex-col mb-6 md:mb-10">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-amber-500 mb-5">Visual Commerce</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="text-3xl md:text-5xl font-black text-emerald-950 tracking-tighter uppercase leading-[1.2]">
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
        <div className="flex gap-4 md:gap-8 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory px-1">
          {displayVideos.map((video: any) => (
            <motion.div
              key={video.id}
              whileHover={{ y: -8 }}
              onMouseEnter={() => setHoveredId(video.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => {
                setActiveVideo(video);
                setVideoError(false);
              }}
              className="relative flex-shrink-0 w-[180px] sm:w-[220px] md:w-[260px] aspect-[9/16] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden snap-start shadow-xl group cursor-pointer border border-slate-100 transition-all duration-500"
            >
              {/* Media Layer */}
              <div className="absolute inset-0 bg-slate-900">
                {/* Fallback to Thumbnail or Video Preview */}
                {video.thumbnail && hoveredId !== video.id ? (
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                  />
                ) : (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                  >
                    <source src={video.videoUrl} type="video/mp4" />
                  </video>
                )}
                {/* Modern Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-40" />
              </div>

              {/* Interaction UI */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 text-white">
                  <Play className="h-6 w-6 fill-white ml-1" />
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-5 left-5 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Story</span>
              </div>

              {/* Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h3 className="text-white font-black text-lg md:text-xl leading-tight mb-2 uppercase tracking-tight group-hover:text-amber-400 transition-colors">
                  {video.title}
                </h3>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-white/40 text-[8px] font-black uppercase tracking-widest">Featured</span>
                    <span className="text-white font-black text-lg">₹{video.price || '99'}+</span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-white text-emerald-950 flex items-center justify-center shadow-lg group-hover:bg-amber-400 transition-all duration-300">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>


        <div className="flex justify-center mt-2">
          <Link href="/videos" className="h-14 px-10 rounded-full border border-slate-200 bg-white text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all flex items-center gap-3">
            Explore All Stories <ArrowRight size={14} />
          </Link>
        </div>

        {/* Video Player Modal - Pro Cinema Edition */}
        <AnimatePresence>
          {activeVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center overflow-hidden font-sans"
            >
              {/* Cinematic Background Blur Blobs */}
              <div className="absolute inset-0 opacity-30 blur-[120px] pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-emerald-500 rounded-full translate-x-[-30%] translate-y-[-30%]" />
                <div className="absolute bottom-0 right-0 w-full h-full bg-amber-500 rounded-full translate-x-[30%] translate-y-[30%]" />
              </div>

              {/* Top Navigation Bar - Enhanced for Mobile */}
              <div className="absolute top-0 left-0 right-0 p-4 md:p-10 flex items-center justify-between z-[2005] bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-4 animate-in slide-in-from-top-10 duration-700">
                  <Link href="/" onClick={(e) => { e.preventDefault(); closeVideo(); }} className="transition-transform hover:scale-105 active:scale-95">
                    <Image src="/logo.webp" alt="Namma Orru" width={120} height={35} className="brightness-0 invert h-7 md:h-10 w-auto object-contain" />
                  </Link>
                  <div className="h-6 w-px bg-white/20 hidden md:block" />
                  <div className="hidden md:flex flex-col">
                    <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.3em]">Story Hub</span>
                    <span className="text-white text-[11px] font-bold uppercase tracking-tight">Direct Harvest</span>
                  </div>
                </div>
                <button
                  onClick={closeVideo}
                  className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-white/10 backdrop-blur-xl hover:bg-white/20 flex items-center justify-center text-white transition-all border border-white/10 shadow-2xl group"
                >
                  <X size={24} className="md:w-8 md:h-8 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              {/* Vertical Video Container - Responsive Edge-to-Edge on Mobile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="relative w-full h-full md:h-[85vh] md:max-w-[450px] md:aspect-[9/16] bg-black md:rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border-x md:border border-white/10 z-[2002] cursor-pointer"
                onClick={togglePlay}
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  crossOrigin="anonymous"
                  controls={false}
                  onTimeUpdate={handleTimeUpdate}
                  onError={() => setVideoError(true)}
                >
                  <source src={activeVideo.videoUrl} type="video/mp4" />
                </video>

                {/* Progress Bar (Amazon Style) */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20 z-10">
                  <motion.div
                    className="h-full bg-amber-400"
                    style={{ width: `${progress}%` }}
                    transition={{ type: 'spring', damping: 20 }}
                  />
                </div>

                {/* Play/Pause Center Indicator */}
                <AnimatePresence>
                  {showCenterIcon && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.5 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                    >
                      <div className="h-24 w-24 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                        {isPlaying ? <Play className="h-12 w-12 text-white fill-white" /> : <Pause className="h-12 w-12 text-white fill-white" />}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mute Toggle Control */}
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                  className="absolute bottom-32 right-6 h-12 w-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 z-30 transition-transform hover:scale-110 active:scale-90"
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                {/* Error State Overlay */}
                <AnimatePresence>
                  {videoError && (
                    <motion.div
                      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                      animate={{ opacity: 1, backdropFilter: 'blur(40px)' }}
                      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                      className="absolute inset-0 z-[2010] flex flex-col items-center justify-center p-8 text-center bg-black/60"
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/10 border border-white/20 p-10 rounded-[3rem] shadow-2xl max-w-[90%] flex flex-col items-center"
                      >
                        <div className="h-20 w-20 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center mb-6">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <X className="h-10 w-10 text-red-500" />
                          </motion.div>
                        </div>
                        <h3 className="text-white text-2xl md:text-3xl font-black mb-3 uppercase tracking-tight">Access Restricted</h3>
                        <p className="text-white/60 font-medium text-sm md:text-base leading-relaxed mb-8">
                          This story is currently undergoing maintenance or the source link has expired.
                          Please explore another harvest story or check back later.
                        </p>
                        <button
                          onClick={closeVideo}
                          className="px-10 py-5 bg-white text-emerald-950 font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-amber-400 hover:scale-105 transition-all shadow-xl active:scale-95"
                        >
                          Discover Other Stories
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Interaction Overlays - Pushed Up for Mobile Navigation Safety */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-6 md:p-12 pb-12 md:pb-12 gap-6 md:gap-8 transition-opacity duration-300 ${videoError ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em]">Live Selection</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none">{activeVideo.title}</h2>
                    <p className="text-white/60 text-xs md:text-base font-medium pr-6 leading-relaxed line-clamp-2 md:line-clamp-none">
                      Experience the pure heritage of our agrarian clusters through visual commerce.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 md:gap-4">
                    {activeVideo.productId && (
                      <Link href={`/products/${activeVideo.productId}`} onClick={closeVideo} className="flex-1">
                        <button className="w-full h-14 md:h-20 rounded-2xl md:rounded-[1.5rem] bg-white text-emerald-950 font-black uppercase text-[10px] md:text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-amber-400 transition-all shadow-premium active:scale-95">
                          Explore Details <Maximize2 size={16} className="md:w-5 md:h-5 text-emerald-600" />
                        </button>
                      </Link>
                    )}
                    <button className="h-14 w-14 md:h-20 md:w-20 rounded-2xl md:rounded-[1.5rem] bg-emerald-600 text-white flex items-center justify-center shadow-2xl hover:bg-emerald-500 transition-all active:scale-90 group shrink-0">
                      <ShoppingCart size={22} className="md:w-7 md:h-7 group-hover:rotate-12 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Ambient Info - Desktop Only */}
              <div className={`hidden lg:flex absolute right-20 top-1/2 -translate-y-1/2 flex-col gap-12 items-center text-white/20 transition-opacity duration-300 ${videoError ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl font-black italic">100%</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">Purity Index</span>
                </div>
                <div className="h-20 w-px bg-white/10" />
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl font-black italic">Live</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">Harvest Sync</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ShopByVideo;
