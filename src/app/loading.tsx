import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
          <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          <div className="absolute inset-4 rounded-full bg-emerald-950 flex items-center justify-center">
            <span className="text-[10px] font-black text-white">NOF</span>
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-950/40">Loading...</p>
      </div>
    </div>
  );
}
