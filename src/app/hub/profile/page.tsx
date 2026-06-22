'use client';

import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { User, Mail, Phone, Shield, ShieldAlert, Award, UserCheck, Calendar } from 'lucide-react';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }).then(res => {
    if (!res.ok) throw new Error('Failed to fetch profile data');
    return res.json();
  });
};

export default function VendorHubProfile() {
  const { data, error, isLoading } = useSWR(`${API_URL}/api/vendor-hub/profile`, fetcher);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
        Error loading profile details. Please try again.
      </div>
    );
  }

  const { headVendor, user } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header section with brand banner style */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-y-1/4 translate-x-1/4">
          {headVendor.logo ? (
            <img src={headVendor.logo} alt="" className="w-96 h-96 object-contain" />
          ) : (
            <Award className="w-96 h-96" />
          )}
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 rounded-2xl bg-white p-3 shadow-md flex items-center justify-center shrink-0">
            {headVendor.logo ? (
              <img src={headVendor.logo} alt={headVendor.name} className="max-h-full max-w-full object-contain" />
            ) : (
              <Award className="w-12 h-12 text-emerald-800" />
            )}
          </div>
          <div className="text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none">{headVendor.name}</h1>
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/20 bg-white/10`}>
                {headVendor.status || 'Active'}
              </span>
            </div>
            <p className="text-green-100 font-medium text-xs mt-2 uppercase tracking-widest">
              Hub Code: <span className="font-bold font-mono">{headVendor.vendorHubId || `VEN-${headVendor.id.toString().padStart(3, '0')}`}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Info grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left pane: Hub Manager Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 md:col-span-1">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 mx-auto flex items-center justify-center text-slate-300">
              <User size={40} className="text-slate-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">{headVendor.managerName || 'Hub Manager'}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Vendor Hub Manager</p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-50 space-y-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-3">
              <UserCheck size={16} className="text-slate-400" />
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Username</p>
                <p className="font-bold text-slate-800 truncate">{headVendor.username || 'semmai_hub'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail size={16} className="text-slate-400" />
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Login Email</p>
                <p className="font-bold text-slate-800 truncate">{headVendor.email || user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone size={16} className="text-slate-400" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Mobile Number</p>
                <p className="font-bold text-slate-800">{headVendor.mobile || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right pane: Detailed Configuration & Parameters */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6 md:col-span-2">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight border-b border-slate-50 pb-4">Vendor Hub Settings</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">System Role</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Shield size={16} className="text-emerald-600" />
                <span className="font-bold text-slate-800 text-sm">Vendor Hub Manager</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Account Status</p>
              <div className="flex items-center gap-2 mt-1.5">
                {headVendor.status === 'Blocked' ? (
                  <>
                    <ShieldAlert size={16} className="text-red-500" />
                    <span className="font-bold text-red-600 text-sm">Blocked</span>
                  </>
                ) : (
                  <>
                    <UserCheck size={16} className="text-emerald-600" />
                    <span className="font-bold text-slate-800 text-sm">{headVendor.status || 'Active'}</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 sm:col-span-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Description / Scope of Authority</p>
              <p className="text-slate-600 text-xs leading-relaxed mt-2 font-medium">
                {headVendor.description || 'This hub manages regional collectives, processing payouts, sub-vendors registration, and managing catalog access for affiliated brands.'}
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 sm:col-span-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5"><Calendar size={12} /> Joined Date</p>
              <p className="text-slate-800 text-xs font-bold mt-2">
                {new Date(headVendor.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
