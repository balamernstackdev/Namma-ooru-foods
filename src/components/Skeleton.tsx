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
    <div className="flex flex-col gap-4">
      <Skeleton className="aspect-square w-full rounded-2xl md:rounded-[2.5rem]" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-3/4" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-10 w-10 rounded-full" />
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
