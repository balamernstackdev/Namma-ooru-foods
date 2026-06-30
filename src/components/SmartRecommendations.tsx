'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const SmartRecommendations = () => {
   const { data: products } = useSWR(`${API_URL}/api/products?limit=20`, fetcher);
   const [recommendations, setRecommendations] = useState<any[]>([]);
   const [intent, setIntent] = useState('Organic Essentials');

   const liveProductsList = Array.isArray(products)
      ? products
      : (products && Array.isArray((products as any).products) ? (products as any).products : []);

   useEffect(() => {
      if (liveProductsList && liveProductsList.length > 0) {
         // Logic: Mix of random and a "themed" selection to simulate AI intent
         const shuffled = [...liveProductsList].sort(() => 0.5 - Math.random());
         const selectedIntent = Math.random() > 0.5 ? 'Regional Favorites' : 'High Curcumin Boosters';
         setIntent(selectedIntent);
         setRecommendations(shuffled.slice(0, 4));
      }
   }, [products]);

   if (liveProductsList.length === 0 || recommendations.length === 0) return null;

   return (
      <section className="py-10 md:py-20 flex justify-center overflow-hidden">
         <div className="standard-container">
            <div className="bg-[#022c22] rounded-[3rem] p-8 md:p-16 relative overflow-hidden shadow-2xl shadow-emerald-950/40">
               {/* Abstract AI visuals */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/20 blur-[100px] -translate-x-10 translate-y-10" />
               <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/10 blur-[80px] translate-x-20 -translate-y-10" />

               <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                  <div className="max-w-md space-y-6">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                           <Sparkles size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">AI Personalization Engine</span>
                     </div>
                     <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                        Smart Picks <br /> <span className="text-amber-400 italic">For You.</span>
                     </h2>
                     <p className="text-emerald-100/60 font-medium text-sm md:text-lg leading-relaxed">
                        Based on your browsing activity and regional trends, we've Updationd these specific Products for your wellness.
                     </p>
                     <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-[9px] font-black text-white uppercase tracking-widest">
                        <Target size={12} className="text-emerald-400" /> Intent Detected: {intent}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-2 gap-4 flex-1">
                     {recommendations.map((item, i) => (
                        <motion.div
                           key={item.id}
                           initial={{ y: 20, opacity: 0 }}
                           whileInView={{ y: 0, opacity: 1 }}
                           transition={{ delay: i * 0.1 }}
                           viewport={{ once: true }}
                           className="group bg-white/5 backdrop-blur-md rounded-[2rem] p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                        >
                           <Link href={`/products/${item.slug || item.id}`} className="block">
                              <div className="aspect-square relative rounded-2xl overflow-hidden mb-4">
                                 <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                 <div className="absolute top-2 right-2 h-8 w-8 rounded-lg bg-emerald-500/80 backdrop-blur-md flex items-center justify-center text-white">
                                    <Zap size={14} className="fill-white" />
                                 </div>
                              </div>
                              <h4 className="text-[11px] font-black text-white uppercase tracking-tight line-clamp-1">{item.name}</h4>
                              <div className="flex items-center justify-between mt-3">
                                 <span className="text-amber-400 font-black text-sm">₹{item.price}</span>
                                 <div className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-amber-400 group-hover:text-emerald-950 transition-all">
                                    <ArrowRight size={14} />
                                 </div>
                              </div>
                           </Link>
                        </motion.div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>
   );
};

export default SmartRecommendations;
