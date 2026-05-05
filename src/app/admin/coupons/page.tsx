'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import { API_URL } from '@/lib/api';
import AdminPagination from '@/components/admin/AdminPagination';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

interface Coupon {
  id: number;
  code: string;
  type: string;
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit: number;
  expiresAt?: string;
  isActive: boolean;
  _count?: { usages: number };
}

export default function AdminCouponsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCoupons(currentPage);
  }, [currentPage]);

  const fetchCoupons = (page: number) => {
    setLoading(true);
    fetch(`${API_URL}/api/coupons?page=${page}&limit=${itemsPerPage}`)
      .then(r => r.json())
      .then(data => {
        setCoupons(data.coupons || []);
        setTotalCoupons(data.total || 0);
        setTotalPages(data.totalPages || 0);
      })
      .finally(() => setLoading(false));
  };

  const handleToggle = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/coupons/${id}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
        addToast('Success', 'Campaign status toggled');
      }
    } catch (err) {
      addToast('Error', 'Failed to toggle status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently decommission this promotion? This will immediately invalidate all active codes.')) return;
    try {
      const res = await fetch(`${API_URL}/api/coupons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Success', 'Coupon purged from registry');
        fetchCoupons(currentPage);
      }
    } catch (err) {
      addToast('Error', 'Security protocol prevented deletion');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Promotion Registry</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Manage {totalCoupons} active and historical discount campaigns.</p>
        </div>
        <button 
          onClick={() => router.push('/admin/coupons/new')}
          className="h-14 px-8 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
        >
          <Plus size={18} /> New Campaign
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Coupon Code</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Benefit Profile</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Rules & Logic</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Usage Metrics</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Lifespan</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-8 py-6">
                      <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
                    </td>
                  </tr>
                ))
              ) : coupons.map(coupon => (
                <tr key={coupon.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="font-mono text-[11px] font-black text-slate-900 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 uppercase tracking-wider shadow-sm">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-blue-600">
                      {coupon.type === 'PERCENTAGE' ? `${coupon.value}% Off` : coupon.type === 'FIXED' ? `₹${coupon.value} Off` : 'Free Shipping'}
                    </p>
                    {coupon.maxDiscount && <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Capped at ₹{coupon.maxDiscount}</p>}
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[11px] font-bold text-slate-600">Min Order: ₹{coupon.minOrderValue}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">Limit: {coupon.perUserLimit}/User</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900">{coupon._count?.usages || 0}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">of {coupon.usageLimit ?? '∞'} Redemptions</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {coupon.expiresAt ? (
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-slate-300" />
                        {new Date(coupon.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    ) : <span className="text-[11px] text-slate-300 font-bold italic">Indefinite</span>}
                  </td>
                  <td className="px-8 py-6">
                    <button onClick={() => handleToggle(coupon.id)} className="transition-all active:scale-90">
                      {coupon.isActive
                        ? <ToggleRight className="h-8 w-8 text-emerald-500" />
                        : <ToggleLeft className="h-8 w-8 text-slate-200" />}
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => router.push(`/admin/coupons/edit/${coupon.id}`)} 
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(coupon.id)} 
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-red-300 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-24 text-center">
                    <Tag size={48} className="mx-auto text-slate-100 mb-6" />
                    <h3 className="text-xl font-black text-slate-200 uppercase tracking-widest">Registry Empty</h3>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
