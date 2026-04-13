import React from 'react';
import { Skeleton } from '@/components/Skeleton';

export default function CategoriesLoading() {
  return (
    <div className="w-full bg-white min-h-screen">
      <div className="w-full h-[60vh] bg-slate-900 flex items-center justify-center">
        <div className="standard-container flex flex-col items-center gap-6">
           <Skeleton className="h-4 w-32 bg-white/10" />
           <Skeleton className="h-20 w-3/4 max-w-2xl bg-white/10" />
           <Skeleton className="h-8 w-1/2 max-w-lg bg-white/10" />
        </div>
      </div>
      
      <div className="w-full py-16 md:py-24 flex justify-center">
        <div className="standard-container">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 pb-12 border-b border-slate-50 gap-10">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-2 w-24" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-6 bg-slate-50 rounded-[3rem] p-8 md:p-12 h-[500px]">
                <Skeleton className="aspect-square w-full rounded-[2rem]" />
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-12 w-12 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
