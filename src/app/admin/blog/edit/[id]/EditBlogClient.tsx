'use client';

import { useState, useEffect } from 'react';
import BlogForm from '@/components/admin/BlogForm';
import { API_URL } from '@/lib/api';

export default function EditBlogClient({ id }: { id: string }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`${API_URL}/api/blog/admin/${id}`)
        .then(r => r.json())
        .then(data => {
          if (data.id) setPost(data);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="h-12 w-12 border-4 border-slate-100 border-t-[var(--admin-accent)] rounded-full animate-spin" /></div>;
  if (!post) return <div className="text-center py-20 text-slate-400 font-bold">Article not found.</div>;

  return (
    <BlogForm editId={Number(id)} initialData={post} />
  );
}
