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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Navigation & Actions */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 mb-8">
        <div className="mx-auto w-full flex items-center justify-between h-16" style={{ maxWidth: '1400px', paddingLeft: '5%', paddingRight: '5%' }}>
          <Link href="/blog" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#022c22] hover:text-emerald-700 transition-colors">
            <ChevronLeft size={14} className="text-amber-500" /> Back to Journal
          </Link>
          <div className="flex items-center gap-4">
             <button className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                <Share2 size={14} />
             </button>
             <button onClick={() => window.print()} className="h-9 w-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                <Printer size={14} />
             </button>
          </div>
        </div>
      </div>

      <article className="mx-auto w-full pb-32" style={{ maxWidth: '800px', paddingLeft: '5%', paddingRight: '5%' }}>
        {/* Header */}
        <header className="mb-12">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span key={tag} className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-4xl md:text-6xl font-black text-[#022c22] tracking-tighter leading-[0.9] mb-8">
            {post.title}
          </h1>
          <div className="flex items-center gap-6 border-y border-slate-100 py-6">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-black text-sm">N</div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#022c22]">Namma Orru Foods</p>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Author • The Harvesters</p>
                </div>
             </div>
             <div className="h-10 w-px bg-slate-100 hidden sm:block" />
             <div className="hidden sm:flex flex-col">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Published</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#CB9F1E] mt-0.5">
                   {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
             </div>
          </div>
        </header>

        {/* Hero Image */}
        {post.image && (
          <div className="mb-16 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-emerald-950/10">
            <img src={post.image} alt={post.title} className="w-full h-auto" />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <div className="mb-12">
            <p className="text-2xl font-bold text-slate-400 leading-tight tracking-tight border-l-4 border-amber-400 pl-8 italic">
              {post.excerpt}
            </p>
          </div>
        )}

        {/* Content Body */}
        <div 
          className="prose prose-slate prose-lg max-w-none 
            prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-[#022c22]
            prose-p:text-slate-600 prose-p:font-medium prose-p:leading-relaxed
            prose-strong:text-[#022c22] prose-strong:font-black
            prose-img:rounded-[2rem] prose-img:shadow-lg
            prose-hr:border-slate-100
            space-y-6"
          dangerouslySetInnerHTML={{ __html: post.body }} 
        />

        <hr className="mt-20 mb-12 border-slate-100" />
        
        {/* Footer Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 py-10 bg-slate-50 rounded-[2.5rem] px-10">
           <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Enjoyed this story?</h4>
              <p className="text-sm font-black text-[#022c22]">Follow our harvest journey on Instagram</p>
           </div>
           <Link href="/blog" className="h-14 px-10 bg-[#022c22] text-white rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
              Back to All Articles
           </Link>
        </div>
      </article>
    </div>
  );
}
