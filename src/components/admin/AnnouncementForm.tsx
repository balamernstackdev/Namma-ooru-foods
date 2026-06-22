'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Eye, ToggleLeft, ToggleRight, ArrowRight, Megaphone,
  Palette, Calendar, Target, AlignLeft, Loader2
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import { toast } from 'sonner';

const OFFER_TYPES = ['Coupon Offer', 'Festival Offer', 'Shipping Offer', 'Vendor Promotion', 'Flash Sale', 'New Arrival', 'Combo Deal'];

interface FormState {
  title: string;
  message: string;
  couponCode: string;
  buttonText: string;
  redirectUrl: string;
  offerType: string;
  bgColor: string;
  textColor: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priorityOrder: number;
  vendorId: string;
  categoryId: string;
  productId: string;
  publishHomepage: boolean;
  announcementType: string;
}

const defaultForm: FormState = {
  title: '', message: '', couponCode: '', buttonText: '', redirectUrl: '',
  offerType: 'Coupon Offer', bgColor: '#0F7A4D', textColor: '#FFFFFF',
  startDate: '', endDate: '', isActive: true, priorityOrder: 0,
  vendorId: '', categoryId: '', productId: '', publishHomepage: false,
  announcementType: 'TOP_ANNOUNCEMENT_BAR'
};

interface Props {
  mode: 'create' | 'edit';
  announcementId?: number;
  initialData?: Partial<FormState>;
}

export default function AnnouncementForm({ mode, announcementId, initialData }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ ...defaultForm, ...initialData });
  const [saving, setSaving] = useState(false);

  const [vendors, setVendors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [vRes, cRes, pRes] = await Promise.all([
          fetch(`${API_URL}/api/sub-vendors`),
          fetch(`${API_URL}/api/categories?all=true`),
          fetch(`${API_URL}/api/products?limit=500`)
        ]);
        const [v, c, p] = await Promise.all([vRes.json(), cRes.json(), pRes.json()]);
        setVendors(Array.isArray(v) ? v : v?.vendors || []);
        setCategories(Array.isArray(c) ? c : c?.categories || []);
        setProducts(Array.isArray(p) ? p : p?.products || []);
      } catch {}
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (initialData) setForm(f => ({ ...f, ...initialData }));
  }, [JSON.stringify(initialData)]);

  const set = (key: keyof FormState, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message || !form.startDate || !form.endDate) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title,
      message: form.message,
      couponCode: form.couponCode || null,
      buttonText: form.buttonText || null,
      redirectUrl: form.redirectUrl || null,
      offerType: form.offerType,
      bgColor: form.bgColor,
      textColor: form.textColor,
      startDate: form.startDate,
      endDate: form.endDate,
      isActive: form.isActive,
      priorityOrder: Number(form.priorityOrder),
      vendorId: form.vendorId ? parseInt(form.vendorId) : null,
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      productId: form.productId ? parseInt(form.productId) : null,
      announcementType: form.announcementType,
      publishHomepage: form.publishHomepage,
      status: form.isActive ? 'ACTIVE' : 'INACTIVE',
      createdByType: 'ADMIN'
    };

    try {
      const url = mode === 'edit' ? `${API_URL}/api/offer-announcements/${announcementId}` : `${API_URL}/api/offer-announcements`;
      const res = await fetch(url, {
        method: mode === 'edit' ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success(mode === 'edit' ? 'Announcement updated!' : 'Announcement created!');
        router.push('/admin/marketing/announcement-bar');
      } else {
        const e = await res.json();
        toast.error(e.error || 'Failed to save');
      }
    } catch {
      toast.error('Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'h-12 px-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAF7] font-medium text-sm text-[#111827] focus:border-[#0F7A4D] focus:outline-none focus:ring-2 focus:ring-[#0F7A4D]/10 transition-all w-full';
  const labelCls = 'text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-2 block';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-32">

      {/* BACK NAV */}
      <div className="flex items-center gap-3">
        <Link href="/admin/marketing/announcement-bar" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#6B7280] hover:text-[#0F7A4D] transition-colors">
          <ArrowLeft size={15} /> Back to Announcement Bars
        </Link>
      </div>

      {/* PAGE HEADER */}
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-7 shadow-sm flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center">
          <Megaphone className="text-[#0F7A4D]" size={22} />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#111827] tracking-tighter">
            {mode === 'edit' ? 'Edit Announcement' : 'Create Announcement Bar'}
          </h1>
          <p className="text-[11px] uppercase tracking-widest font-bold text-[#6B7280] mt-0.5">
            {mode === 'edit' ? 'Update campaign settings and targeting' : 'Configure a new promo banner for the storefront'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── LEFT / MAIN COLUMN ── */}
        <div className="xl:col-span-2 space-y-6">

          {/* SECTION 1: Content */}
          <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-7 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-[#E5E7EB]">
              <AlignLeft size={16} className="text-[#0F7A4D]" />
              <h2 className="text-sm font-black text-[#111827] uppercase tracking-wider">Announcement Content</h2>
            </div>

            <div>
              <label className={labelCls}>Offer Title *</label>
              <input type="text" required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Pongal Festival Sale" className={inputCls} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={labelCls.replace('mb-2', '')}>Offer Message *</label>
                <span className="text-[10px] font-bold text-[#6B7280]">{form.message.length}/50</span>
              </div>
              <textarea required rows={2} maxLength={50} value={form.message} onChange={e => set('message', e.target.value)}
                placeholder="e.g. Flat 20% OFF on Traditional Foods"
                className="w-full p-4 rounded-xl border border-[#E5E7EB] bg-[#F8FAF7] font-medium text-sm text-[#111827] focus:border-[#0F7A4D] focus:outline-none focus:ring-2 focus:ring-[#0F7A4D]/10 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Offer Type</label>
                <select value={form.offerType} onChange={e => set('offerType', e.target.value)} className={inputCls.replace('font-medium', 'font-bold')}>
                  {OFFER_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Coupon Code (Optional)</label>
                <input type="text" value={form.couponCode} onChange={e => set('couponCode', e.target.value.toUpperCase())} placeholder="e.g. PONGAL20" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Button Text (Optional)</label>
                <input type="text" value={form.buttonText} onChange={e => set('buttonText', e.target.value)} placeholder="e.g. Shop Now" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Redirect URL (Optional)</label>
                <input type="text" value={form.redirectUrl} onChange={e => set('redirectUrl', e.target.value)} placeholder="e.g. /products" className={inputCls} />
              </div>
            </div>
          </div>

          {/* SECTION 2: Appearance */}
          <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-7 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-[#E5E7EB]">
              <Palette size={16} className="text-[#0F7A4D]" />
              <h2 className="text-sm font-black text-[#111827] uppercase tracking-wider">Appearance Settings</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>Background Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.bgColor} onChange={e => set('bgColor', e.target.value)} className="h-12 w-14 p-1 rounded-xl border border-[#E5E7EB] cursor-pointer bg-[#F8FAF7]" />
                  <input type="text" value={form.bgColor} onChange={e => set('bgColor', e.target.value)} className="h-12 flex-1 px-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAF7] font-mono font-bold text-sm text-[#111827] focus:border-[#0F7A4D] focus:outline-none" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Text Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.textColor} onChange={e => set('textColor', e.target.value)} className="h-12 w-14 p-1 rounded-xl border border-[#E5E7EB] cursor-pointer bg-[#F8FAF7]" />
                  <input type="text" value={form.textColor} onChange={e => set('textColor', e.target.value)} className="h-12 flex-1 px-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAF7] font-mono font-bold text-sm text-[#111827] focus:border-[#0F7A4D] focus:outline-none" />
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Display Format</label>
              <select value={form.announcementType} onChange={e => set('announcementType', e.target.value)} className={inputCls.replace('font-medium', 'font-bold')}>
                <option value="TOP_ANNOUNCEMENT_BAR">Top Announcement Bar</option>
                <option value="HERO_BANNER">Hero Banner Slider</option>
                <option value="POPUP_OFFER">Popup Offer Modal</option>
                <option value="VENDOR_PROMOTION">Vendor Promotion Section</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Active Status</label>
                <button type="button" onClick={() => set('isActive', !form.isActive)}
                  className="w-full h-12 flex items-center gap-3 px-4 border border-[#E5E7EB] bg-[#F8FAF7] rounded-xl hover:bg-[#E5E7EB] transition-colors">
                  {form.isActive ? <ToggleRight className="text-[#0F7A4D]" size={26} /> : <ToggleLeft className="text-[#6B7280]" size={26} />}
                  <span className="text-sm font-bold text-[#111827] uppercase tracking-wider">{form.isActive ? 'Active' : 'Disabled'}</span>
                </button>
              </div>
              <div>
                <label className={labelCls}>Publish on Homepage Slider</label>
                <button type="button" onClick={() => set('publishHomepage', !form.publishHomepage)}
                  className="w-full h-12 flex items-center gap-3 px-4 border border-[#E5E7EB] bg-[#F8FAF7] rounded-xl hover:bg-[#E5E7EB] transition-colors">
                  {form.publishHomepage ? <ToggleRight className="text-[#0F7A4D]" size={26} /> : <ToggleLeft className="text-[#6B7280]" size={26} />}
                  <span className="text-sm font-bold text-[#111827] uppercase tracking-wider">{form.publishHomepage ? 'Yes' : 'No'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 3: Schedule */}
          <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-7 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-[#E5E7EB]">
              <Calendar size={16} className="text-[#0F7A4D]" />
              <h2 className="text-sm font-black text-[#111827] uppercase tracking-wider">Schedule</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Start Date *</label>
                <input type="date" required value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>End Date *</label>
                <input type="date" required value={form.endDate} onChange={e => set('endDate', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Priority Order</label>
                <input type="number" min={0} value={form.priorityOrder} onChange={e => set('priorityOrder', parseInt(e.target.value) || 0)} placeholder="0" className={inputCls} />
              </div>
            </div>
          </div>

          {/* SECTION 4: Targeting */}
          <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-7 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-[#E5E7EB]">
              <Target size={16} className="text-[#0F7A4D]" />
              <h2 className="text-sm font-black text-[#111827] uppercase tracking-wider">Target Audience <span className="text-[9px] font-bold text-[#6B7280] normal-case tracking-normal ml-1">(Optional)</span></h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Vendor / Brand</label>
                <select value={form.vendorId} onChange={e => set('vendorId', e.target.value)} className={inputCls.replace('font-medium', 'font-bold')}>
                  <option value="">All Vendors</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} className={inputCls.replace('font-medium', 'font-bold')}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Product</label>
                <select value={form.productId} onChange={e => set('productId', e.target.value)} className={inputCls.replace('font-medium', 'font-bold')}>
                  <option value="">All Products</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN: Live Preview (sticky) ── */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 shadow-sm xl:sticky xl:top-6 space-y-4">
            <div className="flex items-center gap-2 pb-4 border-b border-[#E5E7EB]">
              <Eye size={16} className="text-[#0F7A4D]" />
              <h2 className="text-sm font-black text-[#111827] uppercase tracking-wider">Live Preview</h2>
            </div>

            {/* Preview Bar */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6B7280] mb-2">Top Announcement Bar</p>
              <div style={{ backgroundColor: form.bgColor, color: form.textColor }}
                className="w-full min-h-[44px] flex flex-wrap items-center justify-center px-3 py-2.5 rounded-xl text-center transition-all duration-200 shadow-md relative overflow-hidden gap-2">
                <span className="animate-bounce text-sm">🎉</span>
                <span className="font-extrabold uppercase tracking-wide bg-white/20 px-2 py-0.5 rounded text-[10px]">{form.offerType}</span>
                <span className="font-black text-sm">{form.title || 'Offer Title'}:</span>
                <span className="opacity-90 text-xs">{form.message || 'Your offer message goes here...'}</span>
                {form.couponCode && (
                  <span className="inline-flex items-center gap-1 bg-[#F59E0B] text-slate-900 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase animate-pulse border border-amber-300">
                    Use: {form.couponCode}
                  </span>
                )}
                {form.buttonText && (
                  <button type="button" className="px-3 py-1 bg-[#F59E0B] text-slate-900 font-black text-[9px] uppercase tracking-wider rounded-full flex items-center gap-1 shadow-sm">
                    {form.buttonText} <ArrowRight size={9} />
                  </button>
                )}
              </div>
            </div>

            {/* Color Swatches */}
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#6B7280]">Color Palette</p>
              <div className="flex gap-2">
                <div className="flex-1 rounded-lg overflow-hidden h-8 border border-[#E5E7EB]" style={{ backgroundColor: form.bgColor }} />
                <div className="flex-1 rounded-lg overflow-hidden h-8 border border-[#E5E7EB]" style={{ backgroundColor: form.textColor }} />
              </div>
            </div>

            {/* Quick Info */}
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between"><span className="text-[#6B7280] font-bold">Type</span><span className="font-black text-[#111827]">{form.announcementType.replace(/_/g, ' ')}</span></div>
              <div className="flex justify-between"><span className="text-[#6B7280] font-bold">Status</span><span className={`font-black ${form.isActive ? 'text-[#0F7A4D]' : 'text-red-500'}`}>{form.isActive ? 'Active' : 'Disabled'}</span></div>
              {form.startDate && <div className="flex justify-between"><span className="text-[#6B7280] font-bold">Starts</span><span className="font-black text-[#111827]">{form.startDate}</span></div>}
              {form.endDate && <div className="flex justify-between"><span className="text-[#6B7280] font-bold">Ends</span><span className="font-black text-[#111827]">{form.endDate}</span></div>}
              <div className="flex justify-between"><span className="text-[#6B7280] font-bold">Priority</span><span className="font-black text-[#111827]">{form.priorityOrder}</span></div>
              <div className="flex justify-between"><span className="text-[#6B7280] font-bold">Homepage</span><span className={`font-black ${form.publishHomepage ? 'text-[#0F7A4D]' : 'text-[#6B7280]'}`}>{form.publishHomepage ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-[#E5E7EB] z-40 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link href="/admin/marketing/announcement-bar"
            className="h-11 px-6 rounded-xl border border-[#E5E7EB] text-[11px] font-black uppercase tracking-widest text-[#6B7280] hover:bg-[#F8FAF7] transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="h-11 px-8 rounded-xl bg-[#0F7A4D] hover:bg-[#0c633e] text-white font-black text-[11px] uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {mode === 'edit' ? 'Save Changes' : 'Launch Campaign'}
          </button>
        </div>
      </div>
    </form>
  );
}
