import React from 'react';
import { PRODUCTS, CATEGORIES } from '@/lib/staticData';
import CategoryDetailClient from '@/components/CategoryDetailClient';

export async function generateStaticParams() {
  // Use the actual categories from static data
  return CATEGORIES.map((cat) => ({
    id: cat.name.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  // Clean up the ID to match category naming
  const categoryName = resolvedParams.id
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  const categoryProducts = PRODUCTS.filter(p => 
    p.category.toLowerCase().includes(categoryName.toLowerCase()) || 
    p.name.toLowerCase().includes(categoryName.toLowerCase())
  );

  return (
    <CategoryDetailClient categoryId={resolvedParams.id} categoryProducts={categoryProducts} />
  );
}
