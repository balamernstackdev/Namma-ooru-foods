'use client';

import React from 'react';
import { Tag, Calendar, ChevronLeft, Share2, Printer } from 'lucide-react';
import Link from 'next/link';

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

export default function BlogDetailClient({ post }: { post: BlogPost | null }) {
  if (!post) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-8 text-center bg-white">
        <h1 className="text-4xl md:text-5xl font-black text-slate-200 uppercase tracking-tighter">Article Not Found</h1>
        <Link href="/blog" className="mt-8 text-sm font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 transition-colors">
          Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700 overflow-x-hidden bg-white">
      {/* Hero Image - Full Width */}
      {post.image && (
        <div className="w-full h-[50vh] md:h-[65vh] relative overflow-hidden bg-[#022c22]">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#022c22]/60 via-transparent to-transparent" />
        </div>
      )}

      {/* Sharing Header - Compact */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="mx-auto w-full flex items-center justify-between h-14 px-4 sm:px-8" style={{ maxWidth: '1200px' }}>
          <Link href="/blog" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-700 transition-colors">
            <ChevronLeft size={14} className="text-amber-500" /> Back to Journal
          </Link>
          <div className="flex items-center gap-3">
            <button className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100" title="Share Article">
              <Share2 size={14} />
            </button>
            <button onClick={() => window.print()} className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100" title="Print Article">
              <Printer size={14} />
            </button>
          </div>
        </div>
      </div>

      <article className="mx-auto w-full pt-8 pb-32 px-4 sm:px-8" style={{ maxWidth: '850px' }}>
        {/* Header Metadata - Tightened */}
        <header className="mb-8">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map(tag => (
                <span key={tag} className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100/30">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-black text-[#022c22] tracking-tighter leading-[1.1] mb-6 break-words">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 border-y border-slate-50 py-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-black text-xs border border-white shadow-sm">N</div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#022c22]">namma ooru Foods</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Author • The Producters</p>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-100 hidden sm:block" />
            <div className="hidden sm:flex flex-col">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Published</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </header>

        {/* Excerpt - High Density */}
        {post.excerpt && (
          <div className="mb-10">
            <p className="text-xl md:text-2xl font-bold text-slate-500 leading-snug tracking-tight border-l-4 border-amber-400 pl-6 italic break-words">
              {post.excerpt}
            </p>
          </div>
        )}

        {/* Content Body - Premium Typography */}
        <div
          className="prose prose-slate prose-lg max-w-none break-words
            prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-[#022c22]
            prose-p:text-slate-600 prose-p:font-medium prose-p:leading-relaxed prose-p:tracking-tight
            prose-strong:text-[#022c22] prose-strong:font-black
            prose-img:rounded-3xl prose-img:shadow-xl
            prose-hr:border-slate-100
            space-y-6"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col items-center">
          <Link href="/blog" className="flex items-center gap-3 px-10 py-5 bg-yellow-600 hover:bg-emerald-800 rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-emerald-900/10 active:scale-95">
            <ChevronLeft size={18} className="text-amber-400" /> Back to Journal
          </Link>
        </div>
      </article>
    </div>
  );
}
