'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import { API_URL } from '@/lib/api';
import AdminPagination from '@/components/admin/AdminPagination';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { ActionGroup, EditButton, DeleteButton } from '@/components/ui/ActionButtons';

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
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">Coupon <span className="text-emerald-600">Management</span></h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Manage {totalCoupons} active and historical discount campaigns.</p>
        </div>
        <button
          onClick={() => router.push('/admin/coupons/new')}
          className="h-14 px-8 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
        >
          <Plus size={18} /> New Campaign
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto min-h-[280px]">
          <table className="w-full text-left border-collapse min-w-[1000px] admin-data-table">
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
                    <ActionGroup>
                      <EditButton onClick={() => router.push(`/admin/coupons/edit/${coupon.id}`)} />
                      <DeleteButton onClick={() => handleDelete(coupon.id)} />
                    </ActionGroup>
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

        {/* Mobile View - Card Layout */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-6 space-y-4 animate-pulse">
                <div className="h-10 bg-slate-100 rounded-xl w-1/3"></div>
                <div className="h-12 bg-slate-50 rounded-2xl"></div>
              </div>
            ))
          ) : coupons.map(coupon => (
            <div key={coupon.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-black text-slate-900 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 uppercase tracking-wider shadow-sm">
                  {coupon.code}
                </span>
                <button onClick={() => handleToggle(coupon.id)} className="transition-all active:scale-90 shrink-0">
                  {coupon.isActive
                    ? <ToggleRight className="h-8 w-8 text-emerald-500" />
                    : <ToggleLeft className="h-8 w-8 text-slate-200" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Benefit</span>
                  <span className="font-black text-blue-600 block text-sm">
                    {coupon.type === 'PERCENTAGE' ? `${coupon.value}% Off` : coupon.type === 'FIXED' ? `₹${coupon.value} Off` : 'Free Shipping'}
                  </span>
                  {coupon.maxDiscount && <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-tighter">Max: ₹{coupon.maxDiscount}</span>}
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Usage Metrics</span>
                  <span className="font-extrabold text-slate-900 block text-sm">
                    {coupon._count?.usages || 0}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-tighter">of {coupon.usageLimit ?? '∞'} uses</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Rules & Logic</span>
                  <span className="font-bold text-slate-600 block">Min Order: ₹{coupon.minOrderValue} | Limit: {coupon.perUserLimit}/User</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Lifespan</span>
                  {coupon.expiresAt ? (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                      <Clock className="h-3.5 w-3.5 text-slate-300" />
                      {new Date(coupon.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  ) : <span className="text-[10px] text-slate-300 font-bold italic">Indefinite</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => router.push(`/admin/coupons/edit/${coupon.id}`)}
                  className="h-11 flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-xs font-bold"
                >
                  <Edit2 size={14} /> Edit Campaign
                </button>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="h-11 px-4 flex items-center justify-center rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {!loading && coupons.length === 0 && (
            <div className="py-20 text-center">
              <Tag size={48} className="mx-auto text-slate-100 mb-4" />
              <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest">Registry Empty</h3>
            </div>
          )}
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
