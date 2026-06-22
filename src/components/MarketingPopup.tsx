'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Gift, ArrowRight, Sparkles, Mail, CheckCircle2, Ticket, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const MarketingPopup = () => {
  const { user } = useAuth();
  const pathname = usePathname() || '';
  const [isVisible, setIsVisible] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch active popup campaign
  const { data: campaign, error } = useSWR(
    `${API_URL}/api/popup-campaigns/active`,
    fetcher,
    { refreshInterval: 30000 }
  );

  useEffect(() => {
    if (!campaign) {
      setIsVisible(false);
      return;
    }

    // Rule: Do not show on checkout, cart, or payment pages
    const path = pathname.toLowerCase();
    if (path.includes('/checkout') || path.includes('/payment') || path.includes('/cart')) {
      setIsVisible(false);
      return;
    }

    // Rule: Target Audience checks
    const isLoggedIn = !!user;
    if (campaign.onlyGuest && isLoggedIn) {
      setIsVisible(false);
      return;
    }
    if (campaign.onlyLoggedIn && !isLoggedIn) {
      setIsVisible(false);
      return;
    }

    // Rule: Frequency Cap checks
    const sessionKey = `hasSeenPopup_camp_session_${campaign.id}`;
    const userKey = `hasSeenPopup_camp_user_${campaign.id}`;

    if (campaign.oncePerSession && sessionStorage.getItem(sessionKey)) {
      setIsVisible(false);
      return;
    }
    if (campaign.oncePerUser && localStorage.getItem(userKey)) {
      setIsVisible(false);
      return;
    }

    // Setup trigger delay
    const delayMs = (campaign.displayDelay ?? 3) * 1000;
    const timer = setTimeout(() => {
      setActiveCampaign(campaign);
      setIsVisible(true);
      
      // Track View Event
      fetch(`${API_URL}/api/popup-campaigns/${campaign.id}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'view' })
      }).catch(err => console.error('Failed to track campaign view:', err));
    }, delayMs);

    return () => clearTimeout(timer);
  }, [campaign, pathname, user]);

  const closePopup = () => {
    setIsVisible(false);
    if (activeCampaign) {
      const sessionKey = `hasSeenPopup_camp_session_${activeCampaign.id}`;
      const userKey = `hasSeenPopup_camp_user_${activeCampaign.id}`;

      if (activeCampaign.oncePerSession) {
        sessionStorage.setItem(sessionKey, 'true');
      }
      if (activeCampaign.oncePerUser) {
        localStorage.setItem(userKey, 'true');
      }
      // Always store in localStorage as fallback so it doesn't immediately repeat
      localStorage.setItem(`hasSeenPopup_camp_seen_${activeCampaign.id}`, 'true');
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/community-join/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          mobileNumber: phone,
          source: 'Popup',
          couponCode: activeCampaign.couponCode || null,
          campaignId: activeCampaign.id
        })
      });
      const data = await res.json();

      if (res.ok) {
        // Track subscription analytics
        await fetch(`${API_URL}/api/popup-campaigns/${activeCampaign.id}/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'subscription' })
        });

        setIsSubscribed(true);
        toast.success(data.message || 'Subscription successful!');
        setTimeout(closePopup, 4000);
      } else {
        toast.error(data.error || 'Failed to subscribe');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActionClick = async () => {
    if (!activeCampaign) return;

    try {
      // Track Click Event
      await fetch(`${API_URL}/api/popup-campaigns/${activeCampaign.id}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'click' })
      });
    } catch (err) {
      console.error('Failed to track click:', err);
    }

    closePopup();
    if (activeCampaign.redirectUrl) {
      window.location.href = activeCampaign.redirectUrl;
    }
  };

  if (!isVisible || !activeCampaign) return null;

  const showForm = activeCampaign.popupType === 'NEWSLETTER' || activeCampaign.popupType === 'FIRST_ORDER';
  // Use uploaded image or fallback generic organic image
  const displayImage = activeCampaign.desktopImage || '/ai_images/discount_offer_1776230743911.png';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePopup}
          className="fixed inset-0 bg-emerald-950/80 backdrop-blur-md z-0"
        />

        {/* Popup Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-[850px] bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col md:flex-row min-h-[420px]"
        >
          {/* Left Column: Visual Area */}
          <div className="relative w-full md:w-[45%] h-64 md:h-auto bg-emerald-900 overflow-hidden flex flex-col justify-end">
            <Image
              src={displayImage}
              alt={activeCampaign.title || 'Marketing offer'}
              fill
              className="object-cover transition-transform duration-1000 hover:scale-110"
              priority
              unoptimized={displayImage.startsWith('http')}
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-emerald-950/65 via-transparent to-transparent" />

            <div className="absolute inset-0 p-8 flex flex-col justify-end md:justify-center items-center md:items-start text-center md:text-left text-white z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="mb-4 h-16 w-16 rounded-3xl bg-amber-400 flex items-center justify-center shadow-xl rotate-3"
              >
                <Gift className="h-8 w-8 text-emerald-950" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-1">
                {activeCampaign.discountPct ? `${activeCampaign.discountPct}%` : 'HOT'}<span className="text-amber-400">OFF</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
                {activeCampaign.popupType?.replace('_', ' ') || ''}
              </p>
            </div>
          </div>

          {/* Right Column: Actions Area */}
          <div className="flex-1 p-8 md:p-12 relative flex flex-col justify-center bg-white text-slate-800">
            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-slate-100 shadow-sm z-20 group"
            >
              <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <AnimatePresence mode="wait">
              {!isSubscribed ? (
                <motion.div
                  key="form-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-[1px] w-8 bg-amber-400" />
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                      {activeCampaign.subtitle || 'Special Offer'}
                    </span>
                  </div>

                  <h3 className="text-3xl font-black text-emerald-950 tracking-tighter leading-tight">
                    {activeCampaign.title}
                  </h3>

                  {activeCampaign.description && (
                    <p className="text-slate-500 text-[14px] leading-relaxed">
                      {activeCampaign.description}
                    </p>
                  )}

                  {showForm ? (
                    <form onSubmit={handleSubscribe} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-emerald-950 font-bold focus:border-emerald-500 focus:bg-white transition-all outline-none text-[13px]"
                        />
                        <input
                          type="tel"
                          placeholder="Mobile Number"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-emerald-950 font-bold focus:border-emerald-500 focus:bg-white transition-all outline-none text-[13px]"
                        />
                      </div>
                      
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-350" />
                        <input
                          type="email"
                          required
                          placeholder="Your email address"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full h-14 pl-12 pr-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 text-emerald-950 font-bold focus:border-emerald-500 focus:bg-white transition-all outline-none text-[14px]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-14 bg-emerald-950 text-white rounded-[1.25rem] font-black text-[14px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-800 hover:shadow-2xl hover:shadow-emerald-900/20 active:scale-95 transition-all group disabled:opacity-50"
                      >
                        {submitting ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            {activeCampaign.buttonText || 'Subscribe Now'}
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={handleActionClick}
                      className="w-full h-14 bg-emerald-950 text-white rounded-[1.25rem] font-black text-[14px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-800 hover:shadow-2xl hover:shadow-emerald-900/20 active:scale-95 transition-all group"
                    >
                      {activeCampaign.buttonText || 'Claim Offer'}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="success-content"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center p-8 space-y-4"
                >
                  <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-black text-emerald-950 tracking-tighter">Offer Unlocked!</h3>
                  <p className="text-slate-500 text-sm">Thank you for subscribing! We have registered your details.</p>
                  
                  {activeCampaign.couponCode && (
                    <div className="bg-emerald-50 px-6 py-2.5 rounded-full text-emerald-700 font-mono font-black text-base uppercase tracking-widest border border-emerald-100">
                      Code: {activeCampaign.couponCode}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MarketingPopup;
