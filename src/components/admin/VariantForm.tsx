'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Save,
  ArrowLeft,
  Loader2,
  Package,
  IndianRupee,
  Hash,
  HelpCircle,
  ChevronDown,
  Barcode,
  Weight,
  AlertTriangle,
  MonitorCheck,
  LayoutList
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface VariantFormProps {
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

export default function VariantForm({ initialData, mode }: VariantFormProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    productId: initialData?.productId?.toString() || '',
    name: initialData?.name || '',
    sku: initialData?.sku || '',
    barcode: initialData?.barcode || '',
    price: initialData?.price?.toString() || '',
    originalPrice: initialData?.originalPrice?.toString() || '',
    costPrice: initialData?.costPrice?.toString() || '',
    stock: initialData?.stock?.toString() || '',
    lowStockThreshold: initialData?.lowStockThreshold?.toString() || '5',
    weight: initialData?.weight?.toString() || '',
    sortOrder: initialData?.sortOrder?.toString() || '0',
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true
  });

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(r => r.json())
      .then(setProducts);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = mode === 'edit'
        ? `${API_URL}/api/variants/${formData.id}`
        : `${API_URL}/api/variants`;
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        addToast('Success', mode === 'edit' ? 'Variation synchronized' : 'Variation architected');
        router.push('/admin/variants');
      } else {
        const err = await res.json();
        addToast('Error', err.error || 'Failed to save variation');
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
              onClick={() => router.push('/admin/variants')}
              className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {mode === 'edit' ? 'Edit Variation' : 'Architect New Variation'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/variants')} className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">Discard</button>
            <button
              form="variant-form"
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

      <div className="px-2">
        <form id="variant-form" onSubmit={handleSubmit} className="max-w-full mx-auto space-y-10 px-4">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 space-y-8">
              {/* Specification Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <SectionHeader title="Entity Mapping" icon={Layers} colorClass="text-blue-600" />
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputWrapper label="Parent Product" helpText="The core product this variation belongs to.">
                      <div className="relative">
                        <select
                          required
                          value={formData.productId}
                          onChange={e => setFormData({ ...formData, productId: e.target.value })}
                          className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-sm appearance-none bg-white"
                        >
                          <option value="">Select Product...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronDown size={18} />
                        </div>
                      </div>
                    </InputWrapper>

                    <InputWrapper label="Variation Name / Spec" helpText="e.g. 500ml Bottle, 1kg Pack, Red Color.">
                      <input
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. 500ml Bottle"
                        className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all"
                      />
                    </InputWrapper>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputWrapper label="SKU (Stock Keeping Unit)" helpText="Internal unique identifier for inventory tracking.">
                      <div className="relative">
                        <Hash size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          required
                          value={formData.sku}
                          onChange={e => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="e.g. SKU-12345"
                          className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all"
                        />
                      </div>
                    </InputWrapper>

                    <InputWrapper label="Barcode / GTIN" helpText="Global Trade Item Number for scanning systems.">
                      <div className="relative">
                        <Barcode size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          value={formData.barcode}
                          onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                          placeholder="UPC / EAN Code"
                          className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm transition-all"
                        />
                      </div>
                    </InputWrapper>
                  </div>
                </div>
              </div>

              {/* Financials & Stock Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <SectionHeader title="Financials & Logistics" icon={Package} colorClass="text-emerald-600" />
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <InputWrapper label="Selling Price (₹)">
                      <div className="relative">
                        <IndianRupee size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          required
                          type="number"
                          value={formData.price}
                          onChange={e => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0.00"
                          className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-black text-blue-600 text-sm"
                        />
                      </div>
                    </InputWrapper>

                    <InputWrapper label="Compare Price (MRP)">
                      <div className="relative">
                        <IndianRupee size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          value={formData.originalPrice}
                          onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                          placeholder="0.00"
                          className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-400 line-through text-sm"
                        />
                      </div>
                    </InputWrapper>

                    <InputWrapper label="Cost per Item" helpText="Only visible to admins for profit analysis.">
                      <div className="relative">
                        <IndianRupee size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          value={formData.costPrice}
                          onChange={e => setFormData({ ...formData, costPrice: e.target.value })}
                          placeholder="Admin only"
                          className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm"
                        />
                      </div>
                    </InputWrapper>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <InputWrapper label="Current Stock">
                      <input
                        required
                        type="number"
                        value={formData.stock}
                        onChange={e => setFormData({ ...formData, stock: e.target.value })}
                        placeholder="0"
                        className="w-full h-14 px-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-black text-emerald-600 text-sm"
                      />
                    </InputWrapper>

                    <InputWrapper label="Low Stock Threshold" helpText="System will alert when stock falls below this level.">
                      <div className="relative">
                        <AlertTriangle size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          value={formData.lowStockThreshold}
                          onChange={e => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                          placeholder="5"
                          className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm"
                        />
                      </div>
                    </InputWrapper>

                    <InputWrapper label="Shipping Weight (kg)">
                      <div className="relative">
                        <Weight size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="number"
                          step="0.01"
                          value={formData.weight}
                          onChange={e => setFormData({ ...formData, weight: e.target.value })}
                          placeholder="0.00"
                          className="w-full h-14 pl-14 pr-6 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-bold text-slate-900 text-sm"
                        />
                      </div>
                    </InputWrapper>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-8">
               {/* Visibility Card */}
               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                 <SectionHeader title="Display Settings" icon={MonitorCheck} colorClass="text-purple-600" />
                 <div className="p-8 space-y-6">
                    <InputWrapper label="Sort Order" helpText="Lower numbers appear first in the dropdown.">
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

                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase">Availability Status</p>
                        <p className="text-[10px] font-bold text-slate-400">Toggle visibility in storefront</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                        className={`h-6 w-11 rounded-full transition-all relative ${formData.isActive ? 'bg-blue-600' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${formData.isActive ? 'left-6' : 'left-1'}`} />
                      </button>
                    </div>
                 </div>
               </div>

               <div className="bg-amber-50 rounded-2xl border border-amber-100 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle size={18} className="text-amber-600" />
                    <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Inventory Intelligence</h4>
                  </div>
                  <p className="text-[11px] font-bold text-amber-800 leading-relaxed">
                    Accurate weight specifications ensure correct shipping rate calculation at checkout, reducing logistics variance.
                  </p>
               </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
