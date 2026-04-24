'use client';
import React, { useState, useEffect } from 'react';
import PromotionForm from '@/components/admin/PromotionForm';
import { API_URL } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface PromotionEditClientProps {
   id: string;
}

export default function PromotionEditClient({ id }: PromotionEditClientProps) {
   const [promotion, setPromotion] = useState<any>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      if (!id) return;
      fetch(`${API_URL}/api/promotions/${id}`)
         .then(res => {
            if (!res.ok) throw new Error('Promotion not found');
            return res.json();
         })
         .then(data => {
            setPromotion(data);
            setLoading(false);
         })
         .catch(err => {
            setError(err.message);
            setLoading(false);
         });
   }, [id]);

   if (loading) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-slate-200" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fetching Campaign Intel...</p>
         </div>
      );
   }

   if (error || !promotion) {
      return (
         <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <h2 className="text-2xl font-bold text-slate-800">Promotion Not Found</h2>
            <p className="text-slate-500 text-sm">{error || "The campaign you are looking for does not exist or has been archived."}</p>
         </div>
      );
   }

   return <PromotionForm mode="edit" initialData={promotion} />;
}
