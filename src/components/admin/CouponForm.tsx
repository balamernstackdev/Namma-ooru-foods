'use client';

import React, { useState, useEffect } from 'react';
import {
 Tag, Save, ArrowLeft, Loader2, Calendar, Zap, ShieldAlert,
 Percent, IndianRupee, HelpCircle, Clock, Globe, Plus, Search,
 Check, X, Eye, Sparkles, Filter, Layers, ShoppingBag, UserCheck, AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface CouponFormProps {
 initialData?: any;
 mode: 'create' | 'edit';
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const InputWrapper = ({ label, children, helpText }: any) => (
 <div className="space-y-2 flex-1">
 <div className="flex items-center justify-between px-1">
 <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
 {label}
 </label>
 {helpText && (
 <div className="group relative">
 <HelpCircle size={14} className="text-slate-300 cursor-help hover:text-blue-500 transition-all" />
 <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-slate-900 text-white text-[10px] rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 leading-relaxed font-bold">
 {helpText}
 </div>
 </div>
 )}
 </div>
 <div className="relative">{children}</div>
 </div>
);

const SectionHeader = ({ title, icon: Icon, colorClass = "text-blue-600" }: any) => (
 <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
 <div className={`p-2 rounded-xl bg-white shadow-sm ${colorClass}`}>
 <Icon size={16} />
 </div>
 <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{title}</h2>
 </div>
);

export default function CouponForm({ initialData, mode }: CouponFormProps) {
 const router = useRouter();
 const { addToast } = useToast();
 const [submitting, setSubmitting] = useState(false);

 // Load backend selection options
 const { data: brandsData } = useSWR<any>(`${API_URL}/api/brands?limit=200&includeEmpty=true`, fetcher);
 const { data: categoriesData } = useSWR<any>(`${API_URL}/api/categories?limit=200&all=true`, fetcher);
 const { data: productsData } = useSWR<any>(`${API_URL}/api/products?limit=1000`, fetcher);

 const brands = Array.isArray(brandsData?.subVendors) ? brandsData.subVendors : [];
 const categories = Array.isArray(categoriesData?.categories) ? categoriesData.categories : [];
 const products = Array.isArray(productsData?.products) ? productsData.products : (Array.isArray(productsData) ? productsData : []);

 // Local state form configuration
 const [formData, setFormData] = useState({
 id: initialData?.id || '',
 code: initialData?.code || '',
 type: initialData?.type || 'PERCENTAGE',
 value: initialData?.value?.toString() || '',
 minOrderValue: initialData?.minOrderValue?.toString() || '0',
 maxDiscount: initialData?.maxDiscountAmount?.toString() || '',
 usageLimit: initialData?.usageLimit?.toString() || '',
 perUserLimit: initialData?.perUserLimit?.toString() || '1',
 expiresAt: initialData?.expiresAt ? new Date(initialData.expiresAt).toISOString().slice(0, 16) : '',

 // Enterprise Dynamic Promo engine fields
 couponScope: initialData?.couponScope || 'GENERAL',
 benefitType: initialData?.benefitType || initialData?.type || 'PERCENTAGE',
 firstOrderOnly: !!initialData?.firstOrderOnly,

 // JSON lists parsed or configured
 couponVendors: initialData?.couponVendors ? (typeof initialData.couponVendors === 'string' ? JSON.parse(initialData.couponVendors) : initialData.couponVendors) : [],
 couponProducts: initialData?.couponProducts ? (typeof initialData.couponProducts === 'string' ? JSON.parse(initialData.couponProducts) : initialData.couponProducts) : [],
 couponCategories: initialData?.couponCategories ? (typeof initialData.couponCategories === 'string' ? JSON.parse(initialData.couponCategories) : initialData.couponCategories) : [],

 excludedVendors: initialData?.excludedVendors ? (typeof initialData.excludedVendors === 'string' ? JSON.parse(initialData.excludedVendors) : initialData.excludedVendors) : [],
 excludedProducts: initialData?.excludedProducts ? (typeof initialData.excludedProducts === 'string' ? JSON.parse(initialData.excludedProducts) : initialData.excludedProducts) : [],
 excludedCategories: initialData?.excludedCategories ? (typeof initialData.excludedCategories === 'string' ? JSON.parse(initialData.excludedCategories) : initialData.excludedCategories) : [],
 });

 // Search selectors filter states
 const [brandSearch, setBrandSearch] = useState('');
 const [productSearch, setProductSearch] = useState('');
 const [categorySearch, setCategorySearch] = useState('');
 const [excludeCategorySearch, setExcludeCategorySearch] = useState('');
 const [excludeProductSearch, setExcludeProductSearch] = useState('');

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!formData.code.trim()) {
 addToast('Error', 'Coupon Code is mandatory');
 return;
 }
 if (!formData.value || parseFloat(formData.value) <= 0) {
 addToast('Error', 'Benefit value must be a positive number');
 return;
 }

 setSubmitting(true);
 try {
 const url = mode === 'edit'
 ? `${API_URL}/api/coupons/${formData.id}`
 : `${API_URL}/api/coupons`;
 const method = mode === 'edit' ? 'PUT' : 'POST';

 const payload = {
 ...formData,
 code: formData.code.toUpperCase(),
 type: formData.benefitType || formData.type, // Backwards compatibility alias
 };

 const res = await fetch(url, {
 method,
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload)
 });

 if (res.ok) {
 addToast('Success', mode === 'edit' ? 'Campaign Registry Updated Successfully' : 'Coupon Created Successfully!');
 router.push('/admin/coupons');
 router.refresh();
 } else {
 const err = await res.json();
 addToast('Error', err.error || 'Failed to save dynamic coupon configuration');
 }
 } catch (err) {
 console.error(err);
 addToast('Error', 'Network connectivity or protocol violation');
 } finally {
 setSubmitting(false);
 }
 };

 const toggleVendorSelection = (vendorId: number) => {
 setFormData(prev => {
 const list = prev.couponVendors.includes(vendorId)
 ? prev.couponVendors.filter((v: number) => v !== vendorId)
 : [...prev.couponVendors, vendorId];
 return { ...prev, couponVendors: list };
 });
 };

 const toggleProductSelection = (productId: number) => {
 setFormData(prev => {
 const list = prev.couponProducts.includes(productId)
 ? prev.couponProducts.filter((p: number) => p !== productId)
 : [...prev.couponProducts, productId];
 return { ...prev, couponProducts: list };
 });
 };

 const toggleCategorySelection = (categoryId: number) => {
 setFormData(prev => {
 const list = prev.couponCategories.includes(categoryId)
 ? prev.couponCategories.filter((c: number) => c !== categoryId)
 : [...prev.couponCategories, categoryId];
 return { ...prev, couponCategories: list };
 });
 };

 const toggleExcludeProduct = (productId: number) => {
 setFormData(prev => {
 const list = prev.excludedProducts.includes(productId)
 ? prev.excludedProducts.filter((p: number) => p !== productId)
 : [...prev.excludedProducts, productId];
 return { ...prev, excludedProducts: list };
 });
 };

 const toggleExcludeCategory = (categoryId: number) => {
 setFormData(prev => {
 const list = prev.excludedCategories.includes(categoryId)
 ? prev.excludedCategories.filter((c: number) => c !== categoryId)
 : [...prev.excludedCategories, categoryId];
 return { ...prev, excludedCategories: list };
 });
 };

 return (
 <div className="w-full pb-32 animate-in fade-in duration-700 bg-slate-50/50 min-h-screen">

 {/* Sticky Header */}
 <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 py-5 px-6 shadow-sm">
 <div className="max-w-[1400px] mx-auto flex items-center justify-between">
 <div className="flex items-center gap-4">
 <button
 onClick={() => router.push('/admin/coupons')}
 className="h-11 w-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
 >
 <ArrowLeft size={18} />
 </button>
 <div>
 <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
 {/* <Sparkles className="h-6 w-6 text-blue-500" /> */}
 {mode === 'edit' ? 'Edit Coupon' : 'Create Coupon'}
 </h1>
 <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5">Create a Discount Coupon</p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <button onClick={() => router.push('/admin/coupons')} className="px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-all">Discard</button>
 <button
 form="coupon-form"
 type="submit"
 disabled={submitting}
 className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all active:scale-95 uppercase tracking-widest"
 >
 {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
 {mode === 'edit' ? 'Save Changes' : 'Create Coupon'}
 </button>
 </div>
 </div>
 </div>

 <div className="max-w-[1400px] mx-auto px-6 mt-8 w-full animate-in fade-in duration-500">

 <form id="coupon-form" onSubmit={handleSubmit} className="space-y-8">

 {/* SECTION 1: TRIGGER & VALUE */}
 <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
 <SectionHeader title="Coupon Information" icon={Zap} colorClass="text-amber-500" />
 <div className="p-8 space-y-6">

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <InputWrapper label="Coupon Code" helpText="The unique promo code string customers enter at checkout.">
 <div className="relative">
 <Tag size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 required
 value={formData.code}
 onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
 placeholder="e.g. NAMMA2026"
 className="w-full h-14 pl-12 pr-6 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 ring-blue-500/5 outline-none font-mono font-black text-slate-900 text-sm transition-all"
 />
 </div>
 </InputWrapper>

 <InputWrapper label="Benefit Type" helpText="Select dynamic discount mechanics.">
 <div className="relative">
 <select
 value={formData.benefitType}
 onChange={e => setFormData({ ...formData, benefitType: e.target.value, type: e.target.value })}
 className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-800 text-sm appearance-none"
 >
 <option value="PERCENTAGE">Percentage Off (%)</option>
 <option value="FIXED">Flat Discount (₹)</option>
 <option value="FREE_SHIPPING">Free Shipping</option>
 <option value="BOGO">BOGO (Buy X Get Y Free/Discounted)</option>
 <option value="CASHBACK">Cashback Wallet Credit (%)</option>
 </select>
 <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
 <Globe size={16} />
 </div>
 </div>
 </InputWrapper>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <InputWrapper label="Benefit Value" helpText="Enter discount percentage or flat rupee value.">
 <div className="relative">
 {formData.benefitType === 'PERCENTAGE' || formData.benefitType === 'CASHBACK' ? (
 <Percent size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
 ) : (
 <IndianRupee size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
 )}
 <input
 required
 type="number"
 disabled={formData.benefitType === 'FREE_SHIPPING'}
 value={formData.benefitType === 'FREE_SHIPPING' ? '0' : formData.value}
 onChange={e => setFormData({ ...formData, value: e.target.value })}
 placeholder="0.00"
 className="w-full h-14 pl-12 pr-6 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all disabled:opacity-40"
 />
 </div>
 </InputWrapper>

 <InputWrapper label="Min Order Value (₹)" helpText="Minimum subtotal required to validate promotion.">
 <div className="relative">
 <IndianRupee size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 required
 type="number"
 value={formData.minOrderValue}
 onChange={e => setFormData({ ...formData, minOrderValue: e.target.value })}
 placeholder="0.00"
 className="w-full h-14 pl-12 pr-6 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all"
 />
 </div>
 </InputWrapper>

 <InputWrapper label="Max Discount Cap (₹)" helpText="Only applicable for Percentage type discounts.">
 <div className="relative">
 <IndianRupee size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="number"
 disabled={formData.benefitType !== 'PERCENTAGE' && formData.benefitType !== 'CASHBACK'}
 value={formData.maxDiscount}
 onChange={e => setFormData({ ...formData, maxDiscount: e.target.value })}
 placeholder="Optional"
 className="w-full h-14 pl-12 pr-6 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all disabled:opacity-30"
 />
 </div>
 </InputWrapper>
 </div>

 <div className="border-t border-slate-100 pt-6">
 <InputWrapper label="Lifespan & Expiration" helpText="The date/time after which this coupon becomes completely invalid.">
 <div className="relative">
 <Calendar size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="datetime-local"
 value={formData.expiresAt}
 onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
 className="w-full h-14 pl-12 pr-6 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all"
 />
 </div>
 </InputWrapper>
 </div>

 </div>
 </div>

 {/* SECTION 2: TARGET SCOPE */}
 <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
 <SectionHeader title="Target Customers" icon={Layers} colorClass="text-blue-500" />
 <div className="p-8 space-y-6">

 <InputWrapper label="Coupon Scope / Type" helpText="Specify target boundaries for dynamic coupon validation.">
 <div className="relative">
 <select
 value={formData.couponScope}
 onChange={e => {
 const newScope = e.target.value;
 if (newScope !== 'GENERAL') {
 setFormData({ ...formData, couponScope: newScope, excludedCategories: [], excludedProducts: [] });
 } else {
 setFormData({ ...formData, couponScope: newScope });
 }
 }}
 className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-black text-slate-900 text-sm appearance-none"
 >
 <option value="GENERAL">All Products (Applies to entire store)</option>
 <option value="VENDOR">Specific Vendor / Brand</option>
 <option value="PRODUCT">Specific Products</option>
 <option value="CATEGORY">Specific Category</option>
 </select>
 <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
 <Layers size={16} />
 </div>
 </div>
 </InputWrapper>

 {/* Dynamic Scopes Rendering */}
 {formData.couponScope === 'VENDOR' && (
 <div className="space-y-4 border-t border-slate-100 pt-6 animate-in fade-in duration-300">
 <div className="space-y-2">
 <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
 Select Vendors
 {formData.couponVendors.length > 0 && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[9px]">{formData.couponVendors.length} selected</span>}
 </h3>
 <div className="relative">
 <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 placeholder="Search vendors..."
 value={brandSearch}
 onChange={e => setBrandSearch(e.target.value)}
 className="w-full h-10 pl-10 pr-4 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 text-slate-850 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
 />
 </div>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-2 no-scrollbar">
 {[...brands]
 .filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
 .sort((a: any, b: any) => {
 const aSelected = formData.couponVendors.includes(a.id);
 const bSelected = formData.couponVendors.includes(b.id);
 return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
 })
 .map((b: any) => {
 const selected = formData.couponVendors.includes(b.id);
 return (
 <button
 key={b.id}
 type="button"
 onClick={() => toggleVendorSelection(b.id)}
 className={`flex items-center gap-3 p-3 border rounded-xl transition-all text-left shadow-sm
 ${selected
 ? 'border-blue-500 bg-blue-50/50 '
 : 'border-slate-100 bg-white hover:border-slate-300'
 }`}
 >
 <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
 {b.logo ? <img src={b.logo} alt="" className="object-cover h-full w-full" /> : <ShoppingBag size={14} className="text-slate-400" />}
 </div>
 <div className="min-w-0">
 <p className="text-[11px] font-black text-slate-850 truncate">{b.name}</p>
 {selected && <p className="text-[9px] font-bold text-blue-500">✓ Selected</p>}
 </div>
 </button>
 );
 })}
 </div>
 </div>
 )}

 {formData.couponScope === 'PRODUCT' && (
 <div className="space-y-4 border-t border-slate-100 pt-6 animate-in fade-in duration-300">
 <div className="space-y-2">
 <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
 Select Products
 {formData.couponProducts.length > 0 && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[9px]">{formData.couponProducts.length} selected</span>}
 </h3>
 <div className="relative">
 <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 placeholder="Search products..."
 value={productSearch}
 onChange={e => setProductSearch(e.target.value)}
 className="w-full h-10 pl-10 pr-4 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 text-slate-850 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
 />
 </div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2 no-scrollbar">
 {[...products]
 .filter((p: any) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
 .sort((a: any, b: any) => {
 const aSelected = formData.couponProducts.includes(a.id);
 const bSelected = formData.couponProducts.includes(b.id);
 return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
 })
 .map((p: any) => {
 const selected = formData.couponProducts.includes(p.id);
 return (
 <button
 key={p.id}
 type="button"
 onClick={() => toggleProductSelection(p.id)}
 className={`flex items-center gap-3 p-3 border rounded-xl transition-all text-left shadow-sm
 ${selected
 ? 'border-blue-500 bg-blue-50/50 '
 : 'border-slate-100 bg-white hover:border-slate-300'
 }`}
 >
 <div className="h-10 w-10 rounded-lg bg-slate-100 shrink-0 overflow-hidden">
 <img src={p.image} alt="" className="object-cover h-full w-full" />
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-[11px] font-black text-slate-855 truncate">{p.name}</p>
 <p className="text-[9px] font-bold text-slate-400">{selected ? <span className="text-blue-500">✓ Selected</span> : `₹${p.price}`}</p>
 </div>
 </button>
 );
 })}
 </div>
 </div>
 )}

 {formData.couponScope === 'CATEGORY' && (
 <div className="space-y-4 border-t border-slate-100 pt-6 animate-in fade-in duration-300">
 <div className="space-y-2">
 <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
 Select Categories
 {formData.couponCategories.length > 0 && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[9px]">{formData.couponCategories.length} selected</span>}
 </h3>
 <div className="relative">
 <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 placeholder="Search categories..."
 value={categorySearch}
 onChange={e => setCategorySearch(e.target.value)}
 className="w-full h-10 pl-10 pr-4 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
 />
 </div>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-2 no-scrollbar">
 {[...categories]
 .filter((c: any) => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
 .sort((a: any, b: any) => {
 const aSelected = formData.couponCategories.includes(a.id);
 const bSelected = formData.couponCategories.includes(b.id);
 return aSelected === bSelected ? 0 : aSelected ? -1 : 1;
 })
 .map((c: any) => {
 const selected = formData.couponCategories.includes(c.id);
 return (
 <button
 key={c.id}
 type="button"
 onClick={() => toggleCategorySelection(c.id)}
 className={`flex items-center gap-3 p-3 border rounded-xl transition-all text-left shadow-sm
 ${selected
 ? 'border-blue-500 bg-blue-50/50 '
 : 'border-slate-100 bg-white hover:border-slate-300'
 }`}
 >
 <Layers size={14} className={selected ? 'text-blue-500' : 'text-slate-400'} />
 <p className="text-[11px] font-black text-slate-855 truncate">{c.name}</p>
 </button>
 );
 })}
 </div>
 </div>
 )}

 </div>
 </div>

 {/* SECTION 3: TARGETING RULES */}
 <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
 <SectionHeader title="Usage Limits & Restrictions" icon={Filter} colorClass="text-purple-600" />
 <div className="p-8 space-y-8">

 {/* Limit options */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <InputWrapper label="Global Usage Limit" helpText="Total number of times this coupon can be used across all shoppers.">
 <input
 type="number"
 value={formData.usageLimit}
 onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
 placeholder="Leave empty for unlimited redemptions"
 className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all"
 />
 </InputWrapper>

 <InputWrapper label="Per User Limit" helpText="How many times a single customer identity can apply this discount code.">
 <input
 required
 type="number"
 value={formData.perUserLimit}
 onChange={e => setFormData({ ...formData, perUserLimit: e.target.value })}
 placeholder="1"
 className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all"
 />
 </InputWrapper>
 </div>

 {/* Checkbox targeting rules */}
 <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 ">
 <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider mb-4">Eligibility</h3>
 <label className="flex items-center gap-3 cursor-pointer group">
 <input
 type="checkbox"
 checked={formData.firstOrderOnly}
 onChange={e => setFormData({ ...formData, firstOrderOnly: e.target.checked })}
 className="h-5 w-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-500"
 />
 <div>
 <p className="text-xs font-black text-slate-855 group-hover:text-blue-500 transition-colors">First Order Only Restriction</p>
 <p className="text-[10px] text-slate-400 font-medium">If active, this coupon will only validate if the customer has 0 previous successful checkout records.</p>
 </div>
 </label>
 </div>

 {/* Exclusions lists */}
 {formData.couponScope === 'GENERAL' && (
 <div className="space-y-6 pt-6 border-t border-slate-100 animate-in fade-in duration-300">
 <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
 <ShieldAlert className="h-4 w-4 text-red-500" />
 Excluded Items
 </h3>

 {/* Excluded Categories */}
 <div className="space-y-3">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Exclude Categories</label>
 <div className="relative w-full sm:w-64">
 <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 placeholder="Search categories..."
 value={excludeCategorySearch}
 onChange={e => setExcludeCategorySearch(e.target.value)}
 className="w-full h-9 pl-9 pr-3 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all"
 />
 </div>
 </div>
 <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 border border-slate-200 rounded-xl bg-slate-50 ">
 {categories.filter((c: any) => c.name.toLowerCase().includes(excludeCategorySearch.toLowerCase())).map((c: any) => {
 const excluded = formData.excludedCategories.includes(c.id);
 return (
 <button
 key={c.id}
 type="button"
 onClick={() => toggleExcludeCategory(c.id)}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border flex items-center gap-1.5
 ${excluded
 ? 'bg-red-50 text-red-600 border-red-200 '
 : 'bg-white border-slate-200 text-slate-500'
 }`}
 >
 {excluded ? <X size={10} /> : <Plus size={10} />}
 {c.name}
 </button>
 );
 })}
 </div>
 </div>

 {/* Excluded Products */}
 <div className="space-y-3">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Exclude Products</label>
 <div className="relative w-full sm:w-64">
 <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 placeholder="Search products..."
 value={excludeProductSearch}
 onChange={e => setExcludeProductSearch(e.target.value)}
 className="w-full h-9 pl-9 pr-3 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all"
 />
 </div>
 </div>
 <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border border-slate-200 rounded-xl bg-slate-50 ">
 {products.filter((p: any) => p.name.toLowerCase().includes(excludeProductSearch.toLowerCase())).map((p: any) => {
 const excluded = formData.excludedProducts.includes(p.id);
 return (
 <button
 key={p.id}
 type="button"
 onClick={() => toggleExcludeProduct(p.id)}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border flex items-center gap-1.5
 ${excluded
 ? 'bg-red-50 text-red-600 border-red-200 '
 : 'bg-white border-slate-200 text-slate-500'
 }`}
 >
 {excluded ? <X size={10} /> : <Plus size={10} />}
 <span className="truncate max-w-[120px]">{p.name}</span>
 </button>
 );
 })}
 </div>
 </div>

 </div>
 )}

 </div>
 </div>

 </form>

 </div>
 </div>
 );
}
