'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import {
  Users, Search, Mail, Phone, Edit2, Trash2, Loader2, Plus,
  ShieldAlert, Sparkles, Filter, RefreshCw, AlertCircle, Bookmark, CheckCircle2,
  TrendingUp, Award, DollarSign, PackageOpen, LayoutGrid, CheckSquare
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import AdminPagination from '@/components/admin/AdminPagination';

interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
  createdAt: string;
  lastLoginAt?: string;
  lockoutUntil?: string;
  adminRole?: { name: string; description?: string };
  subVendor?: { id: number; name: string; logo?: string };
  customerStats?: {
    totalOrders: number;
    totalSpending: number;
    addressesCount: number;
    wishlistCount: number;
  };
  sellerStats?: {
    totalProducts: number;
    totalOrders: number;
    pendingProducts: number;
    revenue: number;
    averageRating: string;
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  // Read URL query params for state preservation
  const urlTab = searchParams.get('tab') || 'customer';
  const urlPage = parseInt(searchParams.get('page') || '1');
  const urlSearch = searchParams.get('search') || '';
  const urlStatus = searchParams.get('status') || '';
  const urlName = searchParams.get('name') || '';
  const urlEmail = searchParams.get('email') || '';
  const urlMobile = searchParams.get('mobile') || '';
  const urlBusinessName = searchParams.get('businessName') || '';
  const urlSellerId = searchParams.get('sellerId') || '';
  const urlAdminRole = searchParams.get('adminRole') || '';

  // Core States
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(urlTab); // customer, seller, admin
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<any>({});
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [filterName, setFilterName] = useState(urlName);
  const [filterEmail, setFilterEmail] = useState(urlEmail);
  const [filterMobile, setFilterMobile] = useState(urlMobile);
  const [filterStatus, setFilterStatus] = useState(urlStatus);
  const [filterBusinessName, setFilterBusinessName] = useState(urlBusinessName);
  const [filterSellerId, setFilterSellerId] = useState(urlSellerId);
  const [filterAdminRole, setFilterAdminRole] = useState(urlAdminRole);

  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 10;

  // Debouncing search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Sync state changes to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('tab', activeTab);
    params.set('page', String(currentPage));
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filterStatus) params.set('status', filterStatus);
    if (filterName) params.set('name', filterName);
    if (filterEmail) params.set('email', filterEmail);
    if (filterMobile) params.set('mobile', filterMobile);
    if (filterBusinessName) params.set('businessName', filterBusinessName);
    if (filterSellerId) params.set('sellerId', filterSellerId);
    if (filterAdminRole) params.set('adminRole', filterAdminRole);

    router.replace(`/admin/users?${params.toString()}`);
  }, [activeTab, currentPage, debouncedSearch, filterStatus, filterName, filterEmail, filterMobile, filterBusinessName, filterSellerId, filterAdminRole, router]);

  // Fetch Users on state/filter changes
  useEffect(() => {
    fetchUsers();
  }, [activeTab, currentPage, debouncedSearch, filterStatus, filterName, filterEmail, filterMobile, filterBusinessName, filterSellerId, filterAdminRole]);

  const fetchUsers = () => {
    setLoading(true);
    
    // Construct query parameters
    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(itemsPerPage),
      role: activeTab,
    });

    if (debouncedSearch) params.set('search', debouncedSearch);
    if (filterStatus) params.set('status', filterStatus);
    if (filterName) params.set('name', filterName);
    if (filterEmail) params.set('email', filterEmail);
    if (filterMobile) params.set('mobile', filterMobile);
    if (filterBusinessName) params.set('businessName', filterBusinessName);
    if (filterSellerId) params.set('sellerId', filterSellerId);
    if (filterAdminRole) params.set('adminRole', filterAdminRole);

    fetch(`${API_URL}/api/admin-ops/users?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
        if (data.stats) {
          setStats(data.stats);
        }
      })
      .catch((err) => {
        console.error(err);
        addToast('Error', 'Unable to retrieve user indices.');
      })
      .finally(() => setLoading(false));
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this user? This action is irreversible.')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin-ops/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== id));
        addToast('Success', 'User registry purged successfully');
        fetchUsers(); // Refresh stats
      }
    } catch (err) {
      addToast('Error', 'Security protocol prevented deletion');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterName('');
    setFilterEmail('');
    setFilterMobile('');
    setFilterStatus('');
    setFilterBusinessName('');
    setFilterSellerId('');
    setFilterAdminRole('');
    setCurrentPage(1);
  };

  const isUserBlocked = (user: User) => {
    if (!user.lockoutUntil) return false;
    return new Date(user.lockoutUntil) > new Date();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">
            {activeTab === 'customer' ? 'Customer' : activeTab === 'seller' ? 'Seller' : 'Administrator'} <span className="text-emerald-600">Management</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            {activeTab === 'customer' 
              ? 'Onboard, analyze customer spending patterns, and manage general consumer status.' 
              : activeTab === 'seller' 
              ? 'Manage partner merchant storefronts, product metrics, and approval flows.' 
              : 'Administer console access permissions and role hierarchies.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/admin/users/new"
            className="h-14 px-8 rounded-2xl bg-emerald-600 !text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 no-underline w-full sm:w-auto"
          >
            <Plus size={18} className="!text-white" /> Onboard New User
          </Link>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 gap-2 pb-px overflow-x-auto no-scrollbar">
        {[
          { id: 'customer', label: 'Customers', color: 'border-blue-600 text-blue-600', icon: Users },
          { id: 'seller', label: 'Sellers', color: 'border-emerald-600 text-emerald-600', icon: Award },
          { id: 'admin', label: 'Administrators', color: 'border-purple-600 text-purple-600', icon: ShieldAlert }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
                clearFilters();
              }}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                isActive 
                  ? tab.color
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {activeTab === 'customer' && (
          <>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Customers</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.totalCustomers ?? 0}</span>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckSquare size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Active Customers</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.activeCustomers ?? 0}</span>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">New (30d)</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.newCustomers ?? 0}</span>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Blocked Customers</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.blockedCustomers ?? 0}</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'seller' && (
          <>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Sellers</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.totalSellers ?? 0}</span>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Pending Approvals</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.pendingApproval ?? 0}</span>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Approved Sellers</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.approvedSellers ?? 0}</span>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Suspended Sellers</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.suspendedSellers ?? 0}</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'admin' && (
          <>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Admins</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.totalAdmins ?? 0}</span>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Super Admins</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.superAdmins ?? 0}</span>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <LayoutGrid size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Hub Managers</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.hubManagers ?? 0}</span>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                <Users size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Staff Members</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">{stats.staffMembers ?? 0}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls / Filter Bar */}
        <div className="p-8 border-b border-slate-50 flex flex-col gap-4 bg-slate-50/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <input
                type="text"
                placeholder={
                  activeTab === 'customer' 
                    ? "Search customers by name, email..." 
                    : activeTab === 'seller' 
                    ? "Search sellers by name, store name..." 
                    : "Search administrators by name..."
                }
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-12 bg-white rounded-xl pl-14 pr-4 text-xs font-bold outline-none border border-slate-100 focus:border-emerald-500 transition-all shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-5 h-12 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all border ${
                  showFilters 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
                }`}
              >
                <Filter size={14} />
                <span>Filters</span>
              </button>
              {(filterName || filterEmail || filterMobile || filterStatus || filterBusinessName || filterSellerId || filterAdminRole || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="px-5 h-12 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-white text-red-500 border border-red-100 hover:bg-red-50 transition-all flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Advanced Collapsible Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100/50 animate-in slide-in-from-top-4 duration-300">
              {activeTab === 'customer' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Customer Name</label>
                    <input
                      type="text"
                      placeholder="Filter by name..."
                      value={filterName}
                      onChange={e => setFilterName(e.target.value)}
                      className="w-full h-11 bg-white border border-slate-150 rounded-xl px-4 text-xs font-bold outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Email Address</label>
                    <input
                      type="text"
                      placeholder="Filter by email..."
                      value={filterEmail}
                      onChange={e => setFilterEmail(e.target.value)}
                      className="w-full h-11 bg-white border border-slate-150 rounded-xl px-4 text-xs font-bold outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Mobile Number</label>
                    <input
                      type="text"
                      placeholder="Filter by phone..."
                      value={filterMobile}
                      onChange={e => setFilterMobile(e.target.value)}
                      className="w-full h-11 bg-white border border-slate-150 rounded-xl px-4 text-xs font-bold outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Status</label>
                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      className="w-full h-11 bg-white border border-slate-150 rounded-xl px-4 text-xs font-bold outline-none focus:border-blue-500 transition-all cursor-pointer"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'seller' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Seller ID</label>
                    <input
                      type="text"
                      placeholder="Seller ID (e.g. 5)..."
                      value={filterSellerId}
                      onChange={e => setFilterSellerId(e.target.value)}
                      className="w-full h-11 bg-white border border-slate-150 rounded-xl px-4 text-xs font-bold outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Business Name</label>
                    <input
                      type="text"
                      placeholder="Filter by business..."
                      value={filterBusinessName}
                      onChange={e => setFilterBusinessName(e.target.value)}
                      className="w-full h-11 bg-white border border-slate-150 rounded-xl px-4 text-xs font-bold outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Seller Name</label>
                    <input
                      type="text"
                      placeholder="Filter by owner..."
                      value={filterName}
                      onChange={e => setFilterName(e.target.value)}
                      className="w-full h-11 bg-white border border-slate-150 rounded-xl px-4 text-xs font-bold outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Status</label>
                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      className="w-full h-11 bg-white border border-slate-150 rounded-xl px-4 text-xs font-bold outline-none focus:border-emerald-500 transition-all cursor-pointer"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="blocked">Suspended</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'admin' && (
                <>
                  <div className="space-y-1 col-span-1 sm:col-span-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Admin Role / Title</label>
                    <input
                      type="text"
                      placeholder="Search by role (e.g. Super Admin, Manager)..."
                      value={filterAdminRole}
                      onChange={e => setFilterAdminRole(e.target.value)}
                      className="w-full h-11 bg-white border border-slate-150 rounded-xl px-4 text-xs font-bold outline-none focus:border-purple-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1 col-span-1 sm:col-span-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Lockout Status</label>
                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      className="w-full h-11 bg-white border border-slate-150 rounded-xl px-4 text-xs font-bold outline-none focus:border-purple-500 transition-all cursor-pointer"
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="blocked">Locked Out</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Table Layouts */}
        <div className="overflow-x-auto min-h-[350px] relative">
          {loading ? (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-30 flex items-center justify-center py-24">
              <div className="text-center space-y-3">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-emerald-600" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing database indices...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="py-24 text-center max-w-md mx-auto space-y-4">
              <div className="h-16 w-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                <Users size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">No Registries Found</h3>
                <p className="text-xs text-slate-400 font-medium">
                  We couldn&apos;t find any {activeTab === 'customer' ? 'customers' : activeTab === 'seller' ? 'sellers' : 'administrators'} matching your search query or filters.
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left min-w-[1100px] admin-data-table">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  {activeTab === 'customer' && (
                    <>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer ID</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Name & Details</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Orders</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Wishlist</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Spend</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Registered</th>
                    </>
                  )}
                  {activeTab === 'seller' && (
                    <>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Seller ID</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Business & Store</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Owner Name</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Products</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Orders</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Revenue</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    </>
                  )}
                  {activeTab === 'admin' && (
                    <>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Admin ID</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Name & Email</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Access Role</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Last Login</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    </>
                  )}
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(user => {
                  const isBlocked = isUserBlocked(user);
                  return (
                    <tr key={user.id} className="group hover:bg-slate-50/30 transition-all duration-300">
                      {/* Customer Columns */}
                      {activeTab === 'customer' && (
                        <>
                          <td className="px-8 py-5">
                            <span className="text-[11px] font-black text-slate-400 bg-slate-50 border border-slate-200/60 px-2 py-1 rounded-md uppercase tracking-wider">
                              PC-20{user.id}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/50 flex items-center justify-center font-black text-xs">
                                {user.name?.[0] || 'C'}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[13px] font-black text-slate-900 leading-tight">{user.name}</span>
                                <span className="text-[11px] text-slate-400 font-bold mt-1">{user.email}</span>
                                {user.phone && <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{user.phone}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-black text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                              {user.customerStats?.totalOrders || 0} Orders
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-bold text-slate-500">
                              {user.customerStats?.wishlistCount || 0} Items
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-black text-slate-950">
                              ₹{Number(user.customerStats?.totalSpending || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                              isBlocked 
                                ? 'bg-red-50 text-red-700 border-red-100' 
                                : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                              {isBlocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-[11px] text-slate-400 font-bold">
                              {new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </td>
                        </>
                      )}

                      {/* Seller Columns */}
                      {activeTab === 'seller' && (
                        <>
                          <td className="px-8 py-5">
                            <span className="text-[11px] font-black text-slate-400 bg-slate-50 border border-slate-200/60 px-2 py-1 rounded-md uppercase tracking-wider">
                              PS-20{user.id}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/50 flex items-center justify-center overflow-hidden font-black text-xs shrink-0">
                                {user.subVendor?.logo ? (
                                  <img src={user.subVendor.logo} alt="" className="object-cover w-full h-full" />
                                ) : (
                                  user.subVendor?.name?.[0] || 'S'
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[13px] font-black text-slate-900 leading-tight truncate">{user.subVendor?.name || 'Store Pending'}</span>
                                <span className="text-[11px] text-slate-400 font-bold mt-1 truncate">{user.email}</span>
                                {user.phone && <span className="text-[10px] text-slate-400 font-semibold mt-0.5">{user.phone}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-bold text-slate-700">{user.name}</span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-black text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                              {user.sellerStats?.totalProducts || 0} Products
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-bold text-slate-500">
                              {user.sellerStats?.totalOrders || 0} Orders
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-black text-slate-950">
                              ₹{Number(user.sellerStats?.revenue || 0).toLocaleString()}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex w-fit px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                                user.subVendor 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                  : 'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                {user.subVendor ? 'Approved' : 'Pending Approval'}
                              </span>
                              <span className={`inline-flex w-fit px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                isBlocked ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'
                              }`}>
                                {isBlocked ? 'Suspended' : 'Active'}
                              </span>
                            </div>
                          </td>
                        </>
                      )}

                      {/* Administrator Columns */}
                      {activeTab === 'admin' && (
                        <>
                          <td className="px-8 py-5">
                            <span className="text-[11px] font-black text-slate-400 bg-slate-50 border border-slate-200/60 px-2 py-1 rounded-md uppercase tracking-wider">
                              PA-20{user.id}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100/50 flex items-center justify-center font-black text-xs">
                                {user.name?.[0] || 'A'}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[13px] font-black text-slate-900 leading-tight">{user.name}</span>
                                <span className="text-[11px] text-slate-400 font-bold mt-1">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-100">
                              {user.adminRole?.name || 'Console Staff'}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-bold text-slate-500">
                              {user.lastLoginAt 
                                ? new Date(user.lastLoginAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) 
                                : 'Never Logged In'}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                              isBlocked 
                                ? 'bg-red-50 text-red-700 border-red-100' 
                                : 'bg-purple-50 text-purple-700 border-purple-100'
                            }`}>
                              {isBlocked ? 'Locked Out' : 'Active'}
                            </span>
                          </td>
                        </>
                      )}

                      {/* Actions */}
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/users/edit/${user.id}`}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm no-underline hover:border-emerald-600"
                          >
                            <Edit2 size={15} />
                          </Link>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-red-300 hover:bg-red-500 hover:text-white transition-all shadow-sm hover:border-red-500"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Server side Pagination */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
