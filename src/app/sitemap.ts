import { MetadataRoute } from 'next';
import { API_URL } from '@/lib/api';

export const dynamic = 'force-static';
export const revalidate = 3600; // optionally revalidate every hour if supported, but dynamic='force-static' is key for export

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://namma-urru-foods.web.app';

  try {
    const res = await fetch(`${API_URL}/api/products`);
    const data = await res.json();
    const productsList = Array.isArray(data) ? data : (data && Array.isArray(data.products) ? data.products : []);

    const productUrls = productsList.map((p: any) => ({
      url: `${baseUrl}/products/detail?id=${p.slug || p.id}`,
      lastModified: new Date(p.updatedAt || new Date()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      ...productUrls,
    ];
  } catch (e) {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}
