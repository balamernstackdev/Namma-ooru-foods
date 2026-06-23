'use client';

import React from 'react';
import useSWR from 'swr';
import BlogDetailClient from '@/components/BlogDetailClient';
import { API_URL } from '@/lib/api';
import PremiumLoader from '@/components/ui/PremiumLoader';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface BlogDetailLoaderDirectProps {
  slug: string;
  initialPost: any;
}

export default function BlogDetailLoaderDirect({ slug, initialPost }: BlogDetailLoaderDirectProps) {
  const { data: post, error, isLoading } = useSWR(
    slug ? `${API_URL}/api/blog/${slug}` : null,
    fetcher,
    { fallbackData: initialPost }
  );

  if (isLoading && !post) {
    return <PremiumLoader fullScreen={true} />;
  }

  if (error || !post || post.error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-8 text-center bg-white">
        <div className="h-24 w-24 rounded-[2rem] bg-rose-50 flex items-center justify-center mb-8">
          <span className="text-4xl font-black text-rose-400">!</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 uppercase tracking-tighter">Post Not Found</h1>
        <p className="text-slate-400 font-medium mt-4 max-w-sm mx-auto tracking-tight">
          This blog post does not exist or may have been removed.
        </p>
      </div>
    );
  }

  return (
    <BlogDetailClient post={post} />
  );
}
