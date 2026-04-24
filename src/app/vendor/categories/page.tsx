'use client';

import React from 'react';
import CategoryManager from '@/components/admin/CategoryManager';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

export default function VendorCategoriesPage() {
  const { user } = useAuth();
  const brandId = user?.brandId;

  const router = useRouter();

  return (
    <div className="space-y-10">
       <div className="flex items-center justify-between">
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-6">
             <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-900/10">
                <span className="font-black text-lg">✓</span>
             </div>
             <p className="text-[11px] font-bold text-emerald-900 leading-relaxed uppercase tracking-widest">
                <span className="opacity-50">Private Taxonomy:</span> You are managing your own store categories.
             </p>
          </div>
          <button 
             onClick={() => router.push('/vendor/categories/new')}
             className="h-16 px-10 rounded-2xl bg-emerald-950 text-white font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20"
          >
             <Plus size={20} className="text-amber-400" />
             Define Cluster
          </button>
       </div>
       <CategoryManager brandId={brandId} />
    </div>
  );
}
