'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Loader2,
  ArrowLeft,
  Save,
  Trash2,
  Image as ImageIcon,
  BookOpen,
  Globe,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  X,
  Plus
} from 'lucide-react';
import { API_URL } from '@/lib/api';

// Professional Rich Text Editor
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => <div className="h-48 w-full bg-slate-50 animate-pulse rounded-xl border border-slate-200" />
});
import 'react-quill-new/dist/quill.snow.css';

interface BlogFormProps {
  editId?: number | null;
  initialData?: any;
}

// Standardized UI Wrappers
const InputWrapper = ({ label, children, helpText }: any) => (
  <div className="space-y-2 flex-1">
    <div className="flex items-center justify-between px-1">
      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      {helpText && (
        <div className="group relative">
          <HelpCircle size={14} className="text-slate-300 cursor-help hover:text-blue-500 transition-all shadow-sm" />
          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {helpText}
          </div>
        </div>
      )}
    </div>
    <div className="relative">
      {children}
    </div>
  </div>
);

const SectionHeader = ({ title, icon: Icon, colorClass = "text-blue-600" }: any) => (
  <div className="px-8 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
    <Icon size={16} className={colorClass} />
    <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">{title}</h2>
  </div>
);

export default function BlogForm({ editId, initialData }: BlogFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    slug: '', title: '', excerpt: '', body: '', image: '', tags: '', isPublished: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        slug: initialData.slug || '',
        title: initialData.title || '',
        excerpt: initialData.excerpt || '',
        body: initialData.body || '',
        image: initialData.image || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
        isPublished: !!initialData.isPublished
      });
    }
  }, [initialData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        body: uploadData,
      });

      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, image: data.url }));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      const res = editId
        ? await fetch(`${API_URL}/api/blog/admin/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch(`${API_URL}/api/blog/admin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/admin/blog');
      router.refresh();
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  }), []);

  const quillFormats = useMemo(() => [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'align', 'link', 'image'
  ], []);

  return (
    <div className="w-full pb-24 animate-in fade-in duration-1000 bg-[#f8fafc]">
      <style jsx global>{`
        .rich-text-container .ql-toolbar {
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          padding: 12px;
        }
        .rich-text-container .ql-container {
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          border: 1px solid #e2e8f0;
          border-top: none;
          min-height: 400px;
          font-family: inherit;
          font-size: 15px;
          background: white;
        }
        .rich-text-container .ql-editor {
          min-height: 400px;
          color: #475569;
          font-weight: 500;
          line-height: 1.6;
        }
        .rich-text-container .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
          font-weight: 500;
        }
      `}</style>

      {/* STICKY HEADER */}
      <div className="sticky top-0 z-40 bg-[#f8fafc]/80 backdrop-blur-xl border-b border-slate-200 mb-8 py-6 px-8">
        <div className="flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/blog')}
              className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {editId ? 'Edit Article' : 'New Article'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/blog')} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">Discard</button>
            <button form="blog-form" type="submit" disabled={submitting} className="px-8 py-3 rounded-xl bg-[#2563eb] text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-blue-500/20 hover:bg-[#1d4ed8] disabled:opacity-50 transition-all active:scale-95">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editId ? 'Update Master' : 'Publish Story'}
            </button>
          </div>
        </div>
      </div>

      <form id="blog-form" onSubmit={handleSubmit} className="max-w-6xl mx-auto px-8 space-y-10">

        {/* 1. IDENTITY & METADATA */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex  justify-between border-b border-slate-100 bg-slate-50/50 pr-8">
            <SectionHeader title="Create Blog" icon={BookOpen} colorClass="text-blue-600" />
            {form.slug && (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">URL Path:</span>
                <span className="text-[10px] font-mono font-bold text-blue-600">/blog/{form.slug}</span>
              </div>
            )}
          </div>
          <div className="p-8 space-y-8">
            <InputWrapper label="Blog Title" helpText="Keep it catchy but descriptive. Better for SEO.">
              <input type="text" required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: autoSlug(e.target.value) }))}
                className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 ring-blue-500/5 outline-none font-bold text-slate-900 text-sm transition-all" />
            </InputWrapper>

            <InputWrapper label="Classification Tags">
              <input type="text" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="organic, health, tradition"
                className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm" />
            </InputWrapper>

            <InputWrapper label="Marketplace Excerpt (Brief Summary)">
              <textarea rows={3} value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-600 text-sm resize-none" />
            </InputWrapper>
          </div>
        </div>

        {/* 2. MEDIA ASSETS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionHeader title="Visual Storytelling" icon={ImageIcon} colorClass="text-emerald-600" />
          <div className="p-8">
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`relative aspect-video max-w-2xl mx-auto rounded-3xl border-4 border-dashed border-slate-100 bg-slate-50/50 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all overflow-hidden ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Uploading to Gallery...</p>
                </div>
              ) : form.image ? (
                <>
                  <img src={form.image} className="w-full h-full object-cover" alt="Hero Preview" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                      <ImageIcon size={24} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setForm(p => ({ ...p, image: '' })); }}
                    className="absolute top-6 right-6 h-12 w-12 rounded-2xl bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 active:scale-95"
                  >
                    <Trash2 size={20} />
                  </button>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-all">
                    <Plus size={32} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Upload Hero Image</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Recommended size: 1200 x 630px (16:9)</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">PNG, JPG or WebP (Max 5MB)</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 3. THE MASTER MANUSCRIPT (RICH TEXT) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionHeader title="The Master Manuscript" icon={Sparkles} colorClass="text-amber-500" />
          <div className="p-8">
            <div className="rich-text-container">
              <ReactQuill theme="snow" value={form.body} onChange={val => setForm(p => ({ ...p, body: val }))} modules={quillModules} formats={quillFormats} placeholder="Once upon a time in our organic fields..." />
            </div>
          </div>
        </div>

        {/* 4. PUBLISHING CONTROLS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <SectionHeader title="Governance & Visibility" icon={Globe} colorClass="text-indigo-600" />
          <div className="p-8 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900">Visibility Status</h4>
              <p className="text-xs text-slate-400 font-medium">Control whether this article is live for customers to read.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} className="sr-only peer" />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
              <span className={`ml-3 text-[10px] font-black uppercase tracking-widest ${form.isPublished ? 'text-emerald-600' : 'text-slate-400'}`}>
                {form.isPublished ? 'Live & Published' : 'Draft Mode'}
              </span>
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-center gap-4 text-red-500 animate-shake">
            <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <X size={20} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest">Publishing Error</p>
              <p className="text-sm font-bold opacity-80">{error}</p>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}
