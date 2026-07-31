'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { resolveImageUrl } from '@/lib/api';

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallback?: string;
}

export default function OptimizedImage({ src, alt, fallback = '/ai_images/organic_grains_1776231059575.png', ...props }: OptimizedImageProps) {
  const resolved = resolveImageUrl(src, fallback);
  const [imgSrc, setImgSrc] = useState(resolved);

  useEffect(() => {
    setImgSrc(resolveImageUrl(src, fallback));
  }, [src, fallback]);

  return (
    <Image
      {...props}
      src={imgSrc || fallback}
      alt={alt}
      onError={() => setImgSrc(fallback)}
      unoptimized={imgSrc?.startsWith('http')}
      className={`transition-opacity duration-300 ${props.className}`}
    />
  );
}
