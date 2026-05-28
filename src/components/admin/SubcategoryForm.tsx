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
  Layers,
  Settings,
  MonitorCheck,
  LayoutList
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface SubcategoryFormProps {
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

export default function SubcategoryForm({ initialData, mode }: SubcategoryFormProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    name: initialData?.name || '',
    categoryId: initialData?.categoryId?.toString() || '',
    imageUrl: initialData?.imageUrl || '',
    status: initialData?.status || 'ACTIVE'
  });

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then(r => r.json())
      .then(data => {
        // Original app filters c => !c.parentId to only show top level parent categories
        const parentCats = (data.categories || []).filter((c: any) => !c.parentId);
        setCategories(parentCats);
      })
      .catch(err => console.error('Failed to load parent categories', err));
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
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
        addToast('Success', 'Subcategory visual updated');
      } else {
        addToast('Error', 'Image upload failed');
      }
    } catch (err) {
      addToast('Error', 'Server connecting issue during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.categoryId) {
      return addToast('Error', 'Subcategory Name and Parent Category are required');
    }

    setSubmitting(true);
    try {
      const url = mode === 'edit'
        ? `${API_URL}/api/subcategories/${formData.id}`
        : `${API_URL}/api/subcategories`;
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        categoryId: Number(formData.categoryId),
        slug: formData.name.toLowerCase().replace(/\s+/g, '-')
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        addToast('Success', mode === 'edit' ? 'Subcategory updated' : 'Subcategory created');
        router.push('/admin/subcategories');
        router.refresh();
      } else {
        const err = await res.json();
        addToast('Error', err.error || 'Failed to save subcategory');
      }
    } catch (err) {
      addToast('Error', 'Network or server failure');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSubcategory = async () => {
    if (!formData.id) return;
    if (!confirm('Permanently remove this subcategory mapping?')) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/subcategories/${formData.id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Deleted', 'Subcategory removed from catalog');
        router.push('/admin/subcategories');
        router.refresh();
      } else {
        addToast('Error', 'Failed to delete subcategory');
      }
    } catch (err) {
      addToast('Error', 'Failed to delete');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-24 animate-in fade-in duration-1000 bg-[#f8fafc]">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-[#f8fafc]/80 backdrop-blur-xl border-b border-slate-200 mb-8 py-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/subcategories')}
              className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-all shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
              {mode === 'edit' ? 'Edit Subcategory' : 'New Subcategory Map'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/subcategories')} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">Discard</button>
            <button
              form="subcategory-form"
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-[#059669] text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-[#047857] disabled:opacity-50 transition-all active:scale-95 uppercase tracking-wider"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {mode === 'edit' ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-2 space-y-10">
        <form id="subcategory-form" onSubmit={handleSubmit} className="max-w-full mx-auto space-y-10 px-4">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-8">

              {/* Main Detail Architecture Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden w-full">
                <SectionHeader title="Subcategory Architecture" icon={Tag} colorClass="text-emerald-600" />
                <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8 space-y-8 flex flex-col justify-center">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                      {/* Subcategory Name */}
                      <InputWrapper label="Subcategory Name" helpText="The granular product label (e.g. Ghee, Honey, Rice).">
                        <input
                          required
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Natural Honey"
                          className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 ring-emerald-500/5 outline-none font-bold text-slate-900 text-sm transition-all shadow-sm"
                        />
                      </InputWrapper>

                      {/* Parent Master Category */}
                      <InputWrapper label="Parent Category" helpText="Map this item to a top-level category.">
                        <div className="relative">
                          <select
                            required
                            value={formData.categoryId}
                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none font-bold text-sm appearance-none bg-white shadow-sm"
                          >
                            <option value="" disabled>Select Parent</option>
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronDown size={18} />
                          </div>
                        </div>
                      </InputWrapper>

                    </div>

                    {/* <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-6 flex items-start gap-4">
                      <Layers className="text-emerald-600 mt-1 shrink-0" size={20} />
                      <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Granular Hierarchy Mapping</h4>
                        <p className="text-[11px] font-medium text-slate-400 mt-1 leading-relaxed">Subcategories provide specialized segments for shoppers. Associating products with distinct subcategories drastically enhances catalog navigation and SEO discovery indices.</p>
                      </div>
                    </div> */}

                  </div>

                  {/* Visual Image Asset Upload */}
                  <div className="lg:col-span-4 flex flex-col">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-3 px-1">Icon / Visual Asset</label>
                    <div
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      className={`flex-1 min-h-[200px] bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-6 group cursor-pointer hover:border-emerald-500/50 transition-all overflow-hidden relative ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                      {isUploading ? (
                        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
                      ) : (formData.imageUrl && formData.imageUrl.trim() !== '') ? (
                        <div className="relative w-full h-full group">
                          <img src={formData.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Subcategory" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm">
                            <Upload size={20} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-all">
                            <ImageIcon size={24} />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Upload Asset</span>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-slate-300 mt-1">Recommended: 400 x 400px</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="col-span-12 lg:col-span-4 space-y-8">

              {/* Display Status Setting */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <SectionHeader title="Visibility Controls" icon={MonitorCheck} colorClass="text-emerald-600" />
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all">
                      <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase">Active Status</p>
                        <p className="text-[10px] font-bold text-slate-400">Publish into storefront catalog</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: formData.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                        className={`h-6 w-11 rounded-full transition-all relative ${formData.status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${formData.status === 'ACTIVE' ? 'left-6' : 'left-1'}`} />
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
                    <h4 className="text-[10px] font-black text-red-900 uppercase tracking-widest">Delete</h4>
                  </div>
                  <p className="text-[11px] font-bold text-red-800 leading-relaxed mb-6 italic">
                    Deleting this subcategory removes association with all linked SKUs. Operation irreversible.
                  </p>
                  <button
                    type="button"
                    onClick={deleteSubcategory}
                    disabled={submitting}
                    className="w-full px-6 py-4 rounded-xl bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 active:scale-95"
                  >
                    Delete
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
