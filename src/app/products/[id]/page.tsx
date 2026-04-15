import React from 'react';
import { PRODUCTS } from '@/lib/staticData';
import ProductDetailClient from '@/components/ProductDetailClient';

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id.toString(),
  }));
}

const ProductDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = await params;
  const product = PRODUCTS.find(p => p.id === parseInt(resolvedParams.id)) || PRODUCTS[0];

  return (
    <ProductDetailClient product={product} allProducts={PRODUCTS} />
  );
};

export default ProductDetailPage;
