'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { Search, Edit2, Trash2, Loader2, Plus, MapPin, Building2, CheckCircle2 } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface HeadVendor {
  id: number;
  name: string;
  slug: string;
  banner?: string;
  logo?: string;
  sortOrder?: number;
  createdAt: string;
  _count?: { subVendors: number };
}

export default function AdminHubsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [hubs, setHubs] = useState<HeadVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    fetchHubs();
  }, []);

  const fetchHubs = () => {
    setLoading(true);
    fetch(`${API_URL}/api/admin-ops/hubs`)
      .then(r => r.json())
      .then(data => {
        setHubs(Array.isArray(data) ? data : data.headVendors || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id: number, hubName: string, force = false) => {
    const hub = hubs.find(h => h.id === id);
    const brandCount = hub?._count?.subVendors || 0;

    if (!force) {
      if (brandCount > 0) {
        const confirmForce = confirm(
          `⚠️ "${hubName}" has ${brandCount} brand(s) attached.\n\nForce deleting will DEACTIVATE all attached brands permanently.\n\nDo you want to force delete this hub anyway?`
        );
        if (!confirmForce) return;
        return handleDelete(id, hubName, true);
      }
      if (!confirm(`Are you sure you want to permanently delete "${hubName}"? This cannot be undone.`)) return;
    }

    try {
      const url = force
        ? `${API_URL}/api/admin-ops/hubs/${id}?force=true`
        : `${API_URL}/api/admin-ops/hubs/${id}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setHubs(prev => prev.filter(h => h.id !== id));
        addToast('Success', data.message || 'Hub deleted successfully');
      } else {
        addToast('Error', data.message || data.error || 'Failed to delete Hub');
      }
    } catch (err) {
      addToast('Error', 'Failed to delete Hub due to a network error');
    }
  };


  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Vendors <span className="text-emerald-600">Hubs</span></h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Manage Head Vendors that group independent brands together.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => router.push('/admin/hubs/create')}
            className="h-14 px-8 rounded-2xl bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 w-full sm:w-auto"
          >
            <Plus size={18} className="text-white" /> Create New Hub
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/20">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <input
              type="text"
              placeholder="Search hubs by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white rounded-xl pl-14 pr-4 text-xs font-bold outline-none border border-slate-100 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto min-h-[280px]">
          <table className="w-full text-left min-w-[1000px] admin-data-table">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Hub Identity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Slug</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Order</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Brands</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" /></td></tr>
              ) : hubs.filter(h => h.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(hub => (
                <tr key={hub.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center p-2">
                        {hub.logo ? (
                          <img src={hub.logo} alt={hub.name} className="object-contain h-full w-full" />
                        ) : (
                          <Building2 className="text-slate-300 h-6 w-6" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-black text-slate-900 leading-tight uppercase">{hub.name}</span>
                        <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest mt-1 flex items-center gap-1"><MapPin size={10} /> Regional Collective</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      /{hub.slug}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-700">
                    {hub.sortOrder !== undefined && hub.sortOrder !== 999 ? hub.sortOrder : '-'}
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 inline-flex items-center gap-1">
                      <CheckCircle2 size={12} /> {hub._count?.subVendors || 0} Brands Attached
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => router.push(`/admin/hubs/${hub.id}/edit`)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(hub.id, hub.name)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-red-300 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && hubs.length === 0 && (
                <tr><td colSpan={5} className="px-8 py-20 text-center font-bold text-slate-300 uppercase tracking-widest text-xs">No Vendors Hub Found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Card Layout */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" /></div>
          ) : hubs.filter(h => h.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(hub => (
            <div key={hub.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center p-2 shrink-0">
                    {hub.logo ? (
                      <img src={hub.logo} alt={hub.name} className="object-contain h-full w-full" />
                    ) : (
                      <Building2 className="text-slate-300 h-6 w-6" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-black text-slate-900 leading-tight uppercase truncate">{hub.name}</span>
                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest mt-1 flex items-center gap-1 shrink-0"><MapPin size={10} /> Regional Collective</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 text-xs text-slate-500 font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Slug Path</span>
                  <span className="font-bold text-slate-800">/{hub.slug}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Sort Rank</span>
                  <span className="font-bold text-slate-800">{hub.sortOrder !== undefined && hub.sortOrder !== 999 ? hub.sortOrder : '-'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Brands Linked</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                    {hub._count?.subVendors || 0} Brands
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end pt-1">
                <button
                  onClick={() => router.push(`/admin/hubs/${hub.id}/edit`)}
                  className="h-11 flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold shadow-sm animate-in scale-in duration-350"
                >
                  <Edit2 size={14} /> Edit Hub
                </button>
                <button
                  onClick={() => handleDelete(hub.id, hub.name)}
                  className="h-11 px-4 flex items-center justify-center rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {!loading && hubs.length === 0 && (
            <div className="py-20 text-center font-bold text-slate-300 uppercase tracking-widest text-xs">No Regional Hubs Found.</div>
          )}
        </div>
      </div>

    </div>
  );
}
