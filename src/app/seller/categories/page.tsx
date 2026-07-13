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
      <div className="space-y-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#15803D] shrink-0 border border-green-200 font-black">
                  ✓
               </div>
               <div>
                  <h3 className="text-sm font-black text-[#111827]">Private Store Taxonomy</h3>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">
                     You are managing your own private store categories.
                  </p>
               </div>
            </div>
            <button
               onClick={() => router.push('/vendor/categories/new')}
               className="h-11 px-5 rounded-xl bg-[#0F7A4D] hover:bg-[#0c633e] text-white font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm w-full md:w-auto"
            >
               <Plus size={16} />
               Create Category
            </button>
         </div>
         <CategoryManager brandId={brandId} />
      </div>
   );
}
