import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Calendar, Tag } from 'lucide-react';
import { API_URL } from '@/lib/api';

async function getBlogPost(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/blog/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return [
    { slug: 'harvest-journal' }
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: `${post.title} | Namma Orru Foods Blog`,
    description: post.excerpt || post.body.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : [],
      type: 'article',
      publishedTime: post.publishedAt
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <>
      {/* JSON-LD Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          image: post.image,
          datePublished: post.publishedAt,
          author: { "@type": "Organization", name: "Namma Orru Foods" },
          publisher: { "@type": "Organization", name: "Namma Orru Foods" }
        })}}
      />

      <div className="mx-auto w-full py-12" style={{ maxWidth: '900px', paddingLeft: '5%', paddingRight: '5%' }}>
        <Link href="/blog" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-8 bg-emerald-50 w-fit px-4 py-2 rounded-full hover:bg-emerald-100 transition-all">
          <ChevronLeft className="h-4 w-4" /> All Articles
        </Link>

        {post.image && (
          <div className="rounded-[2rem] overflow-hidden aspect-video mb-10 bg-slate-100">
            <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
          </div>
        )}

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag: string) => (
              <span key={tag} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl">
                <Tag className="h-3 w-3" /> {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-black text-[#022c22] tracking-tighter leading-tight mb-4">{post.title}</h1>

        <div className="flex items-center gap-2 mb-10">
          <Calendar className="h-4 w-4 text-slate-300" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {post.excerpt && <p className="text-xl text-slate-600 font-medium leading-relaxed mb-10 border-l-4 border-amber-400 pl-6">{post.excerpt}</p>}

        <div
          className="prose prose-lg max-w-none text-slate-700 [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-[#022c22] [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4 [&_p]:leading-relaxed [&_p]:mb-6 [&_strong]:text-[#022c22] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6"
          dangerouslySetInnerHTML={{ __html: post.body.replace(/\n/g, '<br/>') }}
        />
      </div>
    </>
  );
}
