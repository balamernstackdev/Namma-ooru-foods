import Hero from "@/components/Hero";
import Link from "next/link";
import ProductCarousel from "@/components/ProductCarousel";
import CategoryBanner from "@/components/CategoryBanner";
import BrandBanner from "@/components/BrandBanner";
import OfferBanner from "@/components/OfferBanner";
import MarketingPopupWrapper from '@/components/MarketingPopupWrapper';
import ArtisanMarketplace from '@/components/ArtisanMarketplace';
import FarmersCollection from '@/components/FarmersCollection';
import LazyHomeSections from '@/components/HomePageSections';
import nextDynamic from 'next/dynamic';
import { CategoryCircleSkeleton } from '@/components/Skeleton';
import VendorPromotion from "@/components/VendorPromotion";

import { API_URL } from '@/lib/api';

const CategoriesCircles = nextDynamic(() => import('@/components/CategoriesCircles'), {
  ssr: true,
  loading: () => (
    <div className="w-full pt-4 pb-8 flex justify-center bg-white">
      <div className="standard-container">
        <div className="flex justify-center gap-10 md:gap-20 overflow-hidden">
          {[...Array(6)].map((_, i) => <CategoryCircleSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
});

/** Normalize banner type — handles both legacy formats and new snake_case keys */
function normalizeType(type?: string | null): string {
  if (!type) return 'hero';
  const lower = type.toLowerCase().trim();
  const map: Record<string, string> = {
    'hero': 'hero',
    'best_sellers': 'best_sellers',
    'organic_collection': 'organic_collection',
    'farmer_collection': 'farmer_collection',
    // Spaced / Legacy
    'best sellers': 'best_sellers',
    'organic collection': 'organic_collection',
    'farmer collection': 'farmer_collection',
    'hero banner': 'hero',
    'best sellers banner': 'best_sellers',
    'organic collection banner': 'organic_collection',
    'farmer collection banner': 'farmer_collection',
  };
  return map[lower] || lower;
}

async function fetchProducts(query: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_URL}/api/products?${query}&limit=20`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data?.products || []);
  } catch {
    return [];
  }
}



export default async function Home() {
  // Fetch all collections and products in parallel from the backend
  const [bestSellers, organicProducts, farmerProducts, allProducts, fastDeliveryProducts] = await Promise.all([
    fetchProducts('isBestSeller=true'),
    fetchProducts('isOrganic=true'),
    fetchProducts('isFarmerCollection=true'),
    fetchProducts('limit=100'),
    fetchProducts('isFastDelivery=true'),
  ]);

  // Deduplicate: organic shouldn't repeat best sellers for carousel
  const bestSellerIds = new Set(bestSellers.map((p: any) => p.id));
  const organicFiltered = organicProducts.filter((p: any) => !bestSellerIds.has(p.id)).slice(0, 12);

  return (
    <div className="flex flex-col bg-white w-full overflow-x-hidden">
      <main>
        {/* 1. Hero Banner Slider */}
        <Hero />
        <MarketingPopupWrapper />

        {/* 2. Shop By Category */}
        <CategoriesCircles />

        {/* 4. Featured Brands */}
        <ArtisanMarketplace />

        {/* 5.5 FASTEST DELIVERY PRODUCTS */}
        {fastDeliveryProducts.length > 0 ? (
          <ProductCarousel
            products={fastDeliveryProducts}
            title='<span class="text-[10px] md:text-xs uppercase font-black tracking-[0.2em] text-emerald-600 block mb-1">FAST DELIVERY</span>Fastest Delivery <span class="text-emerald-600 italic lowercase font-serif font-normal">Products</span>'
            subtitle="Get products delivered to your doorstep in the shortest time from nearby vendors."
            viewAllHref="/products?delivery=fast"
            bgClass="bg-white"
            autoScrollInterval={3200}
            bannerType="fast_delivery"
          />
        ) : (
          <section className="w-full py-8 bg-white">
            <div className="standard-container">
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-emerald-200 rounded-3xl bg-emerald-50/50">
                <span className="text-4xl mb-4">⚡</span>
                <h3 className="text-lg md:text-xl font-black text-emerald-950 uppercase tracking-tight mb-2">No Fast Delivery Products Available</h3>
                <p className="text-sm font-bold text-slate-500 max-w-md">Check back soon for lightning-fast deliveries near you.</p>
              </div>
            </div>
          </section>
        )}

        {/* 5. BEST SELLERS — Most Popular Products */}
        {bestSellers.length > 0 && (
          <ProductCarousel
            products={bestSellers}
            title='BEST <span class="text-accent italic lowercase font-serif font-normal">SELLERS</span>'
            subtitle="Most Popular Products"
            viewAllHref="/best-selling"
            bgClass="bg-slate-50"
            autoScrollInterval={3000}
            bannerType="best_sellers"
          />
        )}

        {/* 6. Farmers' Collections — Interactive Products Section */}
        {farmerProducts.length > 0 && (
          <FarmersCollection products={farmerProducts} />
        )}

        {/* 7. Organic Collections — Pure & Authentic */}
        {organicFiltered.length > 0 && (
          <ProductCarousel
            products={organicFiltered}
            title='Herbal Cosmetics <span class="text-primary italic lowercase font-serif font-normal">Collections</span>'
            subtitle="Pure. Authentic. Heritage."
            viewAllHref="/products"
            bgClass="bg-white"
            autoScrollInterval={3500}
            bannerType="organic_collection"
          />
        )}

        {/* 8. Recently Added Products */}
        {allProducts.length > 0 && (
          <ProductCarousel
            products={allProducts.slice(0, 12)}
            title='Recently <span class="text-accent italic lowercase font-serif font-normal">Added</span>'
            subtitle="Newest Additions to our Marketplace"
            viewAllHref="/products"
            bgClass="bg-slate-50"
            autoScrollInterval={4000}
          />
        )}

        <VendorPromotion />

        <LazyHomeSections />
      </main>
    </div>
  );
}
