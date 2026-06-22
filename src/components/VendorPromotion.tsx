'use client';

import React from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Megaphone, Ticket, ArrowRight, Sparkles } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function VendorPromotion() {
  const { data: rawAnnouncements } = useSWR<any[]>(
    `${API_URL}/api/offer-announcements?activeOnly=true`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const promotions = React.useMemo(() => {
    if (!Array.isArray(rawAnnouncements)) return [];
    return rawAnnouncements
      .filter((a: any) => a.announcementType === 'VENDOR_PROMOTION')
      .sort((a, b) => (b.priorityOrder || 0) - (a.priorityOrder || 0));
  }, [rawAnnouncements]);

  if (promotions.length === 0) return null;

  const trackClick = async (id: number) => {
    try {
      await fetch(`${API_URL}/api/offer-announcements/${id}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'click' })
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="w-full py-8 bg-slate-50/50">
      <div className="standard-container px-4 md:px-0">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Megaphone className="text-[#0F7A4D]" size={16} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#111827] uppercase tracking-wider">Vendor Spotlights & Offers</h2>
              <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mt-0.5">Special campaigns directly from our verified creators</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions.map((ann) => (
              <div 
                key={ann.id}
                className="relative overflow-hidden rounded-[24px] border border-slate-100 shadow-md p-6 flex flex-col justify-between min-h-[160px] group hover:shadow-lg transition-all"
                style={{
                  background: `linear-gradient(135deg, ${ann.bgColor || '#065f46'} 0%, #022c22 100%)`
                }}
              >
                {/* Decorative background shapes */}
                <div className="absolute top-[-30%] right-[-10%] w-[50%] aspect-square rounded-full bg-white/5 blur-2xl pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
                
                <div className="relative z-10 flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400 bg-white/10 px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1">
                      <Sparkles size={10} /> {ann.offerType}
                    </span>
                  </div>

                  <h3 className="text-white text-lg font-black tracking-tight leading-snug mt-1 animate-in fade-in duration-500">
                    {ann.title}
                  </h3>
                  
                  <p className="text-white/85 text-xs font-semibold leading-relaxed">
                    {ann.message}
                  </p>
                </div>

                <div className="relative z-10 flex items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10">
                  {ann.couponCode ? (
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(ann.couponCode);
                        toast.success('Code copied!');
                      }}
                      className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 rounded-xl text-xs font-mono font-black select-all active:scale-95 transition-all"
                    >
                      <Ticket size={12} />
                      {ann.couponCode}
                    </button>
                  ) : (
                    <div />
                  )}

                  {ann.redirectUrl && (
                    <Link 
                      href={ann.redirectUrl}
                      onClick={() => trackClick(ann.id)}
                      className="inline-flex h-9 px-5 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-full font-black text-[10px] uppercase tracking-widest items-center gap-1 shadow-md hover:translate-x-0.5 active:scale-95 transition-all"
                    >
                      {ann.buttonText || 'Explore'} 
                      <ArrowRight size={10} strokeWidth={2.5} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
