'use client';

import React from 'react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { Sparkles } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function MaduraiOfferBanner() {
   const { data: settingsData } = useSWR(`${API_URL}/api/settings`, fetcher);

   const getSettingVal = (key: string, fallback: string) => {
      if (!settingsData || !Array.isArray(settingsData)) return fallback;
      const found = settingsData.find((s: any) => s.key === key);
      return found ? found.value : fallback;
   };

   const maduraiFreeDeliveryEnabled = getSettingVal('madurai_free_delivery_enabled', 'false') === 'true';
   const maduraiFreeDeliveryStartDate = getSettingVal('madurai_free_delivery_start_date', '');
   const maduraiFreeDeliveryEndDate = getSettingVal('madurai_free_delivery_end_date', '');
   const maduraiFreeDeliveryMessage = getSettingVal('madurai_free_delivery_message', 'Special Offer: Enjoy FREE DELIVERY on all orders within Madurai! 🎉');

   let isMaduraiOfferActive = false;
   if (maduraiFreeDeliveryEnabled && maduraiFreeDeliveryStartDate && maduraiFreeDeliveryEndDate) {
      const now = new Date();
      const startDate = new Date(maduraiFreeDeliveryStartDate);
      const endDate = new Date(maduraiFreeDeliveryEndDate);
      endDate.setHours(23, 59, 59, 999);
      
      if (now >= startDate && now <= endDate) {
         isMaduraiOfferActive = true;
      }
   }

   if (!isMaduraiOfferActive) return null;

   return (
      <div className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white relative overflow-hidden flex items-center h-10">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <style>{`
            @keyframes scroll-left {
               0% { transform: translateX(100%); }
               100% { transform: translateX(-100%); }
            }
            .animate-scroll {
               display: inline-block;
               white-space: nowrap;
               animation: scroll-left 20s linear infinite;
            }
         `}</style>
         <div className="w-full relative z-10 overflow-hidden">
            <div className="animate-scroll">
               <div className="flex items-center gap-3">
                  <Sparkles size={16} className="text-amber-300 animate-pulse" />
                  <p className="text-xs md:text-sm font-medium tracking-wide" dangerouslySetInnerHTML={{ __html: maduraiFreeDeliveryMessage }}></p>
                  <Sparkles size={16} className="text-amber-300 animate-pulse" />
                  <span className="inline-block w-8"></span>
               </div>
            </div>
         </div>
      </div>
   );
}
