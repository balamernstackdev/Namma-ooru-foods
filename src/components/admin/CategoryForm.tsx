'use client';

import React, { useState, useEffect } from 'react';
import {
  Trash2,
  ImageIcon,
  Loader2,
  Upload,
  ArrowLeft,
  Save,
  Tag,
  ChevronDown,
  HelpCircle,
  Globe,
  Settings,
  MonitorCheck,
  LayoutList,
  Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface CategoryFormProps {
  initialData?: any;
  mode: 'create' | 'edit';
}

const InputWrapper = ({ label, children, helpText }: any) => (
  <div className="space-y-2 flex-1">
    <div className="flex items-center justify-between px-1">
      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
        {label}
      </label>
      {helpText && (
        <div className="group relative">
          <HelpCircle size={14} className="text-slate-300 cursor-help hover:text-blue-500 transition-all" />
          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {helpText}
          </div>
        </div>
      )}
    </div>
    <div className="relative">{children}</div>
  </div>
);

const SectionHeader = ({ title, icon: Icon, colorClass = "text-blue-600" }: any) => (
  <div className="px-8 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
    <Icon size={16} className={colorClass} />
    <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">{title}</h2>
  </div>
);

export default function CategoryForm({ initialData, mode }: CategoryFormProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    name: initialData?.name || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
    parentId: initialData?.parentId?.toString() || '',
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    showOnHome: initialData?.showOnHome !== undefined ? initialData.showOnHome : false,
    sortOrder: initialData?.sortOrder?.toString() || '0',
    metaTitle: initialData?.metaTitle || '',
    metaDescription: initialData?.metaDescription || ''
  });

  useEffect(() => {
    fetch(`${API_URL}/api/admin-ops/categories?all=true&limit=1000`)
      .then(r => r.json())
      .then(data => {
        setCategories(data.categories || []);
      });
  }, []);

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
        setFormData(prev => ({ ...prev, image: data.url }));
        addToast('Success', 'Category visual updated');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = mode === 'edit'
        ? `${API_URL}/api/admin-ops/categories/${formData.id}`
        : `${API_URL}/api/admin-ops/categories`;
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        addToast('Success', mode === 'edit' ? 'Category synchronized' : 'Category architected');
        router.push('/admin/categories');
      } else {
        const err = await res.json();
        addToast('Error', err.error || 'Failed to save category');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCategory = async () => {
    if (!formData.id) return;
    if (!confirm('Permanently remove this structural section?')) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/admin-ops/categories/${formData.id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Deleted', 'Category removed from catalog');
        router.push('/admin/categories');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-24 animate-in fade-in duration-1000 bg-[#f8fafc]">
      <div className="sticky top-0 z-40 bg-[#f8fafc]/80 backdrop-blur-xl border-b border-slate-200 mb-8 py-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/categories')}
              className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'edit' ? 'Edit Category' : 'Architect New Category'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/categories')} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">Discard</button>
            <button
              form="category-form"
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-[#2563eb] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-[#1d4ed8] disabled:opacity-50 transition-all active:scale-95 uppercase tracking-wider"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {mode === 'edit' ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-2 space-y-10">
        <form id="category-form" onSubmit={handleSubmit} className="max-w-full mx-auto space-y-10 px-4">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Architecture Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
                <SectionHeader title="Category Architecture" icon={Tag} colorClass="text-blue-600" />
                <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InputWrapper label="Category Name" helpText="Visible name of the category in the storefront.">
                        <input
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Traditional Millets"
                          className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 ring-blue-500/5 outline-none font-bold text-slate-900 text-sm transition-all"
                        />
                      </InputWrapper>

                      <InputWrapper label="Parent Hierarchy" helpText="Nest this category under another for hierarchy.">
                        <div className="relative">
                          <select
                            value={formData.parentId}
                            onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                            className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm appearance-none bg-white"
                          >
                            <option value="">Top Level (Main Category)</option>
                            {categories.filter(c => c.id.toString() !== formData.id).map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronDown size={18} />
                          </div>
                        </div>
                      </InputWrapper>
                    </div>

                    <InputWrapper label="Catalog Description" helpText="Detailed description for the category page.">
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe how this category serves our catalog architecture..."
                        className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-600 text-sm resize-none"
                      />
                    </InputWrapper>
                  </div>

                  <div className="lg:col-span-4 flex flex-col">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-3 px-1">Visual Asset</label>
                    <div
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      className={`flex-1 min-h-[200px] bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-6 group cursor-pointer hover:border-blue-500/50 transition-all overflow-hidden relative ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                      {isUploading ? (
                        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                      ) : (formData.image && formData.image.trim() !== '') ? (
                        <div className="relative w-full h-full group">
                          <img src={formData.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Category" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                            <Upload size={20} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-all">
                            <ImageIcon size={24} />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Upload Banner</span>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300 mt-1">Recommended: 800 x 400px</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* SEO Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
                <SectionHeader title="Search Engine Optimization" icon={Globe} colorClass="text-emerald-600" />
                <div className="p-8 space-y-8">
                  <InputWrapper label="Meta Title" helpText="The title tag for search engines. Recommended: 60 chars.">
                    <div className="relative">
                       <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input
                        value={formData.metaTitle}
                        onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
                        placeholder="Traditional Millets | Premium Organic Catalog"
                        className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all"
                      />
                    </div>
                  </InputWrapper>

                  <InputWrapper label="Meta Description" helpText="The snippet displayed in search results. Recommended: 155 chars.">
                    <textarea
                      rows={3}
                      value={formData.metaDescription}
                      onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="Discover our curated range of traditional millets, stone-pressed oils, and organic staples..."
                      className="w-full px-6 py-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-600 text-sm resize-none"
                    />
                  </InputWrapper>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-8">
              {/* Display Settings */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                 <SectionHeader title="Display & Layout" icon={MonitorCheck} colorClass="text-purple-600" />
                 <div className="p-8 space-y-6">
                    <InputWrapper label="Navigation Priority" helpText="Lower numbers appear first in menus.">
                      <div className="relative">
                        <LayoutList size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          value={formData.sortOrder}
                          onChange={e => setFormData({ ...formData, sortOrder: e.target.value })}
                          className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm"
                        />
                      </div>
                    </InputWrapper>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all">
                        <div>
                          <p className="text-[11px] font-black text-slate-900 uppercase">Active Status</p>
                          <p className="text-[10px] font-bold text-slate-400">Enable in customer shop</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                          className={`h-6 w-11 rounded-full transition-all relative ${formData.isActive ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                          <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${formData.isActive ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all">
                        <div>
                          <p className="text-[11px] font-black text-slate-900 uppercase">Featured Section</p>
                          <p className="text-[10px] font-bold text-slate-400">Show on homepage grid</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, showOnHome: !formData.showOnHome })}
                          className={`h-6 w-11 rounded-full transition-all relative ${formData.showOnHome ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                          <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${formData.showOnHome ? 'left-6' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                 </div>
               </div>

              {/* Danger Zone */}
              {mode === 'edit' && (
                <div className="bg-red-50 rounded-2xl border border-red-100 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Trash2 size={18} className="text-red-600" />
                    <h4 className="text-[10px] font-black text-red-900 uppercase tracking-widest text-slate-900">Danger Zone</h4>
                  </div>
                  <p className="text-[11px] font-bold text-red-800 leading-relaxed mb-6 italic">
                    Removing this category will orphan its products unless they are re-assigned.
                  </p>
                  <button
                    type="button"
                    onClick={deleteCategory}
                    disabled={submitting}
                    className="w-full px-6 py-4 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                  >
                    Delete Category
                  </button>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
