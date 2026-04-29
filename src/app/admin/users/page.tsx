'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, MapPin, Edit2, Trash2, ShieldCheck, Loader2, Plus, UserPlus } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
  group?: { name: string };
  createdAt: string;
  _count?: { orders: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', role: 'USER', password: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${API_URL}/api/admin-ops/users`)
      .then(r => r.json())
      .then(setUsers)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editId
        ? `${API_URL}/api/admin-ops/users/${editId}`
        : `${API_URL}/api/admin-ops/users`;
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Action failed');

      fetchUsers();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      alert('Error saving user');
    } finally { setSubmitting(false); }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', role: 'USER', password: '' });
    setEditId(null);
  };

  const startEdit = (user: User) => {
    setEditId(user.id);
    setFormData({ name: user.name, email: user.email, phone: user.phone || '', role: user.role, password: '' });
    setIsModalOpen(true);
  };

  const filtered = (users || []).filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    await fetch(`${API_URL}/api/admin-ops/users/${id}`, { method: 'DELETE' });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[var(--admin-sidebar)] tracking-tighter">Vendors & User Listing</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Onboard and manage customers, administrators, and marketplace vendors.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {/* <button
            onClick={() => { resetForm(); setFormData({ ...formData, role: 'VENDOR' }); setIsModalOpen(true); }}
            className="h-16 px-10 rounded-2xl bg-emerald-950 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20"
          >
            <UserPlus size={20} className="text-amber-400" /> Onboard Vendor
          </button> */}
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="h-16 px-10 rounded-2xl bg-white border border-slate-100 text-[var(--admin-sidebar)] text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Plus size={20} className="text-slate-400" /> New User
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <input
              type="text"
              placeholder="Search by name, email or partner ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white rounded-xl pl-14 pr-4 text-xs font-bold outline-none border border-slate-100 focus:border-amber-400 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">User Name</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Email Address</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Phone Number</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Role</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" /></td></tr>
              ) : filtered.map(user => (
                <tr key={user.id} className="group hover:bg-emerald-50/30 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-[10px] font-black border ${user.role === 'VENDOR' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {user.name?.[0] || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-black text-[var(--admin-sidebar)] leading-tight">{user.name}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: PV-20{user.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Mail className="h-3.5 w-3.5 text-slate-300" /> {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <Phone className="h-3 w-3" /> {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1.5">
                      <span className={`inline-flex w-fit px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'VENDOR' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                      {user._count?.orders || 0} Orders
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(user)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-[var(--admin-sidebar)] hover:text-white transition-all shadow-sm"><Edit2 size={16} /></button>
                      <button onClick={() => deleteUser(user.id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-red-300 hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-8 py-20 text-center font-bold text-slate-300 uppercase tracking-widest text-xs">No registries matching criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-emerald-100/20">
            <div className="p-10 border-b border-slate-50 bg-slate-50/30">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
                {formData.role === 'VENDOR' ? <UserPlus size={28} /> : <Users size={28} />}
              </div>
              <h3 className="text-3xl font-black text-[var(--admin-sidebar)] tracking-tight">{editId ? 'Calibrate Identity' : 'Add New Vendor'}</h3>
              <p className="text-slate-400 text-sm font-medium mt-1">Configure credentials and ecosystem permissions.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Name</label>
                  <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-16 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-amber-400 rounded-2xl px-6 font-bold text-emerald-950 outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Email</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full h-16 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-amber-400 rounded-2xl px-6 font-bold text-emerald-950 outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Phone</label>
                  <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full h-16 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-amber-400 rounded-2xl px-6 font-bold text-emerald-950 outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Role</label>
                  <div className="relative">
                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full h-16 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-amber-400 rounded-2xl px-6 font-bold text-emerald-950 outline-none transition-all appearance-none shadow-inner">
                      <option value="USER">Standard Customer</option>
                      <option value="ADMIN">System Administrator</option>
                      <option value="VENDOR">Verified Vendor Partner</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                  </div>
                </div>
                {!editId && (
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Password</label>
                    <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full h-16 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-amber-400 rounded-2xl px-6 font-bold text-emerald-950 outline-none transition-all shadow-inner" placeholder="Minimum 8 characters recommended..." />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button disabled={submitting} type="submit" className="flex-1 h-16 bg-emerald-950 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-900 disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-emerald-950/20">
                  {submitting ? <Loader2 className="animate-spin" /> : editId ? 'Update Vendor' : 'Create Vendor'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 h-16 bg-white border-2 border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">Abort</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ChevronDown(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
