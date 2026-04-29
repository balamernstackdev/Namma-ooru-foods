'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Search, AlertCircle, Loader2, Plus, Edit2, Trash2, Save, ShoppingBag, X } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface Variant {
  id: number;
  sku: string;
  name?: string;
  price: number;
  stock: number;
  productId: number;
  product: { name: string; image?: string };
}

interface Product {
  id: number;
  name: string;
}

export default function AdminVariantsPage() {
  const { addToast } = useToast();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    sku: '',
    price: '',
    stock: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, pRes] = await Promise.all([
        fetch(`${API_URL}/api/variants`),
        fetch(`${API_URL}/api/products`)
      ]);
      const vData = await vRes.json();
      const pData = await pRes.json();
      setVariants(vData);
      setProducts(pData);
    } catch (err) {
      addToast('Error', 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  const updateVariantDetails = async (id: number, data: any) => {
    setUpdating(id);
    try {
      const res = await fetch(`${API_URL}/api/variants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        setVariants(prev => prev.map(v => v.id === id ? { ...v, ...updated } : v));
        addToast('Success', 'Inventory updated');
      }
    } finally {
      setUpdating(null);
    }
  };

  const deleteVariant = async (id: number) => {
    if (!confirm('Permanently remove this variant from inventory?')) return;
    try {
      const res = await fetch(`${API_URL}/api/variants/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVariants(prev => prev.filter(v => v.id !== id));
        addToast('Success', 'Variant removed');
      }
    } catch (err) {
      addToast('Error', 'Failed to delete variant');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editId
        ? `${API_URL}/api/variants/${editId}`
        : `${API_URL}/api/variants`;
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        addToast('Success', `Variant ${editId ? 'updated' : 'created'}`);
        setShowForm(false);
        fetchData();
      } else {
        addToast('Error', 'Failed to save variant');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (v: Variant) => {
    setEditId(v.id);
    setFormData({
      productId: v.productId.toString(),
      name: v.name || '',
      sku: v.sku,
      price: v.price.toString(),
      stock: v.stock.toString()
    });
    setShowForm(true);
  };

  const filtered = variants.filter(v =>
    v.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative min-h-[70vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[var(--admin-sidebar)] tracking-tighter">Inventory Console</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Directly manage stock and SKUs for all product variations.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setFormData({ productId: '', name: '', sku: '', price: '', stock: '' }); }}
          className="h-16 px-10 rounded-2xl bg-[var(--admin-sidebar)] text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-900 transition-all shadow-xl"
        >
          <Plus size={20} className="text-[var(--admin-accent)]" /> New SKU Variant
        </button>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center gap-4 bg-slate-50/20">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <input
              type="text"
              placeholder="Search by SKU or Product name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white rounded-xl pl-11 pr-4 text-xs font-bold outline-none border border-slate-100 focus:border-[var(--admin-accent)] transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 self-start md:self-auto">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
              {variants.filter(v => v.stock < 10).length} Low Stock Alerts
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Product / SKU</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Specification</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Price</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Stock Balance</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" /></td></tr>
              ) : filtered.map(variant => (
                <tr key={variant.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-50 overflow-hidden border border-slate-100 shrink-0">
                        {variant.product.image ? <img src={variant.product.image} className="w-full h-full object-cover" /> : <ShoppingBag className="h-full w-full p-2 text-slate-200" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-[var(--admin-sidebar)] leading-tight">{variant.product.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{variant.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                      {variant.name || 'STANDARD'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-[var(--admin-sidebar)]">
                    ₹{variant.price.toLocaleString()}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            setVariants(prev => prev.map(v => v.id === variant.id ? { ...v, stock: val } : v));
                          }
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val !== variant.stock) {
                            updateVariantDetails(variant.id, { stock: val });
                          }
                        }}
                        className={`w-20 h-9 rounded-lg border-2 text-center text-xs font-black outline-none transition-all ${variant.stock <= 5 ? 'border-red-100 bg-red-50 text-red-600' :
                            variant.stock <= 20 ? 'border-amber-100 bg-amber-50 text-amber-600' :
                              'border-slate-100 bg-slate-50 text-[var(--admin-sidebar)]'
                          }`}
                      />
                      {updating === variant.id && <Loader2 className="h-3 w-3 animate-spin text-[var(--admin-accent)]" />}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(variant)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-[var(--admin-sidebar)] hover:text-white transition-all"><Edit2 size={14} /></button>
                      <button onClick={() => deleteVariant(variant.id)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-red-300 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-8 py-20 text-center font-bold text-slate-300">No inventory matches your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Overlay for Form */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-[var(--admin-sidebar)] tracking-tighter">{editId ? 'Edit Variation' : 'New Variant'}</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Configure SKU specifics and warehouse initial values.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center">
                <X size={20} />
              </button>
            </div>

            <div className="p-10">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Parent Product</label>
                  <select
                    required
                    value={formData.productId}
                    onChange={e => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-[var(--admin-accent)] transition-all"
                  >
                    <option value="">Select Product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Variant Name / Spec</label>
                  <input required placeholder="e.g. 500ml Bottle" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-[var(--admin-accent)]" />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">SKU Code</label>
                  <input required placeholder="e.g. OIL-SES-500" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-[var(--admin-accent)]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Price (₹)</label>
                    <input required type="number" placeholder="0.00" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-[var(--admin-accent)]" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Initial Stock</label>
                    <input required type="number" placeholder="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-[var(--admin-accent)]" />
                  </div>
                </div>

                <div className="md:col-span-2 pt-6 flex gap-4">
                  <button disabled={submitting} type="submit" className="flex-1 h-16 bg-[var(--admin-sidebar)] text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-slate-200">
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save size={20} />} {editId ? 'Update Variation' : 'Confirm & Create Variant'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="h-16 px-10 border-2 border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
