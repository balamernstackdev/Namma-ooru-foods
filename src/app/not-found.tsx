'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { HelpCircle, RefreshCw } from 'lucide-react';
import CategoryDetailClient from '@/components/CategoryDetailClient';
import SubcategoryDetailClient from '@/components/SubcategoryDetailClient';
import BrandDetailClient from '@/components/BrandDetailClient';
import ProductDetailClient from '@/components/ProductDetailClient';
import PremiumLoader from '@/components/ui/PremiumLoader';
import { API_URL } from '@/lib/api';

export default function NotFound() {
  const [pathname, setPathname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedData, setResolvedData] = useState<any>(null);
  const [resolvedType, setResolvedType] = useState<'category' | 'subcategory' | 'brand' | 'product' | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!pathname) return;

    // Normalizing pathname by stripping leading/trailing slashes
    const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
    const pathParts = cleanPath.split('/');

    // Check if it's one of our dynamic routes:
    // /categories/[idOrSlug], /subcategories/[idOrSlug], /brands/[idOrSlug], /products/[idOrSlug]
    const rootFolder = pathParts[0];
    const identifier = pathParts[1];

    if (pathParts.length === 2 && identifier && identifier !== 'detail') {
      const checkDatabase = async () => {
        try {
          if (rootFolder === 'categories') {
            const res = await fetch(`${API_URL}/api/categories/${identifier}`);
            if (res.ok) {
              const data = await res.json();
              if (data && !data.error && data.name) {
                setResolvedType('category');
                setResolvedData(data);
                setLoading(false);
                return;
              }
            }
          } else if (rootFolder === 'subcategories') {
            const res = await fetch(`${API_URL}/api/subcategories/${identifier}`);
            if (res.ok) {
              const data = await res.json();
              if (data && !data.error && data.name) {
                setResolvedType('subcategory');
                setResolvedData(data);
                setLoading(false);
                return;
              }
            }
          } else if (rootFolder === 'brands') {
            const res = await fetch(`${API_URL}/api/sub-vendors/${identifier}`);
            if (res.ok) {
              const data = await res.json();
              if (data && !data.error && data.name) {
                setResolvedType('brand');
                setResolvedData(data);
                setLoading(false);
                return;
              }
            }
          } else if (rootFolder === 'products') {
            const [resProduct, resAll] = await Promise.all([
              fetch(`${API_URL}/api/products/${identifier}`),
              fetch(`${API_URL}/api/products?limit=20`)
            ]);
            if (resProduct.ok) {
              const data = await resProduct.json();
              if (data && !data.error && data.name) {
                const allData = resAll.ok ? await resAll.json() : [];
                const productsList = Array.isArray(allData) ? allData : (allData && Array.isArray(allData.products) ? allData.products : []);
                setAllProducts(productsList);
                setResolvedType('product');
                setResolvedData(data);
                setLoading(false);
                return;
              }
            }
          }
        } catch (err) {
          console.error('Dynamic fallback resolution failed:', err);
        }
        setLoading(false);
      };

      checkDatabase();
    } else {
      setLoading(false);
    }
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <PremiumLoader fullScreen={false} />
          <div className="flex items-center gap-2 text-emerald-950/40 text-[10px] font-black uppercase tracking-[0.25em] animate-pulse">
            <RefreshCw size={12} className="animate-spin" />
            Resolving Path Context...
          </div>
        </div>
      </div>
    );
  }

  if (resolvedType === 'category' && resolvedData) {
    return (
      <CategoryDetailClient
        categoryId={resolvedData.slug || resolvedData.id.toString()}
        category={resolvedData}
        categoryProducts={resolvedData.products || []}
      />
    );
  }

  if (resolvedType === 'subcategory' && resolvedData) {
    return (
      <SubcategoryDetailClient
        subcategoryId={resolvedData.slug || resolvedData.id.toString()}
        subcategory={resolvedData}
        subcategoryProducts={resolvedData.products || []}
      />
    );
  }

  if (resolvedType === 'brand' && resolvedData) {
    return <BrandDetailClient brand={resolvedData} />;
  }

  if (resolvedType === 'product' && resolvedData) {
    return (
      <ProductDetailClient
        product={resolvedData}
        allProducts={allProducts}
      />
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-20 px-8 text-center bg-white">
      <div className="h-24 w-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-8 border border-slate-100/50 shadow-sm text-slate-400">
        <HelpCircle size={36} className="stroke-[1.5]" />
      </div>
      <h1 className="text-4xl md:text-5xl font-[900] text-emerald-950 uppercase tracking-tighter">Page Not Found</h1>
      <p className="text-slate-400 font-medium mt-4 max-w-sm mx-auto tracking-tight text-sm">
        The page you are looking for does not exist, has been moved, or is undergoing updates.
      </p>
      <Link 
        href="/" 
        className="mt-8 h-12 px-8 rounded-xl bg-[#022c22] text-white font-black text-[11px] uppercase tracking-widest flex items-center justify-center shadow-lg shadow-emerald-950/20 active:scale-95 transition-all hover:bg-emerald-900"
      >
        Return Home
      </Link>
    </div>
  );
}
