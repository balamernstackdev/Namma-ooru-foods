import React from 'react';
import { Plus, Megaphone, Image as ImageIcon, Calendar, Power } from 'lucide-react';
import { PROMOTIONS } from '@/lib/staticData';

const PromotionsPage = () => {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing & Promotions</h1>
          <p className="text-[var(--muted-foreground)]">Manage discounts, seasonal campaigns, and homepage banners.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-6 py-3 font-bold hover:bg-[var(--muted)] transition-all">
             <ImageIcon className="h-5 w-5" /> New Banner
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:bg-[var(--primary-dark)] active:scale-95">
            <Plus className="h-5 w-5" /> Create Offer
          </button>
        </div>
      </div>

      {/* Active Promotions */}
      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
           <Megaphone className="h-6 w-6 text-[var(--primary)]" /> Active Offers
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PROMOTIONS.map((promo, i) => (
            <div key={i} className={`relative flex flex-col p-6 rounded-2xl border transition-all ${
              promo.active ? 'border-[var(--primary)]/30 bg-[var(--primary)]/[0.02] shadow-md' : 'border-[var(--border)] bg-[var(--card)]'
            }`}>
               <div className="flex items-start justify-between">
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    promo.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {promo.active ? 'Active' : 'Scheduled'}
                  </span>
                  <button className={`p-2 rounded-lg transition-colors ${promo.active ? 'text-green-600' : 'text-gray-400'}`}>
                    <Power className={`h-5 w-5 ${promo.active ? 'animate-pulse' : ''}`} />
                  </button>
               </div>
               <h3 className="mt-4 text-xl font-bold">{promo.title}</h3>
               <p className="mt-1 text-2xl font-black text-[var(--primary)]">{promo.discount}</p>
               <p className="mt-2 text-sm text-[var(--muted-foreground)]">Valid on {promo.category}</p>
               
               <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted-foreground)]">
                     <Calendar className="h-4 w-4" /> {promo.end}
                  </div>
                  <button className="text-sm font-bold hover:underline">Edit</button>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banner Management Placeholder */}
      <section className="flex flex-col gap-6">
         <h2 className="text-xl font-bold flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-[var(--secondary)]" /> Homepage Banners
         </h2>
         <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[1, 2].map((b) => (
              <div key={b} className="group relative aspect-[21/9] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--muted)]">
                 <div className="absolute inset-0 flex items-center justify-center text-[var(--muted-foreground)]">
                    Banner Preview {b}
                 </div>
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button className="rounded-xl bg-white px-6 py-2 font-bold text-black hover:bg-gray-100">Replace</button>
                    <button className="rounded-xl bg-red-600 px-6 py-2 font-bold text-white hover:bg-red-700">Delete</button>
                 </div>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
};

export default PromotionsPage;
