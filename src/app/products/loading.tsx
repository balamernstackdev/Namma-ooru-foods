import React from 'react';
import { ProductCardSkeleton, Skeleton } from '@/components/Skeleton';

export default function ProductsLoading() {
  return (
    <div className="w-full bg-white min-h-screen">
      <div className="w-full h-[40vh] bg-slate-50 flex items-center justify-center">
        <div className="standard-container flex flex-col items-center gap-6">
           <Skeleton className="h-4 w-32" />
           <Skeleton className="h-16 w-3/4 max-w-2xl" />
           <Skeleton className="h-6 w-1/2 max-w-lg" />
        </div>
      </div>
      
      <div className="w-full py-16 md:py-24 flex justify-center">
        <div className="standard-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
