import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} />
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden w-full h-full p-0">
      <Skeleton className="w-full aspect-[4/3.2] xs:aspect-[4/3.4] sm:aspect-square rounded-none" />
      <div className="flex flex-col flex-1 p-2.5 xs:p-3 justify-between space-y-2">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-3 w-2/5" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="min-h-[44px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const CategoryCircleSkeleton = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <Skeleton className="w-28 h-28 md:w-56 md:h-56 rounded-full" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
};
