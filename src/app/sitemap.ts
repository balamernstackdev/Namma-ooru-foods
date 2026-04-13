import { MetadataRoute } from 'next';
import { PRODUCTS, CATEGORIES } from '@/lib/staticData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://nammaorrufoods.com'; // Replace with actual domain

  // Base routes
  const routes = [
    '',
    '/products',
    '/categories',
    '/best-selling',
    '/special',
    '/promotions',
    '/about',
    '/account',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic Product routes
  const productRoutes = PRODUCTS.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Dynamic Category routes
  const categoryRoutes = CATEGORIES.map((category) => ({
    url: `${baseUrl}/products?category=${encodeURIComponent(category.name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...routes, ...productRoutes, ...categoryRoutes];
}
