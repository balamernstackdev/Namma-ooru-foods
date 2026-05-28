import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Tag, Calendar } from 'lucide-react';
import { API_URL } from '@/lib/api';

async function getBlogPosts() {
  try {
    const res = await fetch(`${API_URL}/api/blog`, { next: { revalidate: 300 } });
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.posts)) return data.posts;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  } catch { return []; }
}

export const metadata: Metadata = {
  title: 'namma ooru Foods — Blog | Organic Farming & Nutrition Insights',
  description: 'Discover stories from our farms, nutrition tips, and the journey of traditional food — straight from the Producters at namma ooru Foods.',
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="mx-auto w-full py-12" style={{ maxWidth: '1400px', paddingLeft: '5%', paddingRight: '5%' }}>
      <div className="mb-12">
        <p className="text-[10px] uppercase font-black tracking-widest text-amber-600 mb-2">The Product Journal</p>
        <h1 className="text-5xl font-black text-[#022c22] tracking-tighter mb-4">Farm Stories & Nutrition</h1>
        <p className="text-slate-500 font-medium text-lg max-w-2xl">
          Insights from our farmers, nutritionists, and the rich tradition of Indian organic food.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-20 text-center shadow-sm">
          <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-300">No articles published yet</h2>
          <p className="text-slate-300 text-sm mt-2">Our farming stories are being Producted. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-video overflow-hidden bg-slate-100">
                {post.image ? (
                  <img src={post.image} alt={post.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-slate-200" />
                  </div>
                )}
              </div>
              <div className="p-8">
                {post.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 2).map((tag: string) => (
                      <span key={tag} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                        <Tag className="h-3 w-3" /> {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h2 className="text-lg font-black text-[#022c22] tracking-tight mb-3 group-hover:text-emerald-700 transition-colors leading-tight">{post.title}</h2>
                {post.excerpt && <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3">{post.excerpt}</p>}
                <div className="flex items-center gap-2 mt-6">
                  <Calendar className="h-3.5 w-3.5 text-slate-300" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
