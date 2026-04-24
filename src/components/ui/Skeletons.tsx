'use client';

import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white rounded-[2rem] border border-slate-100 p-8 space-y-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-14 w-14 bg-slate-100 rounded-2xl" />
      <div className="h-8 w-20 bg-slate-50 rounded-lg" />
    </div>
    <div className="space-y-3">
      <div className="h-6 w-3/4 bg-slate-100 rounded-lg" />
      <div className="h-4 w-1/2 bg-slate-50 rounded-lg" />
    </div>
    <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
      <div className="h-4 w-24 bg-slate-50 rounded-full" />
      <div className="h-4 w-4 bg-slate-100 rounded-full" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
   <tr className="animate-pulse border-b border-slate-50">
      <td className="px-10 py-8">
         <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-slate-100 rounded-xl" />
            <div className="space-y-2">
               <div className="h-4 w-32 bg-slate-100 rounded" />
               <div className="h-3 w-20 bg-slate-50 rounded" />
            </div>
         </div>
      </td>
      <td className="px-10 py-8"><div className="h-4 w-24 bg-slate-50 rounded" /></td>
      <td className="px-10 py-8"><div className="h-4 w-16 bg-slate-50 rounded" /></td>
      <td className="px-10 py-8"><div className="h-4 w-12 bg-slate-50 rounded" /></td>
      <td className="px-10 py-8 text-right"><div className="h-8 w-8 ml-auto bg-slate-50 rounded-lg" /></td>
   </tr>
);

export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-32 bg-white rounded-[2rem] border border-slate-100 p-8 flex flex-col justify-center space-y-3">
        <div className="h-3 w-24 bg-slate-50 rounded" />
        <div className="h-8 w-32 bg-slate-100 rounded" />
      </div>
    ))}
  </div>
);
