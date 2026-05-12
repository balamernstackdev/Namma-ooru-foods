import React from 'react';
import { Metadata } from 'next';
import BlogDetailClient from '@/components/BlogDetailClient';
import { API_URL } from '@/lib/api';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  body: string;
  image?: string;
  tags: string[];
  publishedAt?: string;
  createdAt: string;
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_URL}/api/blog/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/api/blog`);
    if (!res.ok) return [{ slug: 'ecommerce-blog' }];
    const posts = await res.json();
    return posts.map((post: any) => ({
      slug: post.slug,
    }));
  } catch {
    return [{ slug: 'ecommerce-blog' }];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Harvest Journal' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.image ? [{ url: post.image }] : [],
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  return (
    <div className="bg-white min-h-screen">
      <BlogDetailClient post={post} />
    </div>
  );
}
