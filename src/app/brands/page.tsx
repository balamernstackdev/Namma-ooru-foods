import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package, BadgeCheck } from "lucide-react";
import { BRANDS, PRODUCTS } from "@/lib/staticData";

export default function BrandsPage() {
  return (
    <div className="mx-auto w-full py-20 lg:py-32" style={{ maxWidth: '1400px', paddingLeft: '5%', paddingRight: '5%' }}>
      {/* Header */}
      <div className="mb-20 text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-500 mb-4 inline-block">Our Partners</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-emerald-950 tracking-tight leading-[1.05]">Trusted Brands</h1>
        <p className="mt-8 max-w-2xl mx-auto text-[var(--muted-foreground)] text-base md:text-lg leading-relaxed">
          Every brand on Namma Orru Foods is hand-picked and verified for quality, ethical sourcing, and authentic production methods.
        </p>
        <div className="mt-8 h-1.5 w-24 bg-amber-400 mx-auto rounded-full" />
      </div>

      {/* Brand Cards - Better Tablet Responsiveness */}
      <div className="flex flex-col gap-12 lg:gap-20">
        {BRANDS.map((brand) => {
          const brandProducts = PRODUCTS.filter(p => p.brand === brand.name);
          return (
            <div
              key={brand.id}
              className="group grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[240px_1fr_340px] gap-8 md:gap-12 items-start lg:items-center rounded-[2.5rem] border border-emerald-50 bg-[#fafaf9] p-8 lg:p-12 hover:shadow-2xl hover:shadow-emerald-950/10 transition-all duration-500 overflow-hidden"
            >
              {/* Brand Identity */}
              <div className="flex flex-col items-start gap-6 border-b md:border-b-0 md:border-r border-emerald-100/50 pb-8 md:pb-0 md:pr-12">
                <div
                  className="h-24 w-24 md:h-28 md:w-28 rounded-3xl overflow-hidden border-4 shadow-xl relative flex-shrink-0"
                  style={{ borderColor: brand.color }}
                >
                  <Image 
                    src={brand.logo} 
                    alt={brand.name} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <div className="min-w-0">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[9px] font-black text-white mb-3 uppercase tracking-widest"
                    style={{ backgroundColor: brand.color }}
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {brand.badge}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-emerald-950 truncate">{brand.name}</h2>
                  <p className="text-sm italic text-emerald-800/60 mt-2 font-medium">"{brand.tagline}"</p>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-900/40">
                  <Package className="h-4 w-4" />
                  <span>{brand.productCount} Products</span>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col justify-center px-0 lg:px-12 md:max-w-xl">
                <p className="text-emerald-950/70 text-base md:text-lg leading-relaxed font-medium">{brand.description}</p>
                <div className="mt-8">
                  <Link
                    href={`/products?brand=${encodeURIComponent(brand.name)}`}
                    className="inline-flex items-center gap-3 rounded-full px-8 py-4 bg-white border border-emerald-100 text-xs font-black text-emerald-950 shadow-lg hover:bg-emerald-50 transition-all group/btn"
                  >
                    View All Products 
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" 
                               style={{ color: brand.color }} />
                  </Link>
                </div>
              </div>

              {/* Product Preview - Spans 2 columns on tablet, 1 on desktop */}
              <div className="md:col-span-2 lg:col-span-1 flex flex-col gap-4 bg-white/50 rounded-[2rem] p-6 lg:p-8 border border-emerald-50">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-900/40 mb-2">Featured Selection</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  {(brandProducts.length > 0 ? brandProducts : PRODUCTS.slice(0, 2)).slice(0, 2).map(product => (
                    <Link
                      href={`/products/${product.id}`}
                      key={product.id}
                      className="flex items-center gap-4 rounded-2xl bg-white border border-emerald-50 p-4 hover:border-amber-400 hover:shadow-lg transition-all group/item"
                    >
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-emerald-50 relative">
                        <Image 
                          src={product.image} 
                          alt={product.name} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-emerald-950 truncate">{product.name}</p>
                        <p className="text-[10px] text-emerald-800/50 font-bold uppercase tracking-wider mt-1">{product.category}</p>
                      </div>
                      <span className="text-sm font-black text-emerald-600 flex-shrink-0">₹{product.price}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
