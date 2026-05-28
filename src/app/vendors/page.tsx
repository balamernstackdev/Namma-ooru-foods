'use client';

import React from 'react';
import Link from "next/link";
import { ArrowRight, MapPin, Building2, Package, Globe, Users, ShieldCheck, ChevronRight, Sparkles, LayoutGrid } from "lucide-react";
import { API_URL } from '@/lib/api';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import OptimizedImage from '@/components/ui/OptimizedImage';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function VendorsListingPage() {
  const { data: responseData, error, isLoading } = useSWR(`${API_URL}/api/head-vendors`, fetcher);
  const vendors = responseData?.headVendors || [];

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="h-20 w-20 border-4 border-emerald-950/5 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-950/40">Loading Marketplace Vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#fafaf9] min-h-screen">
      {/* Premium Hero Section */}
      <div className="relative w-full py-24 lg:py-32 bg-emerald-950 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-900/40 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />

        <div className="standard-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-amber-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
              <Globe size={14} /> Marketplace Vendors
            </span>
            <h1 className="text-5xl md:text-8xl font-[900] text-white tracking-tighter leading-[0.85] mb-8 uppercase">
              Our Partner <br /><span className="text-emerald-400 italic font-serif font-normal lowercase">Vendors</span>
            </h1>
            <p className="max-w-3xl text-emerald-100/60 text-lg md:text-2xl font-medium leading-relaxed">
              Explore our curated network of premium vendors. Each vendor represents a collection of independent heritage brands and artisanal production units.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="standard-container -mt-16 relative z-20 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 md:gap-10">
          {vendors.length > 0 ? (
            vendors.map((vendor: any, idx: number) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <Link
                  href={`/vendors/${vendor.slug || vendor.id}`}
                  className="group block bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 hover:shadow-emerald-900/10 transition-all duration-500 hover:-translate-y-2 border border-slate-100"
                >
                  {/* Vendor Banner Wrapper */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-50">
                    <OptimizedImage
                      src={vendor.banner || [
                        '/ai_images/banner_farm_fresh.png',
                        '/ai_images/banner_heritage_spices.png',
                        '/ai_images/banner_natural_products.png',
                        '/ai_images/organic_oils_banner.png',
                        '/ai_images/traditional_spices_banner.png',
                        '/ai_images/sweets_snacks_banner.png'
                      ][idx % 6]}
                      alt={vendor.name}
                      fill
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                    {/* Floating Brand Badge */}
                    <div className="absolute top-6 left-6 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg">
                        Verified Vendor
                      </span>
                    </div>
                  </div>

                  {/* Vendor Info Section */}
                  <div className="p-8 relative">
                    {/* Vendor Logo Overlay */}
                    <div className="absolute -top-12 left-8 h-20 w-20 rounded-2xl bg-white p-3 shadow-xl border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                      <OptimizedImage
                        src={vendor.logo || '/logo.webp'}
                        alt={vendor.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>

                    <div className="pt-10 space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-emerald-950 tracking-tight leading-none group-hover:text-emerald-600 transition-colors uppercase">
                          {vendor.name}
                        </h3>
                        <div className="flex items-center gap-1.5 opacity-60">
                          <MapPin size={12} className="text-amber-500" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{vendor.location || 'Regional Office'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                          <div className="flex items-center gap-2 text-emerald-900">
                            <Building2 size={14} />
                            <span className="text-lg font-black">{vendor._count?.subVendors || 0}</span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Approved Brands</span>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                          <div className="flex items-center gap-2 text-emerald-900">
                            <LayoutGrid size={14} />
                            <span className="text-lg font-black">12+</span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Categories</span>
                        </div>
                      </div>

                      <div className="pt-4 flex items-center justify-between group/cta">
                        <span className="text-[11px] font-black text-emerald-950 uppercase tracking-widest group-hover/cta:text-emerald-600 transition-colors">Explore Vendor</span>
                        <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-emerald-950 group-hover/cta:bg-emerald-950 group-hover/cta:text-white transition-all">
                          <ChevronRight size={18} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border border-slate-100 shadow-premium max-w-4xl mx-auto">
              <div className="h-32 w-32 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-10">
                <Users size={56} className="text-slate-200" />
              </div>
              <h3 className="text-emerald-950 text-3xl font-[900] mb-4 uppercase tracking-tighter">Vendor Marketplace Syncing</h3>
              <p className="text-slate-400 text-xl font-medium max-w-md mx-auto">Our regional vendor network is being updated for a better shopping experience.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
