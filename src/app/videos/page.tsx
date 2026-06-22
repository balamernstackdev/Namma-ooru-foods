'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, ArrowLeft, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import ReelsViewer from '@/components/ReelsViewer';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { usePlatformSettings } from '@/context/PlatformSettingsContext';

const fetcher = (url: string) => fetch(url).then(res => res.json());

function VideoGalleryPageContent() {
  const searchParams = useSearchParams();
  const activeParam = searchParams.get('active');

  const { data: videos, isLoading } = useSWR(`${API_URL}/api/videos/active`, fetcher);
  const [searchQuery, setSearchQuery] = useState('');
  const { settings } = usePlatformSettings();
  
  // Reels Viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const displayVideos = Array.isArray(videos) ? videos.filter((v: any) =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Deep linking to open specific video on page load if active param is provided in URL
  useEffect(() => {
    if (activeParam && Array.isArray(videos) && videos.length > 0) {
      const activeId = Number(activeParam);
      const matchedIndex = videos.findIndex((v: any) => v.id === activeId);
      if (matchedIndex !== -1) {
        setInitialIndex(matchedIndex);
        setViewerOpen(true);
      }
    }
  }, [activeParam, videos]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      {/* Premium Header Section */}
      <div className="bg-emerald-950 text-white py-20 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://s3.ap-south-1.amazonaws.com/namma-orru-foods/ai_assets/Artisan_Marketplace_Banner.png"
            alt="Farm Background"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="standard-container relative z-10 text-left">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest mb-8 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6 leading-none uppercase">
              Story <span className="text-amber-400 italic font-serif font-normal lowercase">hub</span>
            </h1>
            <p className="text-lg md:text-2xl text-emerald-100/70 font-semibold leading-relaxed">
              Experience the journey of our ingredients through cinematic short videos. Shop directly from our village clusters.
            </p>
          </div>
        </div>
      </div>

      <div className="standard-container">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12 bg-white p-4 rounded-[2rem] shadow-premium border border-slate-100">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-14 pr-6 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 font-bold text-slate-700 text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {displayVideos.length} Stories Available
            </span>
            <button className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Video Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[9/16] rounded-[2.5rem] bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayVideos.map((video: any, index: number) => (
              <motion.div
                key={video.id}
                onClick={() => {
                  setInitialIndex(index);
                  setViewerOpen(true);
                }}
                className="relative aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-xl group cursor-pointer border-4 border-white hover:-translate-y-2 transition-all duration-500 bg-slate-900"
              >
                <div className="absolute inset-0 z-0">
                  <Image
                    src={video.thumbnail || settings.logo || '/logo.webp'}
                    alt={video.title}
                    fill
                    className="object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                    unoptimized={video.thumbnail?.startsWith('http')}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = settings.logo || '/logo.webp';
                    }}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Play Button Icon on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                    <Play className="h-8 w-8 fill-white ml-1" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 text-left">
                  {video.vendor?.name && (
                    <span className="text-[8.5px] font-black uppercase tracking-[0.2em] text-emerald-400 block mb-1">
                      {video.vendor.name}
                    </span>
                  )}
                  <h3 className="text-white font-black text-lg leading-tight mb-3 truncate">{video.title}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-black text-2xl">₹{video.price || video.product?.price || '99'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && displayVideos.length === 0 && (
          <div className="py-40 text-center">
            <h3 className="text-2xl font-bold text-slate-400 mb-2">No stories found</h3>
            <p className="text-slate-500">Try a different search term or check back later.</p>
          </div>
        )}
      </div>

      {/* Shared Fullscreen Reels Viewer */}
      <ReelsViewer
        videos={displayVideos}
        initialIndex={initialIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
}

export default function VideoGalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 pt-24 pb-20 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    }>
      <VideoGalleryPageContent />
    </Suspense>
  );
}
