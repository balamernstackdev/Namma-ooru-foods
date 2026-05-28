import React from 'react';
import Image from 'next/image';

interface PremiumLoaderProps {
  fullScreen?: boolean;
}

const PremiumLoader: React.FC<PremiumLoaderProps> = ({ fullScreen = true }) => {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-xl"
    : "w-full py-20 flex flex-col items-center justify-center bg-white/50 backdrop-blur-md rounded-[2rem]";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-12">
        <div className="relative flex items-center justify-center">
          {/* Elegant minimalist pulse effect */}
          <div className="absolute h-32 w-32 md:h-48 md:w-48 bg-emerald-100/30 rounded-full animate-ping opacity-20" />

          <Image
            src="/logo.webp"
            alt="namma ooru Foods"
            width={280}
            height={80}
            priority
            className="relative z-10 w-48 md:w-64 h-auto object-contain animate-pulse"
          />
        </div>

        {/* Simple minimalist progress indicator */}
        <div className="h-[2px] w-32 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-900 w-1/2 animate-[loading_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};

export default PremiumLoader;
