'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  X, Play, Pause, Volume2, VolumeX, Heart, Share2, 
  ShoppingBag, ChevronUp, ChevronDown, RefreshCw, 
  AlertCircle, Check, ShoppingCart, HelpCircle, Loader2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { API_URL } from '@/lib/api';
import toast from 'react-hot-toast';

interface ProductItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  slug: string;
}

interface VideoItem {
  id: number;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnail?: string;
  productId?: number;
  price?: number;
  tags: string[];
  viewCount: number;
  likes: number;
  publishStatus: string;
  aiMetadata?: {
    captions?: string;
    seoTitle?: string;
    seoKeywords?: string;
    seoDescription?: string;
  };
  product?: ProductItem;
  vendor?: { name: string; logo?: string };
  category?: { name: string };
  relatedProducts?: ProductItem[];
}

interface ReelsViewerProps {
  videos: VideoItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReelsViewer({ videos, initialIndex, isOpen, onClose }: ReelsViewerProps) {
  const { addToCart } = useCart();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [videoError, setVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showCenterIcon, setShowCenterIcon] = useState(false);
  const [showProductsDrawer, setShowProductsDrawer] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  
  // Track liked status locally to allow instant heart pop animations
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
  const [likesCountMap, setLikesCountMap] = useState<Record<number, number>>({});

  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartY = useRef<number>(0);
  const scrollCooldown = useRef<boolean>(false);

  const activeVideo = videos[activeIndex];

  // Sync index when initialIndex changes
  useEffect(() => {
    setActiveIndex(initialIndex);
    setVideoError(false);
    setProgress(0);
    setIsPlaying(true);
  }, [initialIndex]);

  // Track page views and likes
  useEffect(() => {
    if (!isOpen || !activeVideo) return;

    // Increment view count in backend
    fetch(`${API_URL}/api/videos/${activeVideo.id}/view`, { method: 'POST' })
      .catch(err => console.debug('Failed to increment view count', err));

    // Reset error state and progress for new video
    setVideoError(false);
    setProgress(0);
    setIsPlaying(true);

    // Auto-initialize likes count
    if (likesCountMap[activeVideo.id] === undefined) {
      setLikesCountMap(prev => ({
        ...prev,
        [activeVideo.id]: activeVideo.likes || 0
      }));
    }

    // Play video
    const timer = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.load();
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.debug('Autoplay prevented or interrupted', err);
          });
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [activeIndex, isOpen]);

  // Keyboard navigation listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, isPlaying]);

  if (!isOpen || !activeVideo) return null;

  // Next / Prev functions
  const handleNext = () => {
    if (videos.length <= 1) return;
    setActiveIndex(prev => (prev + 1 < videos.length ? prev + 1 : 0));
    setShowProductsDrawer(false);
  };

  const handlePrev = () => {
    if (videos.length <= 1) return;
    setActiveIndex(prev => (prev - 1 >= 0 ? prev - 1 : videos.length - 1));
    setShowProductsDrawer(false);
  };

  // Play Pause Toggle
  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const el = videoRef.current;
    if (el) {
      if (isPlaying) {
        el.pause();
        setIsPlaying(false);
      } else {
        const playPromise = el.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => console.debug('Toggle play interrupted', err));
        }
        setIsPlaying(true);
      }
      setShowCenterIcon(true);
      setTimeout(() => setShowCenterIcon(false), 800);
    }
  };

  // Touch Swipe Handlers for Mobile Reels
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(deltaY) > 60) {
      if (deltaY < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // Desktop Mouse Wheel Navigation
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (scrollCooldown.current) return;
    
    scrollCooldown.current = true;
    setTimeout(() => {
      scrollCooldown.current = false;
    }, 800); // 800ms cooldown to prevent rapid scrolling

    if (e.deltaY > 30) {
      handleNext();
    } else if (e.deltaY < -30) {
      handlePrev();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  // Like video
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const vid = activeVideo.id;
    const currentlyLiked = likedMap[vid] || false;
    
    // Toggle
    setLikedMap(prev => ({ ...prev, [vid]: !currentlyLiked }));
    setLikesCountMap(prev => ({
      ...prev,
      [vid]: (prev[vid] || 0) + (currentlyLiked ? -1 : 1)
    }));

    if (!currentlyLiked) {
      try {
        await fetch(`${API_URL}/api/videos/${vid}/like`, { method: 'POST' });
      } catch (err) {
        console.error('Failed to register like on server', err);
      }
    }
  };

  // Share video link
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/videos?active=${activeVideo.id}`;
    if (navigator.share) {
      navigator.share({
        title: activeVideo.title,
        text: activeVideo.description || 'Watch this shoppable video story on Namma Ooru Foods!',
        url: shareUrl
      }).catch(err => console.debug('Error sharing', err));
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Story link copied to clipboard!', {
        position: 'bottom-center',
        style: {
          background: '#064e3b',
          color: '#fff',
          fontSize: '11px',
          fontWeight: 'bold',
          borderRadius: '30px',
        }
      });
    }
  };

  // Aggregate tagged products
  const taggedProducts: ProductItem[] = [];
  if (activeVideo.product) {
    taggedProducts.push(activeVideo.product);
  }
  if (activeVideo.relatedProducts && activeVideo.relatedProducts.length > 0) {
    activeVideo.relatedProducts.forEach((rp) => {
      if (!taggedProducts.some(p => p.id === rp.id)) {
        taggedProducts.push(rp);
      }
    });
  }

  // Add to cart helper
  const handleAddToCart = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image || '/logo.webp',
      variant: ''
    });
    
    toast.success(`${product.name} added to cart!`, {
      icon: '🛒',
      position: 'bottom-center',
      style: {
        background: '#065f46',
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: 'bold',
        borderRadius: '50px',
        padding: '12px 24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-[#020617] flex flex-col items-center justify-center overflow-hidden font-sans"
    >
      {/* Background Ambient Blur - Desktop Only */}
      <div className="absolute inset-0 opacity-20 blur-[130px] pointer-events-none hidden md:block select-none">
        <div className="absolute top-0 left-0 w-full h-full bg-emerald-700 rounded-full translate-x-[-30%] translate-y-[-30%]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-amber-500 rounded-full translate-x-[30%] translate-y-[30%]" />
      </div>

      {/* Main Container: Handles touch swipes and mouse wheels */}
      <div 
        className="w-full h-full md:h-[90vh] md:max-w-[440px] md:rounded-[2.5rem] bg-black overflow-hidden shadow-2xl relative flex items-center justify-center cursor-pointer select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onClick={togglePlay}
      >
        {/* Loading Spinner Behind Video */}
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 pointer-events-none">
          <Loader2 className="h-10 w-10 text-emerald-500 animate-spin opacity-40" />
        </div>

        {/* Video Player Frame */}
        <video
          ref={videoRef}
          src={activeVideo.videoUrl}
          className="absolute inset-0 w-full h-full object-cover z-10"
          loop
          muted={isMuted}
          playsInline
          controls={false}
          onTimeUpdate={handleTimeUpdate}
          onError={() => setVideoError(true)}
        />

        {/* Standardized Bottom Story Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-[2010] overflow-hidden flex">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Top Header Overlay */}
        <div className="absolute top-4 left-0 right-0 px-5 flex items-center justify-between z-[2005] pointer-events-none bg-gradient-to-b from-black/75 to-transparent pb-12">
          <div className="flex items-center gap-3">
            <div className="h-9 px-4 bg-black/30 backdrop-blur-md rounded-full border border-white/10 flex items-center shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Namma Ooru Stories</span>
            </div>
            {activeVideo.category?.name && (
              <span className="px-3 py-1.5 bg-emerald-600/80 backdrop-blur-md text-[8px] font-black text-white uppercase tracking-widest rounded-full shadow-md">
                {activeVideo.category.name}
              </span>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-lg pointer-events-auto transition-transform active:scale-90 hover:bg-white/20"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mute and Captions Floating Toggles */}
        <div className="absolute top-16 right-4 flex flex-col gap-2 z-[2006] pointer-events-auto">
          <button
            onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
            className="h-9 w-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all hover:bg-white/10 active:scale-90 shadow-md"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          
          {activeVideo.aiMetadata?.captions && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowCaptions(!showCaptions); }}
              className={`h-9 w-9 rounded-full backdrop-blur-md flex items-center justify-center text-white border transition-all active:scale-90 shadow-md ${
                showCaptions ? 'bg-emerald-600/80 border-emerald-500' : 'bg-black/40 border-white/20 hover:bg-white/10'
              }`}
              title="Toggle Captions"
            >
              <span className="text-[8px] font-black tracking-tighter">CC</span>
            </button>
          )}
        </div>

        {/* Center Play/Pause Indicator Ripple */}
        <AnimatePresence>
          {showCenterIcon && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.6 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <div className="h-16 w-16 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                {isPlaying 
                  ? <Play className="h-8 w-8 text-white fill-white ml-0.5" /> 
                  : <Pause className="h-8 w-8 text-white fill-white" />
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vertical Action Bar (TikTok / Reels Style Right Aligned) */}
        <div className="absolute right-4 bottom-24 flex flex-col items-center gap-5 z-[2006] pointer-events-auto">
          {/* Like Action */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleLike}
              className={`h-11 w-11 rounded-full flex items-center justify-center border transition-all active:scale-90 shadow-lg ${
                likedMap[activeVideo.id] 
                  ? 'bg-red-500/20 border-red-500/50 text-red-500' 
                  : 'bg-black/40 border-white/20 text-white hover:bg-white/10'
              }`}
            >
              <Heart size={20} fill={likedMap[activeVideo.id] ? 'currentColor' : 'none'} className={likedMap[activeVideo.id] ? 'animate-heart-pop' : ''} />
            </button>
            <span className="text-[9px] font-black text-white/90 uppercase tracking-widest drop-shadow-lg">
              {likesCountMap[activeVideo.id] !== undefined ? likesCountMap[activeVideo.id] : (activeVideo.likes || 0)}
            </span>
          </div>

          {/* Tagged Products Checkout Launcher */}
          {taggedProducts.length > 0 && (
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); setShowProductsDrawer(true); }}
                className={`h-11 w-11 rounded-full flex items-center justify-center border transition-all active:scale-90 shadow-lg bg-emerald-600/80 border-emerald-500 text-white animate-bounce-slow`}
              >
                <ShoppingBag size={18} />
              </button>
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest drop-shadow-lg animate-pulse">
                Shop ({taggedProducts.length})
              </span>
            </div>
          )}

          {/* Share Action */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleShare}
              className="h-11 w-11 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white transition-all hover:bg-white/10 active:scale-90 shadow-lg"
            >
              <Share2 size={18} />
            </button>
            <span className="text-[9px] font-black text-white/90 uppercase tracking-widest drop-shadow-lg">Share</span>
          </div>
        </div>

        {/* CC Subtitles Render on Screen */}
        {showCaptions && activeVideo.aiMetadata?.captions && (
          <div className="absolute bottom-24 left-6 right-16 z-20 pointer-events-none text-center">
            <span className="bg-black/70 text-amber-300 font-bold px-4 py-2 rounded-xl text-xs border border-white/15 drop-shadow-lg leading-relaxed inline-block max-w-[90%]">
              " {activeVideo.aiMetadata.captions} "
            </span>
          </div>
        )}

        {/* Video Metadata Panel at Bottom Left */}
        <div className={`absolute bottom-6 left-5 right-16 z-[2005] pointer-events-none flex flex-col gap-2.5 transition-opacity duration-300 ${
          videoError || showProductsDrawer ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          {/* Brand Vendor Header */}
          {activeVideo.vendor?.name && (
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 leading-none drop-shadow-md">
              Brand: {activeVideo.vendor.name}
            </span>
          )}

          {/* Video Title */}
          <h3 className="text-white font-black text-lg md:text-xl tracking-tight leading-tight uppercase drop-shadow-lg">
            {activeVideo.title}
          </h3>

          {/* Video Description */}
          {activeVideo.description && (
            <p className="text-white/70 text-xs font-semibold line-clamp-2 leading-relaxed max-w-[90%] drop-shadow-md">
              {activeVideo.description}
            </p>
          )}

          {/* Display Primary Product Shortcut Tag */}
          {activeVideo.product && (
            <div 
              onClick={(e) => { e.stopPropagation(); setShowProductsDrawer(true); }}
              className="flex items-center gap-2.5 bg-black/40 backdrop-blur-md border border-white/10 p-2 rounded-2xl w-fit pointer-events-auto hover:bg-white/10 active:scale-95 transition-all mt-1"
            >
              <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-white/15">
                <img src={activeVideo.product.image || '/logo.webp'} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-black text-white/50 uppercase leading-none tracking-wider">Tap to Shop</span>
                <span className="text-[11px] font-bold text-white max-w-[120px] truncate">{activeVideo.product.name}</span>
                <span className="text-emerald-400 font-black text-xs leading-none mt-1">₹{activeVideo.product.price}</span>
              </div>
            </div>
          )}
        </div>

        {/* UP & DOWN Arrow Overlay Navigators (For desktop visibility) */}
        {videos.length > 1 && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-[2006] pointer-events-auto hidden md:flex">
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="h-8 w-8 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center hover:bg-white/15 active:scale-90 shadow-md"
              title="Previous Story"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="h-8 w-8 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center hover:bg-white/15 active:scale-90 shadow-md"
              title="Next Story"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        )}

        {/* Fallback Screen Overlay (Permanent replacement for Access Restricted) */}
        <AnimatePresence>
          {videoError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[2015] flex flex-col items-center justify-center p-6 text-center bg-black/85 backdrop-blur-xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-zinc-900 border border-white/10 p-6 rounded-[2.5rem] shadow-2xl w-[90%] max-w-sm flex flex-col items-center">
                <div className="h-14 w-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
                  <AlertCircle className="h-7 w-7 text-amber-500 animate-bounce-slow" />
                </div>
                <h3 className="text-white text-base font-black mb-1.5 uppercase tracking-wider">Video Unavailable</h3>
                <p className="text-white/50 font-semibold text-[11px] leading-relaxed mb-5">
                  The video file is undergoing maintenance. You can retry loading it or check other popular stories.
                </p>
                
                {/* Fallback Action Buttons */}
                <div className="flex gap-3 w-full mb-6">
                  <button
                    onClick={() => {
                      setVideoError(false);
                      setProgress(0);
                      if (videoRef.current) {
                        videoRef.current.load();
                        const play = videoRef.current.play();
                        if (play !== undefined) play.catch(() => {});
                      }
                    }}
                    className="flex-1 py-3 bg-white text-slate-900 font-black uppercase text-[9px] tracking-widest rounded-full hover:bg-zinc-200 transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
                  >
                    <RefreshCw size={11} /> Retry
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-zinc-800 text-white font-black uppercase text-[9px] tracking-widest rounded-full hover:bg-zinc-700 transition-all active:scale-95 border border-white/10"
                  >
                    Close
                  </button>
                </div>

                {/* Suggested Stories carousel inside failure popup */}
                {videos.length > 1 && (
                  <div className="w-full text-left">
                    <h4 className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 border-b border-white/5 pb-2">Suggested Stories</h4>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                      {videos
                        .filter((_, idx) => idx !== activeIndex)
                        .slice(0, 4)
                        .map((v) => {
                          const originalIdx = videos.findIndex((item) => item.id === v.id);
                          return (
                            <div 
                              key={v.id}
                              onClick={() => {
                                setActiveIndex(originalIdx);
                                setVideoError(false);
                              }}
                              className="relative h-16 w-12 rounded-xl bg-zinc-800 overflow-hidden shrink-0 cursor-pointer border border-white/10 hover:border-emerald-500 transition-all hover:scale-105 active:scale-95"
                            >
                              <img 
                                src={v.thumbnail || '/logo.webp'} 
                                alt="" 
                                className="h-full w-full object-cover" 
                                onError={(e) => {
                                  // Fallback image source if thumbnail also fails
                                  (e.target as HTMLImageElement).src = '/logo.webp';
                                }}
                              />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tagged Products Drawer (Slide Up Bottom Sheet) */}
        <AnimatePresence>
          {showProductsDrawer && (
            <>
              {/* Drawer backdrop */}
              <div 
                className="absolute inset-0 bg-black/40 z-[2020] pointer-events-auto"
                onClick={(e) => { e.stopPropagation(); setShowProductsDrawer(false); }}
              />
              
              {/* Drawer Container */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="absolute bottom-0 inset-x-0 bg-white rounded-t-[2.5rem] z-[2025] max-h-[75%] flex flex-col p-6 pointer-events-auto shadow-2xl border-t border-slate-100"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header Handler */}
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 shrink-0" />
                
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 shrink-0">
                  <div className="flex flex-col">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-800">Tagged Products</h4>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Shop directly from story</span>
                  </div>
                  <button 
                    onClick={() => setShowProductsDrawer(false)}
                    className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all active:scale-95"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Products List scrollable wrapper */}
                <div className="overflow-y-auto space-y-3.5 pb-6 max-h-[300px]">
                  {taggedProducts.map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-3 rounded-2xl hover:bg-emerald-50/20 transition-all duration-300"
                    >
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                        <img 
                          src={product.image || '/logo.webp'} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo.webp';
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0 text-left">
                        <h5 className="font-black text-xs text-slate-800 leading-tight truncate">{product.name}</h5>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Source Partner</p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-emerald-700 font-black text-sm">₹{product.price}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-[10px] text-slate-400 line-through">₹{product.originalPrice}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          className="h-10 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-600/10 transition-all active:scale-95"
                        >
                          <ShoppingCart size={11} /> Add
                        </button>
                        <Link 
                          href={`/products/detail?id=${product.id}`}
                          onClick={() => {
                            setShowProductsDrawer(false);
                            onClose();
                          }}
                          className="h-8 px-4 border border-slate-200 text-slate-500 rounded-xl text-[8px] font-black uppercase tracking-wider flex items-center justify-center hover:bg-white transition-all"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes heart-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .animate-heart-pop {
          animation: heart-pop 0.3s ease-in-out;
        }
        .animate-bounce-slow {
          animation: bounce 2.5s infinite;
        }
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
      `}</style>
    </motion.div>
  );
}
