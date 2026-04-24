'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, ToggleLeft, ToggleRight, Clock, Search } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface Coupon {
  id: number; code: string; type: string; value: number; minOrderValue: number;
  maxDiscount?: number; usageLimit?: number; perUserLimit: number; expiresAt?: string;
  isActive: boolean; _count?: { usages: number };
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'PERCENTAGE', value: '', minOrderValue: '', maxDiscount: '', usageLimit: '', perUserLimit: '1', expiresAt: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/coupons`)
      .then(r => r.json()).then(setCoupons).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const url = editId 
        ? `${API_URL}/api/coupons/${editId}`
        : `${API_URL}/api/coupons`;
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      if (editId) {
        setCoupons(prev => prev.map(c => c.id === editId ? { ...data, _count: c._count } : c));
      } else {
        setCoupons(prev => [{ ...data, _count: { usages: 0 } }, ...prev]);
      }
      setShowForm(false);
      setEditId(null);
      setForm({ code: '', type: 'PERCENTAGE', value: '', minOrderValue: '', maxDiscount: '', usageLimit: '', perUserLimit: '1', expiresAt: '' });
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (coupon: Coupon) => {
     setEditId(coupon.id);
     setForm({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value.toString(),
        minOrderValue: coupon.minOrderValue.toString(),
        maxDiscount: coupon.maxDiscount?.toString() || '',
        usageLimit: coupon.usageLimit?.toString() || '',
        perUserLimit: coupon.perUserLimit.toString(),
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : ''
     });
     setShowForm(true);
  };

  const handleToggle = async (id: number) => {
    await fetch(`${API_URL}/api/coupons/${id}/toggle`, { method: 'PATCH' });
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this coupon?')) return;
    await fetch(`${API_URL}/api/coupons/${id}`, { method: 'DELETE' });
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[var(--admin-sidebar)] tracking-tighter">Coupon Engine</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Create and manage discount codes with full lifecycle control.</p>
        </div>
        <button id="create-coupon-btn" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ code: '', type: 'PERCENTAGE', value: '', minOrderValue: '', maxDiscount: '', usageLimit: '', perUserLimit: '1', expiresAt: '' }); }} className="h-16 px-10 rounded-2xl bg-[var(--admin-sidebar)] text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-900 transition-all shadow-2xl">
          <Plus size={20} className="text-[var(--admin-accent)]" /> New Coupon
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
          <h3 className="text-base font-black text-[var(--admin-sidebar)] uppercase tracking-widest mb-8">{editId ? 'Modify Coupon' : 'New Coupon Details'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { label: 'Coupon Code *', key: 'code', placeholder: 'HARVEST25' },
              { label: 'Discount Value *', key: 'value', placeholder: '25', type: 'number' },
              { label: 'Min Order (₹)', key: 'minOrderValue', placeholder: '499', type: 'number' },
              { label: 'Max Discount (₹)', key: 'maxDiscount', placeholder: 'Optional cap', type: 'number' },
              { label: 'Usage Limit (total)', key: 'usageLimit', placeholder: 'Unlimited', type: 'number' },
              { label: 'Per User Limit', key: 'perUserLimit', placeholder: '1', type: 'number' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">{field.label}</label>
                <input type={field.type || 'text'} value={(form as any)[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-sm text-[var(--admin-sidebar)] outline-none focus:border-[var(--admin-accent)] transition-all" />
              </div>
            ))}
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Coupon Type *</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-sm text-[var(--admin-sidebar)] outline-none focus:border-[var(--admin-accent)] transition-all">
                <option value="PERCENTAGE">Percentage Off</option>
                <option value="FIXED">Fixed Amount Off</option>
                <option value="FREE_SHIPPING">Free Shipping</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Expires At</label>
              <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-sm text-[var(--admin-sidebar)] outline-none focus:border-[var(--admin-accent)] transition-all" />
            </div>
            {error && <p className="col-span-full text-red-500 text-xs font-bold">{error}</p>}
            <div className="col-span-full flex gap-3">
              <button type="submit" disabled={submitting} id="save-coupon-btn" className="px-8 py-3 rounded-xl bg-[var(--admin-sidebar)] text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50">
                {submitting ? 'Processing...' : editId ? 'Update Coupon' : 'Create Coupon'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border-2 border-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                {['Code', 'Type & Value', 'Conditions', 'Usage', 'Expiry', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="px-8 py-20 text-center"><div className="h-12 w-12 border-4 border-slate-100 border-t-[var(--admin-accent)] rounded-full animate-spin mx-auto" /></td></tr>
              ) : coupons.map(coupon => (
                <tr key={coupon.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <span className="font-mono text-sm font-black text-[var(--admin-sidebar)] bg-slate-100 px-3 py-1.5 rounded-lg">{coupon.code}</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-black text-[var(--admin-sidebar)]">
                      {coupon.type === 'PERCENTAGE' ? `${coupon.value}% Off` : coupon.type === 'FIXED' ? `₹${coupon.value} Off` : 'Free Shipping'}
                    </p>
                    {coupon.maxDiscount && <p className="text-[10px] text-slate-400 font-bold mt-0.5">Max ₹{coupon.maxDiscount}</p>}
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-slate-500">Min ₹{coupon.minOrderValue}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Limit: {coupon.perUserLimit}/user</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-[var(--admin-sidebar)]">{coupon._count?.usages || 0}</p>
                    <p className="text-[10px] text-slate-400 font-bold">of {coupon.usageLimit ?? '∞'}</p>
                  </td>
                  <td className="px-8 py-5">
                    {coupon.expiresAt ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(coupon.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    ) : <span className="text-xs text-slate-300 font-bold">Never</span>}
                  </td>
                  <td className="px-8 py-5">
                    <button onClick={() => handleToggle(coupon.id)} className="transition-all">
                      {coupon.isActive
                        ? <ToggleRight className="h-7 w-7 text-emerald-500" />
                        : <ToggleLeft className="h-7 w-7 text-slate-300" />}
                    </button>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(coupon)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-[var(--admin-sidebar)] hover:text-white transition-all">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(coupon.id)} className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 text-red-300 hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && coupons.length === 0 && (
                <tr><td colSpan={7} className="px-8 py-20 text-center text-slate-300 font-bold">No coupons created yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
