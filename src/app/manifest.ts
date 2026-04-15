import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Namma Orru Foods',
    short_name: 'Namma Orru',
    description: 'Premium Organic & Local Essentials delivered from heart of our community.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#065f46',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/logo.webp',
        sizes: '192x192',
        type: 'image/webp',
      },
       {
        src: '/logo.webp',
        sizes: '512x512',
        type: 'image/webp',
      },
    ],
  };
}
