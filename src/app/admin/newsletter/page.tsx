'use client';

import { useState, useEffect } from 'react';
import { Mail, Download, Search, Trash2, Calendar, UserCheck } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface Subscriber {
  id: number;
  email: string;
  isSubscribed: boolean;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/community-join/admin/subscribers`)
      .then(r => r.json())
      .then(data => setSubscribers(data.subscribers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const downloadCSV = () => {
    const headers = ['ID', 'Email', 'Subscribed At'];
    const rows = subscribers.map(s => [s.id, s.email, new Date(s.createdAt).toISOString()]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscribers_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this email from the subscriber list?')) return;
    try {
      const res = await fetch(`${API_URL}/api/community-join/admin/subscribers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubscribers(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = subscribers.filter(s => s.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">Newsletter <span className="text-emerald-600">Leads</span></h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">{subscribers.length} active newsletter subscribers.</p>
        </div>
        <button
          onClick={downloadCSV}
          className="h-16 px-10 rounded-2xl bg-[var(--admin-sidebar)] text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-900 transition-all shadow-2xl"
        >
          <Download size={20} className="text-[var(--admin-accent)]" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <input
              type="text"
              placeholder="Filter by email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-slate-50 rounded-xl pl-11 pr-4 text-xs font-bold outline-none focus:border-[var(--admin-accent)] border border-transparent transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[1000px] admin-data-table">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Subscriber</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Joined On</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center"><div className="h-12 w-12 border-4 border-slate-100 border-t-[var(--admin-accent)] rounded-full animate-spin mx-auto" /></td></tr>
              ) : filtered.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                        <Mail className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-black text-[var(--admin-sidebar)]">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                      <UserCheck className="h-3 w-3" /> Active
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                      <Calendar className="h-4 w-4" />
                      {new Date(sub.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-slate-100 text-red-300 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={4} className="px-8 py-20 text-center font-bold text-slate-300">No subscribers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
