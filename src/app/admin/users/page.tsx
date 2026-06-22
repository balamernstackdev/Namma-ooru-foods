'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { Users, Search, Mail, Phone, MapPin, Edit2, Trash2, ShieldCheck, Loader2, Plus, UserPlus } from 'lucide-react';
import { API_URL } from '@/lib/api';
import AdminPagination from '@/components/admin/AdminPagination';

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
  const router = useRouter();
  const { addToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchUsers(currentPage, selectedRole);
  }, [currentPage, selectedRole]);

  const fetchUsers = (page: number, role: string) => {
    setLoading(true);
    fetch(`${API_URL}/api/admin-ops/users?page=${page}&limit=${itemsPerPage}&role=${role}`)
      .then(r => r.json())
      .then(data => {
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this account? This action is irreversible.')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin-ops/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        addToast('Success', 'User registry purged successfully');
      }
    } catch (err) {
      addToast('Error', 'Security protocol prevented deletion');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">Users <span className="text-emerald-600">Management</span></h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Onboard and manage customers, administrators, and marketplace vendors.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/admin/users/new"
            className="h-14 px-8 rounded-2xl bg-emerald-600 !text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 no-underline w-full sm:w-auto"
          >
            <Plus size={18} className="!text-white" /> Register New User
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/20">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <input
              type="text"
              placeholder="Search by name, email or partner ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white rounded-xl pl-14 pr-4 text-xs font-bold outline-none border border-slate-100 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'All Users' },
              { id: 'VENDOR', label: 'Vendors' },
              { id: 'USER', label: 'Customers' },
              { id: 'ADMIN', label: 'Administrators' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedRole(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 ${
                  selectedRole === tab.id
                    ? tab.id === 'ALL'
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                      : tab.id === 'VENDOR'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                      : tab.id === 'USER'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200/60 shadow-sm'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto min-h-[280px]">
          <table className="w-full text-left min-w-[1000px] admin-data-table">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">User Name</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Email Address</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Role</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Activity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" /></td></tr>
              ) : users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                <tr key={user.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-[10px] font-black border ${user.role === 'VENDOR' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {user.name?.[0] || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-black text-slate-900 leading-tight">{user.name}</span>
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
                      <Link
                        href={`/admin/users/edit/${user.id}`}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm no-underline"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-red-300 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr><td colSpan={5} className="px-8 py-20 text-center font-bold text-slate-300 uppercase tracking-widest text-xs">No registries matching criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Card Layout */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" /></div>
          ) : users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
            <div key={user.id} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-[10px] font-black border ${user.role === 'VENDOR' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                    {user.name?.[0] || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-black text-slate-900 leading-tight">{user.name}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: PV-20{user.id}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                  user.role === 'VENDOR' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                  {user.role}
                </span>
              </div>

              <div className="space-y-2 text-xs font-bold text-slate-500 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Metrics</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                    {user._count?.orders || 0} Orders
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end pt-1">
                <Link
                  href={`/admin/users/edit/${user.id}`}
                  className="h-11 flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold no-underline"
                >
                  <Edit2 size={14} /> Edit Profile
                </Link>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="h-11 px-4 flex items-center justify-center rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {!loading && users.length === 0 && (
            <div className="py-20 text-center font-bold text-slate-300 uppercase tracking-widest text-xs">No registries matching criteria.</div>
          )}
        </div>

        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
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
