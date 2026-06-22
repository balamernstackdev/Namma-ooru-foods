'use client';

import React, { useEffect, useState } from 'react';
import BannerForm, { Banner } from '../../BannerForm';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';

export default function EditBannerClient() {
   const params = useParams();
   const router = useRouter();
   const [banner, setBanner] = useState<Banner | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');

   useEffect(() => {
      if (!params.id) return;
      
      const fetchBanner = async () => {
         try {
            // Fetch banner directly by ID
            const res = await fetch(`${API_URL}/api/admin-ops/banners/${params.id}`);
            if (!res.ok) throw new Error('Failed to fetch banner data');
            const data = await res.json();
            
            console.log('Banner API Response', data);
            console.log('Banner Type', data?.type);
            console.log('Link Data', data?.linkData);

            if (data?.id) {
               setBanner({
                  ...data,
                  banner_image: data.banner_image || data.desktopImage || data.image || ''
               });
            } else {
               setError('Banner not found');
            }
         } catch (err: any) {
            setError(err.message || 'Error fetching banner');
         } finally {
            setLoading(false);
         }
      };

      fetchBanner();
   }, [params.id]);

   if (loading) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Campaign Data...</span>
         </div>
      );
   }

   if (error || !banner) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="text-red-500 font-bold">{error || 'Banner not found'}</div>
            <button onClick={() => router.push('/admin/banners')} className="h-10 px-6 rounded-lg bg-slate-100 text-sm font-bold hover:bg-slate-200">
               Go Back
            </button>
         </div>
      );
   }

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
               <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Edit <span className="text-emerald-600">Campaign</span></h1>
               <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Update banner settings and visuals</p>
            </div>
         </div>

         <BannerForm initialData={banner} isEditing={true} />
      </div>
   );
}
