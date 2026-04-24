'use client';

import { useState, useEffect } from 'react';
import { Shield, Clock, User, Fingerprint, Search, Filter } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  userId: number;
  user: { name: string; email: string };
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/admin-ops/audit`)
      .then(r => r.json())
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.entityType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[var(--admin-sidebar)] tracking-tighter">System Audit Trail</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Traceability of all admin and system-critical actions.</p>
        </div>
        <div className="h-16 px-8 rounded-2xl bg-amber-50 flex items-center gap-3 border border-amber-100">
          <Shield className="h-6 w-6 text-amber-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-900">Compliance Enabled</span>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/30">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Search by action, user or entity..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white rounded-xl pl-11 pr-4 text-xs font-bold outline-none focus:border-amber-400 border border-slate-100 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Administrator</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Action</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Entity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center"><div className="h-12 w-12 border-4 border-slate-100 border-t-amber-400 rounded-full animate-spin mx-auto" /></td></tr>
              ) : filtered.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-[var(--admin-sidebar)]">{new Date(log.createdAt).toLocaleDateString('en-IN')}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-200 uppercase">
                        {log.user?.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-[var(--admin-sidebar)]">{log.user?.name}</span>
                        <span className="text-[10px] text-slate-400">{log.user?.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      log.action.includes('DELETE') ? 'bg-red-50 text-red-600' :
                      log.action.includes('CREATE') ? 'bg-emerald-50 text-emerald-600' :
                      log.action.includes('UPDATE') ? 'bg-blue-50 text-blue-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <Fingerprint className="h-3.5 w-3.5 text-slate-300" />
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{log.entityType} #{log.entityId}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs text-slate-500 font-medium max-w-xs truncate" title={log.details}>
                      {log.details || '—'}
                    </p>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-8 py-20 text-center font-bold text-slate-300">No audit logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
