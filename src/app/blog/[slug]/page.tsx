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

export const dynamicParams = true;

export async function generateStaticParams() {
  let posts: BlogPost[] = [];
  try {
    const res = await fetch(`${API_URL}/api/blog`);
    if (res.ok) {
      posts = await res.json();
    }
  } catch (error) {
    console.error("[Blog Static] Fetch Error:", error);
  }

  const paths = (posts || []).map((p: BlogPost) => ({ slug: p.slug }));
  
  // Safety paths
  if (!paths.some(p => p.slug === 'harvest-journal')) paths.push({ slug: 'harvest-journal' });
  if (!paths.some(p => p.slug === 'test-blog')) paths.push({ slug: 'test-blog' });

  console.log(`[INIT] BLOG SLUGS:`, paths.map(p => p.slug).join(', '));
  return paths;
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
