'use client';

import React from 'react';
import BannerForm from '../BannerForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateBannerPage() {
   return (
      <div className="space-y-8 animate-in fade-in duration-700">
         <div className="flex items-center gap-4">
            <Link 
               href="/admin/banners" 
               className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors shadow-sm"
            >
               <ArrowLeft size={18} />
            </Link>
            <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Create <span className="text-emerald-600">Campaign</span></h1>
               <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Design a new promotional banner</p>
            </div>
         </div>

         <BannerForm isEditing={false} />
      </div>
   );
}
