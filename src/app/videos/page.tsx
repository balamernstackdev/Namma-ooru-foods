'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, ShoppingCart, X, Maximize2, Pause, Volume2, VolumeX, ArrowLeft, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function VideoGalleryPage() {
  const { data: videos, isLoading } = useSWR(`${API_URL}/api/videos/active`, fetcher);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showCenterIcon, setShowCenterIcon] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const displayVideos = Array.isArray(videos) ? videos.filter((v: any) => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

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

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      {/* Premium Header Section */}
      <div className="bg-emerald-950 text-white py-20 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10">
          <Image 
            src="/ai_images/cinematic_farm_1776230966841.png" 
            alt="Farm Background" 
            fill 
            className="object-cover" 
          />
        </div>
        <div className="standard-container relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest mb-8 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-6 leading-none">
              Story <span className="text-amber-400 italic">Hub</span>
            </h1>
            <p className="text-lg md:text-2xl text-emerald-100/70 font-medium leading-relaxed">
              Experience the journey of your food through cinematic video stories. Shop directly from the source.
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
              className="w-full h-14 pl-14 pr-6 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-emerald-500/20 font-medium text-slate-700"
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
              <div key={i} className="aspect-[9/14] rounded-[2.5rem] bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayVideos.map((video: any) => (
              <motion.div
                key={video.id}
                layoutId={`video-${video.id}`}
                onClick={() => {
                  setActiveVideo(video);
                  setVideoError(false);
                }}
                className="relative aspect-[9/14] rounded-[2.5rem] overflow-hidden shadow-xl group cursor-pointer border-4 border-white hover:-translate-y-2 transition-all duration-500"
              >
                <div className="absolute inset-0 z-0">
                  {video.thumbnail ? (
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      className="object-cover transition-transform duration-[1500ms] group-hover:scale-110"
                    />
                  ) : (
                    <video
                      src={video.videoUrl}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                    <Play className="h-8 w-8 fill-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="text-white font-bold text-xl leading-tight mb-3">{video.title}</h3>
                  {video.price && <span className="text-white font-black text-2xl">₹{video.price}</span>}
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

      {/* Video Player Modal - Shared Logic */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#020617] flex flex-col items-center justify-center overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 p-10 flex items-center justify-between z-[2005]">
              <div className="flex items-center gap-4">
                <Image src="/logo.webp" alt="Logo" width={120} height={40} className="brightness-0 invert" />
              </div>
              <button
                onClick={closeVideo}
                className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-xl hover:bg-white/20 flex items-center justify-center text-white transition-all border border-white/10"
              >
                <X size={32} />
              </button>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full md:h-[85vh] md:max-w-[450px] md:aspect-[9/16] bg-black md:rounded-[3rem] overflow-hidden shadow-2xl border border-white/10"
              onClick={togglePlay}
            >
              <video
                ref={videoRef}
                src={activeVideo.videoUrl}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onError={() => setVideoError(true)}
              />

              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                <motion.div
                  className="h-full bg-amber-400"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {showCenterIcon && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-24 w-24 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                    {isPlaying ? <Play className="h-12 w-12 text-white fill-white" /> : <Pause className="h-12 w-12 text-white fill-white" />}
                  </div>
                </div>
              )}

              <button
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                className="absolute bottom-32 right-6 h-12 w-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-12 gap-8">
                <div className="space-y-3">
                  <h2 className="text-4xl font-black text-white">{activeVideo.title}</h2>
                  <p className="text-white/60 text-sm font-medium">Experience the journey of our harvest stories.</p>
                </div>

                <div className="flex items-center gap-4">
                  {activeVideo.productId && (
                    <Link href={`/products/${activeVideo.productId}`} onClick={closeVideo} className="flex-1">
                      <button className="w-full h-20 rounded-[1.5rem] bg-white text-emerald-950 font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-amber-400 transition-all">
                        Explore Details <Maximize2 size={20} />
                      </button>
                    </Link>
                  )}
                  <button className="h-20 w-20 rounded-[1.5rem] bg-emerald-600 text-white flex items-center justify-center shadow-2xl hover:bg-emerald-500">
                    <ShoppingCart size={28} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
