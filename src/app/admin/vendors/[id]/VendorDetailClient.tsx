'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, ShieldCheck, Globe, Building2, ShieldAlert, Package, CheckCircle } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface VendorDetailClientProps {
  id: string;
}

export default function VendorDetailClient({ id }: VendorDetailClientProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchVendor = async () => {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);
        const token = localStorage.getItem('namma_orru_token');
        const res = await fetch(`${API_URL}/api/sub-vendors/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to fetch vendor');
        }
        const data = await res.json();
        setVendor(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-white gap-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="h-10 w-10 border-4 border-emerald-950 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#022c22]">Retrieving Vendor profile...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm animate-in fade-in duration-500">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 mb-6">
          <ShieldAlert size={36} strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase">Vendor Not Found</h3>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 max-w-sm leading-relaxed">
          The requested vendor may have been deleted or no longer exists.
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

  if (error || !vendor) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-6">
          <ShieldAlert size={36} strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase">Fetch Error</h3>
        <p className="text-slate-500 font-bold text-xs mt-2 max-w-sm">
          {error || 'Unable to load vendor details at this moment.'}
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
            Vendor <span className="text-emerald-600">{vendor.name}</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            Slug: {vendor.slug}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
            Commission: {vendor.commissionRate || '10'}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card details */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Building2 className="text-emerald-600" size={18} />
            Brand Profile
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              {vendor.logo ? (
                <div className="h-20 w-20 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm shrink-0">
                  <img src={vendor.logo} className="h-full w-full object-contain" alt="" />
                </div>
              ) : (
                <div className="h-20 w-20 bg-slate-50 border border-slate-200 text-slate-550 rounded-2xl flex items-center justify-center font-black text-3xl shrink-0">
                  {vendor.name?.[0] || 'V'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-base font-black text-slate-950 truncate leading-snug">{vendor.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Partner ID: SV-10{vendor.id}</p>
              </div>
            </div>

            <p className="text-slate-600 text-xs font-medium leading-relaxed whitespace-pre-line pt-2">
              {vendor.description || 'No description provided for this brand yet.'}
            </p>

            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
              {vendor.website && (
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-slate-300 shrink-0" />
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline truncate">
                    {vendor.website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-300 shrink-0" />
                <span>Onboarded: {new Date(vendor.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Hub details */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" size={18} />
            Hub Affiliation
          </h3>

          <div className="space-y-4">
            {vendor.headVendor ? (
              <>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Regional Fulfillment Hub</span>
                  <span className="font-extrabold text-slate-800 text-sm mt-1 block">
                    {vendor.headVendor.name}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Hub Contact Email</span>
                  <span className="font-semibold text-slate-600 text-xs mt-1 block">
                    {vendor.headVendor.email || 'support@nammaoorufoods.com'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Hub Coverage Area</span>
                  <span className="font-semibold text-slate-650 text-xs mt-1 block">
                    {vendor.headVendor.address || 'South Zone Operations'}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-xs font-bold text-slate-400">Not assigned to any Regional Hub.</p>
            )}
          </div>
        </div>

        {/* Vendor Products */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Package className="text-emerald-600" size={18} />
            Active Products ({vendor.products?.length || 0})
          </h3>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {vendor.products && vendor.products.length > 0 ? (
              vendor.products.map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => router.push(`/admin/products/${p.id}`)}>
                  {p.image ? (
                    <div className="h-10 w-10 bg-white border border-slate-150 rounded-lg overflow-hidden shrink-0">
                      <img src={p.image} className="h-full w-full object-cover" alt="" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 bg-white border border-slate-150 text-slate-400 rounded-lg flex items-center justify-center font-black text-xs shrink-0">
                      {p.name?.[0] || 'P'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-extrabold text-slate-850 block truncate leading-tight">{p.name}</span>
                    <span className="text-[10px] text-emerald-600 font-extrabold mt-0.5 block">₹{Number(p.price).toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700">
                      <CheckCircle size={8} className="mr-0.5 text-emerald-600 inline" /> Active
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs font-bold text-slate-400 text-center py-6">No approved products cataloged under this brand.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
