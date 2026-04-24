import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package, BadgeCheck } from "lucide-react";
import { API_URL } from '@/lib/api';

async function getLiveBrands() {
  try {
    const res = await fetch(`${API_URL}/api/brands`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export default async function BrandsPage() {
  const brands = await getLiveBrands();

  return (
    <div className="standard-container py-10 lg:py-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-500 mb-2 inline-block">Partner Registry</p>
        <h1 className="text-4xl md:text-7xl font-black text-emerald-950 tracking-tight leading-[1.05]">Our Community <br/><span className="text-amber-500 italic underline decoration-amber-200 decoration-8 underline-offset-8">Resellers</span></h1>
        <p className="mt-6 max-w-2xl mx-auto text-slate-500 text-base font-medium leading-relaxed">
          Every partner on Namma Orru is verified for quality and ethical sourcing. Explore the diverse range of harvests directly from our community stores.
        </p>
      </div>

      {/* Brand Cards */}
      <div className="flex flex-col gap-6 lg:gap-10">
        {brands.length > 0 ? (
          brands.map((brand: any) => (
            <div
              key={brand.id}
              className="group grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[280px_1fr_180px] gap-6 md:gap-12 items-center rounded-[2.5rem] border border-slate-100 bg-white p-6 lg:p-10 hover:shadow-premium transition-all duration-700 overflow-hidden"
            >
              {/* Brand Identity */}
              <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-10">
                <div className="h-32 w-32 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-2xl relative flex-shrink-0 group-hover:scale-105 transition-transform duration-700 mb-2">
                  <img 
                    src={brand.logo || '/brand_logos/reseller_logo.webp'} 
                    alt={brand.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="w-full space-y-1">
                  <span className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 bg-emerald-950 text-[10px] font-black text-white mb-1 uppercase tracking-[0.1em]">
                    <BadgeCheck className="h-4 w-4 text-amber-500" /> Verified
                  </span>
                  <h2 className="text-3xl font-black text-emerald-950 tracking-tighter">{brand.name}</h2>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col justify-center gap-4">
                <p className="text-slate-500 text-base font-medium leading-snug italic">
                  "{brand.description || 'Authentic reseller contributing to our sustainable organic mission.'}"
                </p>
                <div className="mt-2 flex gap-10">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Inventory Feed</span>
                      <div className="flex items-center gap-2">
                         <Package className="text-amber-500" size={16} />
                         <span className="text-lg font-black text-emerald-950">{brand._count?.products || 0} Products</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex justify-center md:justify-end">
                <Link
                  href={`/brands/${brand.id}`}
                  className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-emerald-950 text-white flex items-center justify-center hover:bg-amber-500 hover:text-emerald-950 transition-all duration-500 shadow-xl group/btn active:scale-90"
                >
                  <ArrowRight className="h-8 w-8 transition-transform group-hover/btn:translate-x-2" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100">
             <p className="text-slate-400 font-bold uppercase tracking-widest">Awaiting Reseller Synchronization...</p>
          </div>
        )}
      </div>
    </div>
  );
}
