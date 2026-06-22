'use client';

import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { 
  ChevronLeft, ChevronRight, Copy, Check, Zap, Truck, Tag, 
  Sparkles, Flame, Star, Store, Gift, ArrowRight 
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface Announcement {
  id: number;
  title: string;
  message: string;
  couponCode: string | null;
  buttonText: string | null;
  redirectUrl: string | null;
  offerType: string;
  bgColor: string;
  textColor: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priorityOrder: number;
  vendorId: number | null;
  categoryId: number | null;
  productId: number | null;
  announcementType?: string;
}

export default function AnnouncementBar() {
  const router = useRouter();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const productIdFromUrl = searchParams ? searchParams.get('id') : null;


  // Extract category ID from pathname if we are on a category details page: /categories/123
  const categoryMatch = pathname.match(/\/categories\/(\d+)/);
  const currentCategoryId = categoryMatch ? parseInt(categoryMatch[1]) : null;

  // Load product context if on product detail page
  const [productVendorId, setProductVendorId] = useState<number | null>(null);
  const [productCategoryId, setProductCategoryId] = useState<number | null>(null);
  const [productId, setProductId] = useState<number | null>(null);

  // Async brand page & head vendor page contexts
  const [brandVendorId, setBrandVendorId] = useState<number | null>(null);
  const [headVendorId, setHeadVendorId] = useState<number | null>(null);
  const [headVendorSubIds, setHeadVendorSubIds] = useState<number[]>([]);

  useEffect(() => {
    if (pathname.includes('/products/detail') && productIdFromUrl) {
      fetch(`${API_URL}/api/products/${productIdFromUrl}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setProductVendorId(data.brandId || data.subVendorId || null);
            setProductCategoryId(data.categoryId || null);
            setProductId(data.id || null);
          }
        })
        .catch(err => console.error(err));
    } else {
      setProductVendorId(null);
      setProductCategoryId(null);
      setProductId(null);
    }
  }, [pathname, productIdFromUrl]);

  // Load sub-vendor (brand) context if on brand page
  useEffect(() => {
    const brandMatch = pathname.match(/\/brands\/([^/]+)/);
    if (brandMatch) {
      const brandIdOrSlug = brandMatch[1];
      fetch(`${API_URL}/api/sub-vendors/${brandIdOrSlug}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setBrandVendorId(data.id || null);
          }
        })
        .catch(err => console.error(err));
    } else {
      setBrandVendorId(null);
    }
  }, [pathname]);

  // Load head-vendor context and sub-vendor IDs if on head-vendor page
  useEffect(() => {
    const vendorMatch = pathname.match(/\/vendors\/([^/]+)/);
    const sellerMatch = pathname.match(/\/sellers\/detail/);
    const vendorIdOrSlug = vendorMatch ? vendorMatch[1] : (sellerMatch ? searchParams?.get('slug') : null);
    
    if (vendorIdOrSlug) {
      fetch(`${API_URL}/api/head-vendors/${vendorIdOrSlug}`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setHeadVendorId(data.id || null);
            if (Array.isArray(data.subVendors)) {
              setHeadVendorSubIds(data.subVendors.map((sv: any) => sv.id));
            } else {
              setHeadVendorSubIds([]);
            }
          }
        })
        .catch(err => console.error(err));
    } else {
      setHeadVendorId(null);
      setHeadVendorSubIds([]);
    }
  }, [pathname]);

  const { data: rawOffers, error } = useSWR<Announcement[]>(
    `${API_URL}/api/offer-announcements?activeOnly=true`, 
    fetcher,
    { refreshInterval: 30000 } // refresh every 30s
  );

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: string | null }>({});
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Tracked views in current session to prevent duplicate views
  const trackedViews = useRef<Set<number>>(new Set());

  const offers = React.useMemo(() => {
    if (!Array.isArray(rawOffers)) return [];
    
    const activeCategoryId = currentCategoryId || productCategoryId;
    const activeProductId = productId;

    // Filter offers based on context and placement type
    const filtered = rawOffers.filter(ann => {
      // Check display type compatibility: TOP_ANNOUNCEMENT_BAR or legacy ADMIN/VENDOR
      const isTopBar = ann.announcementType === 'TOP_ANNOUNCEMENT_BAR' || 
                        ann.announcementType === 'ADMIN' || 
                        ann.announcementType === 'VENDOR' || 
                        !ann.announcementType;
      if (!isTopBar) return false;

      // 1. If it's a global announcement (no targeting specs), always show it
      if (!ann.vendorId && !ann.categoryId && !ann.productId) {
        return true;
      }
      // 2. If targeted to product, match current product ID
      if (ann.productId && ann.productId === activeProductId) {
        return true;
      }
      // 3. If targeted to category, match current category ID
      if (ann.categoryId && ann.categoryId === activeCategoryId) {
        return true;
      }
      // 4. If targeted to vendor, match brand page, product vendor, head-vendor, or its sub-vendors
      if (ann.vendorId) {
        if (ann.vendorId === brandVendorId) return true;
        if (ann.vendorId === productVendorId) return true;
        if (ann.vendorId === headVendorId) return true;
        if (headVendorSubIds.includes(ann.vendorId)) return true;
      }
      
      return false;
    });

    // Sort by priorityOrder DESC, then ID DESC
    return [...filtered].sort((a, b) => {
      const priorityA = a.priorityOrder || 0;
      const priorityB = b.priorityOrder || 0;
      if (priorityB !== priorityA) {
        return priorityB - priorityA;
      }
      return b.id - a.id;
    });
  }, [rawOffers, brandVendorId, productVendorId, headVendorId, headVendorSubIds, currentCategoryId, productCategoryId, productId]);

  // Set height custom property dynamically
  useEffect(() => {
    const updateHeight = () => {
      if (offers.length === 0) {
        document.documentElement.style.setProperty('--announcement-bar-height', '0px');
        return;
      }
      
      const width = window.innerWidth;
      const height = width < 768 ? '36px' : '40px';
      document.documentElement.style.setProperty('--announcement-bar-height', height);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => {
      window.removeEventListener('resize', updateHeight);
      document.documentElement.style.setProperty('--announcement-bar-height', '0px');
    };
  }, [offers]);

  // Detect mobile view for scrolling speed
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Analytics view tracking function
  const trackView = async (id: number) => {
    if (trackedViews.current.has(id)) return;
    trackedViews.current.add(id);
    try {
      await fetch(`${API_URL}/api/offer-announcements/${id}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'view' })
      });
    } catch (err) {
      console.error('Failed to track offer view:', err);
    }
  };

  // Analytics click tracking function
  const trackClick = async (id: number) => {
    try {
      await fetch(`${API_URL}/api/offer-announcements/${id}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'click' })
      });
    } catch (err) {
      console.error('Failed to track offer click:', err);
    }
  };

  // Track view of all offers once they load
  useEffect(() => {
    if (offers.length > 0) {
      offers.forEach(offer => trackView(offer.id));
    }
  }, [offers]);

  // Countdown timer calculations
  useEffect(() => {
    if (offers.length === 0) return;

    const interval = setInterval(() => {
      const newTimeLeft: { [key: number]: string | null } = {};
      
      offers.forEach((offer) => {
        const difference = +new Date(offer.endDate) - +new Date();
        if (difference <= 0) {
          newTimeLeft[offer.id] = null;
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);

        if (days > 0) {
          newTimeLeft[offer.id] = `${days}d ${hours}h`;
        } else {
          newTimeLeft[offer.id] = `${hours}h ${minutes}m`;
        }
      });

      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [offers]);

  if (offers.length === 0 || error) return null;

  // We find the first offer that has a coupon code or a button to render static in the right section
  const staticOffer = offers.find(ann => ann.couponCode || ann.buttonText) || offers[0];

  const copyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Get offer emoji based on type
  const getOfferIcon = (type: string) => {
    switch (type) {
      case 'Coupon Offer': return '🎁';
      case 'Festival Offer': return '🎉';
      case 'Shipping Offer': return '🚚';
      case 'Vendor Promotion': return '⭐';
      case 'Flash Sale': return '⚡';
      case 'New Arrival': return '✨';
      case 'Combo Deal': return '🔥';
      default: return '📢';
    }
  };

  const renderTickerSet = (keySuffix: string) => (
    <div className="flex items-center gap-8 md:gap-12 shrink-0 pr-8 md:pr-12">
      {offers.map((ann, idx) => (
        <React.Fragment key={`${ann.id}-${keySuffix}-${idx}`}>
          <div className="flex items-center gap-2 text-[11px] md:text-xs font-bold whitespace-nowrap">
            <span className="text-[13px] md:text-sm select-none">{getOfferIcon(ann.offerType)}</span>
            <span>
              {ann.title && <span className="font-black mr-1">{ann.title}:</span>}
              <span className="font-medium opacity-95">{ann.message}</span>
            </span>
            {ann.offerType === 'Flash Sale' && timeLeft[ann.id] && (
              <span className="shrink-0 bg-black/25 px-1.5 py-0.5 rounded text-[8px] font-black text-amber-300 uppercase ml-1.5 animate-pulse select-none">
                Ends: {timeLeft[ann.id]}
              </span>
            )}
          </div>
          <span className="text-current opacity-40 select-none font-bold">•</span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div 
      style={{ backgroundColor: staticOffer.bgColor, color: staticOffer.textColor }}
      className="sticky top-0 left-0 right-0 z-[550] w-full flex items-center justify-between px-3 md:px-6 select-none transition-colors duration-500 overflow-hidden shadow-sm border-b border-black/10 h-[36px] md:h-[40px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        @keyframes marquee-ticker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>

      {/* LEFT SCROLLING TICKER */}
      <div className="flex-1 overflow-hidden min-w-0 h-full flex items-center relative">
        <div 
          className="flex whitespace-nowrap animate-marquee-container" 
          style={{ 
            animation: `marquee-ticker ${isMobile ? '50s' : '40s'} linear infinite`,
            animationPlayState: isHovered ? 'paused' : 'running'
          }}
        >
          {renderTickerSet('set1')}
          {renderTickerSet('set2')}
          {renderTickerSet('set3')}
          {renderTickerSet('set4')}
        </div>
      </div>

      {/* RIGHT STATIC BADGES / BUTTONS */}
      {(staticOffer.couponCode || staticOffer.buttonText) && (
        <div 
          style={{ backgroundColor: staticOffer.bgColor }}
          className="shrink-0 flex items-center gap-1.5 md:gap-2 pl-3 relative z-10 h-full shadow-[-12px_0_12px_-4px_rgba(0,0,0,0.15)]"
        >
          {/* Subtle fade overlay to transition the scrolling text */}
          <div 
            className="absolute top-0 bottom-0 -left-6 w-6 pointer-events-none"
            style={{ 
              background: `linear-gradient(to right, transparent, ${staticOffer.bgColor})` 
            }}
          />

          {/* COUPON COPY BADGE */}
          {staticOffer.couponCode && (
            <button 
              onClick={(e) => copyCode(e, staticOffer.couponCode!)}
              className="shrink-0 inline-flex items-center gap-1 bg-amber-400 hover:bg-amber-500 text-slate-900 px-2 py-0.5 rounded-full text-[8px] font-black uppercase select-all active:scale-95 transition-all border border-amber-300 shadow-sm"
            >
              {copiedCode === staticOffer.couponCode ? (
                <>
                  <Check size={8} className="stroke-[3]" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={8} />
                  Code: {staticOffer.couponCode}
                </>
              )}
            </button>
          )}

          {/* ACTION SHOP NOW BUTTON */}
          {staticOffer.buttonText && staticOffer.redirectUrl && (
            <button 
              onClick={(e) => { e.stopPropagation(); trackClick(staticOffer.id); router.push(staticOffer.redirectUrl!); }}
              className="shrink-0 inline-flex items-center gap-0.5 bg-amber-400 hover:bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider transition-all hover:translate-x-0.5 active:scale-95 shadow-sm"
            >
              {staticOffer.buttonText}
              <ArrowRight size={8} className="stroke-[3]" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
