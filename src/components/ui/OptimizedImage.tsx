'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallback?: string;
}

export default function OptimizedImage({ src, alt, fallback = '/ai_images/organic_grains_1776231059575.png', ...props }: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={imgSrc || fallback}
      alt={alt}
      onError={() => setImgSrc(fallback)}
      // For a multi-vendor external image site, we often don't know the domains ahead of time
      // So we use unoptimized=true for external links or configure remotePatterns in next.config
      unoptimized={src?.startsWith('http')} 
      className={`transition-opacity duration-300 ${props.className}`}
    />
  );
}
