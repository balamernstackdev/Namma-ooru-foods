'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Calendar, User, ShieldCheck, ShoppingBag, ShieldAlert } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface UserDetailClientProps {
  id: string;
}

export default function UserDetailClient({ id }: UserDetailClientProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);
        const token = localStorage.getItem('namma_orru_token');
        const res = await fetch(`${API_URL}/api/admin-ops/users/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to fetch user');
        }
        const data = await res.json();
        setUserInfo(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-white gap-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="h-10 w-10 border-4 border-emerald-950 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#022c22]">Retrieving User profile...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm animate-in fade-in duration-500">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 mb-6">
          <ShieldAlert size={36} strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase">User Not Found</h3>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 max-w-sm leading-relaxed">
          The requested user may have been deleted or no longer exists.
        </p>
        <button
          onClick={() => router.push('/admin/notifications')}
          className="mt-8 h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 cursor-pointer border-none"
        >
          <ArrowLeft size={14} />
          Back to Notifications
        </button>
      </div>
    );
  }

  if (error || !userInfo) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-6">
          <ShieldAlert size={36} strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase">Fetch Error</h3>
        <p className="text-slate-500 font-bold text-xs mt-2 max-w-sm">
          {error || 'Unable to load user details at this moment.'}
        </p>
        <button
          onClick={() => router.push('/admin/notifications')}
          className="mt-8 h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 cursor-pointer border-none"
        >
          Back to Notifications
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <button
            onClick={() => router.push('/admin/notifications')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors mb-3 bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft size={12} /> Back to Notifications
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
            User <span className="text-emerald-600">{userInfo.name}</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            Registered ID: PV-20{userInfo.id}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${
            userInfo.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
            userInfo.role === 'VENDOR' ? 'bg-emerald-100 text-emerald-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            Role: {userInfo.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card details */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <User className="text-emerald-600" size={18} />
            User Information
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl flex items-center justify-center font-black text-2xl">
                {userInfo.name?.[0] || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-black text-slate-950 truncate leading-snug">{userInfo.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Role: {userInfo.role}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-slate-300 shrink-0" />
                <span className="truncate">{userInfo.email}</span>
              </div>
              {userInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-300 shrink-0" />
                  <span>{userInfo.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-300 shrink-0" />
                <span>Joined: {new Date(userInfo.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Group / Segment details & Analytics metrics */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" size={18} />
            Marketplace Groups
          </h3>

          <div className="space-y-4">
            <div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Group</span>
              <span className="font-extrabold text-slate-800 text-sm mt-1 block">
                {userInfo.group?.name || 'Default Customer Group'}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Segment Targeting</span>
              <span className="font-extrabold text-slate-800 text-sm mt-1 block">
                {userInfo.segment?.name || 'General Segment'}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Total Orders Count</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 mt-2">
                <ShoppingBag size={12} /> {userInfo._count?.orders || 0} Orders
              </span>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-emerald-600" size={18} />
            Recent Orders
          </h3>

          <div className="space-y-3">
            {userInfo.orders && userInfo.orders.length > 0 ? (
              userInfo.orders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between p-3 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => router.push(`/admin/orders/${o.id}`)}>
                  <div>
                    <span className="text-xs font-extrabold text-slate-850">#ORD-{o.id.toString().padStart(4, '0')}</span>
                    <span className="text-[9px] text-slate-400 font-bold block mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 block">₹{Number(o.totalAmount).toLocaleString()}</span>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider mt-0.5 ${
                      o.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' :
                      o.status === 'CANCELLED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs font-bold text-slate-400 text-center py-6">No order logs found for this customer.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
