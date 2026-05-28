'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield, Users, Tag, Package, CheckCircle, XCircle, AlertTriangle,
  Search, Filter, Key, History, PlusCircle, Power, RefreshCw,
  Send, Eye, Check, X, ShieldAlert, Award, FileText, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/api';

// Interfaces for our Database Models
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
}

interface Vendor {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  commissionRate: number;
  brandsCount: number;
  createdAt: string;
}

interface Brand {
  id: string;
  vendorName: string;
  vendorId: string;
  name: string;
  slug: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  website: string;
}

interface Product {
  id: string;
  brandName: string;
  brandId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: 'DRAFT' | 'PENDING_VENDOR' | 'PENDING_ADMIN' | 'PUBLISHED' | 'REJECTED' | 'BLOCKED';
  createdAt: string;
}

interface AuditLog {
  id: string;
  entityType: 'VENDOR' | 'BRAND' | 'PRODUCT' | 'SECURITY' | 'SYSTEM';
  entityId: string;
  action: string;
  performedBy: string;
  remarks: string;
  createdAt: string;
}

export default function MarketplaceGovernancePage() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'brands' | 'products' | 'credentials' | 'audit'>('vendors');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // State for pagination
  const [vendorsPage, setVendorsPage] = useState(1);
  const [brandsPage, setBrandsPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [auditLogsPage, setAuditLogsPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Reset page numbers when search filters or active tabs change
  useEffect(() => {
    setVendorsPage(1);
    setBrandsPage(1);
    setProductsPage(1);
    setAuditLogsPage(1);
  }, [searchTerm, statusFilter, activeTab]);

  // State for interactive modals
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [approvalRemarks, setApprovalRemarks] = useState('');

  // State for provisioning new credentials
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorSlug, setNewVendorSlug] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [commissionRate, setCommissionRate] = useState(10);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ username: string, apiKey: string } | null>(null);
  const [hubsList, setHubsList] = useState<any[]>([]);
  const [selectedHubId, setSelectedHubId] = useState<number | ''>('');

  // Dynamic Database Store with initial empty lists
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync data with real API endpoints
  const fetchDatabaseData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch platform users for the primary owners/vendors list
      const usersRes = await fetch(`${API_URL}/api/admin-ops/users?limit=100`);
      const usersData = await usersRes.json();

      // 2. Fetch all Brand Approvals nodes (Sub-Vendors)
      const brandsRes = await fetch(`${API_URL}/api/admin-ops/brands?limit=100&includeEmpty=true`);
      const brandsData = await brandsRes.json();

      // 2.5 Fetch all Hubs
      const hubsRes = await fetch(`${API_URL}/api/admin-ops/hubs`);
      const hubsData = await hubsRes.json();
      const hubsArray = Array.isArray(hubsData) ? hubsData : hubsData.headVendors || [];
      setHubsList(hubsArray);
      if (hubsArray.length > 0 && selectedHubId === '') setSelectedHubId(hubsArray[0].id);

      // 3. Fetch all product assets across catalog (including drafts/moderation queue)
      const productsRes = await fetch(`${API_URL}/api/products?limit=100&status=all`);
      const productsData = await productsRes.json();

      // 4. Fetch platform transactional audits
      const auditRes = await fetch(`${API_URL}/api/admin-ops/audit?take=100`);
      const auditData = await auditRes.json();

      // Map Users to governance console vendors tab representation
      if (usersData && usersData.users) {
        const allBrandsForCount = brandsData?.subVendors || [];
        const mappedVendors: Vendor[] = usersData.users
          .filter((u: any) => u.role === 'VENDOR')
          .map((u: any) => {
            const userBrands = allBrandsForCount.filter((sv: any) => sv.userId === u.id);
            return {
              id: u.id.toString(),
              name: u.subVendor?.name || u.name || 'Artisan Partner',
              slug: u.subVendor?.slug || '',
              ownerName: u.name || 'Unnamed User',
              ownerEmail: u.email,
              status: u.deletedAt ? 'SUSPENDED' : 'APPROVED',
              commissionRate: 8.5,
              brandsCount: userBrands.length,
              createdAt: u.createdAt
            };
          });
        setVendors(mappedVendors);
      }

      // Map SubVendors to governance console brands registry representation
      if (brandsData && brandsData.subVendors) {
        const mappedBrands: Brand[] = brandsData.subVendors.map((sv: any) => ({
          id: sv.id.toString(),
          vendorId: sv.headVendorId?.toString() || 'v-hub',
          vendorName: sv.headVendor?.name || 'Native Hub',
          name: sv.name,
          slug: sv.slug || '',
          status: sv.deletedAt ? 'SUSPENDED' : 'APPROVED',
          createdAt: sv.createdAt,
          website: sv.website || 'https://nammaoorufoods.com'
        }));
        setBrands(mappedBrands);
      }

      // Map Products
      if (productsData && productsData.products) {
        const mappedProducts: Product[] = productsData.products.map((p: any) => ({
          id: p.id.toString(),
          brandName: p.subVendor?.name || 'Heritage Brand',
          brandId: p.subVendorId?.toString() || 'b-none',
          name: p.name,
          sku: p.sku || `SKU-${p.id}`,
          price: Number(p.price),
          stock: p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || p.stock || 0,
          status: p.status === 'APPROVED' ? 'PUBLISHED' : p.status === 'PENDING' ? 'PENDING_ADMIN' : p.status,
          createdAt: p.createdAt
        }));
        setProducts(mappedProducts);
      }

      // Map Audit Trails
      if (auditData) {
        const mappedLogs: AuditLog[] = auditData.map((log: any) => ({
          id: log.id.toString(),
          entityType: (log.entity || 'SYSTEM').toUpperCase() as any,
          entityId: log.entityId?.toString() || '0',
          action: log.action,
          performedBy: log.admin?.name || 'System Admin',
          remarks: typeof log.meta === 'string' ? log.meta : log.meta?.remarks || `Action: ${log.action} executed successfully on ${log.entity || 'system'}.`,
          createdAt: log.createdAt
        }));
        setAuditLogs(mappedLogs);
      }
    } catch (error) {
      console.error('Failed to load database content:', error);
      toast.error('Could not sync with local database services.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  // Operational Actions: Super Admin Governance Power triggers (CRUD database persistence)
  const handleToggleSuspension = async (entityType: 'vendor' | 'brand' | 'product', entityId: string, currentStatus: string) => {
    const isCurrentlySuspended = currentStatus === 'SUSPENDED' || currentStatus === 'BLOCKED';
    const nextStatus = isCurrentlySuspended ? 'APPROVED' : entityType === 'product' ? 'BLOCKED' : 'SUSPENDED';
    const actionLabel = isCurrentlySuspended ? 'Restored' : 'Suspended';

    try {
      if (entityType === 'vendor') {
        // Toggle user deletedAt field
        const res = await fetch(`${API_URL}/api/admin-ops/users/${entityId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deletedAt: isCurrentlySuspended ? null : new Date().toISOString()
          })
        });
        if (!res.ok) throw new Error();
      } else if (entityType === 'brand') {
        // Toggle subVendor deletedAt field
        const res = await fetch(`${API_URL}/api/admin-ops/brands/${entityId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deletedAt: isCurrentlySuspended ? null : new Date().toISOString()
          })
        });
        if (!res.ok) throw new Error();
      } else {
        // Toggle product status field
        const res = await fetch(`${API_URL}/api/products/${entityId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: isCurrentlySuspended ? 'APPROVED' : 'REJECTED',
            approvalNote: `Suspended by super administrator governance command.`
          })
        });
        if (!res.ok) throw new Error();
      }

      toast.success(`Entity successfully ${actionLabel}!`, { icon: '🛡️' });
      await fetchDatabaseData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to commit governance changes to database.');
    }
  };

  const handleOpenApprovalModal = (entity: any, type: 'brand' | 'product') => {
    setSelectedEntity({ ...entity, entityType: type });
    setApprovalRemarks('');
    setIsApprovalModalOpen(true);
  };

  const handleApproveReject = async (isApprove: boolean) => {
    if (!selectedEntity) return;
    const isBrand = selectedEntity.entityType === 'brand';
    const finalStatus = isApprove ? 'APPROVED' : 'REJECTED';

    try {
      if (isBrand) {
        const res = await fetch(`${API_URL}/api/admin-ops/brands/${selectedEntity.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deletedAt: isApprove ? null : new Date().toISOString()
          })
        });
        if (!res.ok) throw new Error();
      } else {
        const res = await fetch(`${API_URL}/api/products/${selectedEntity.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: isApprove ? 'APPROVED' : 'REJECTED',
            approvalNote: approvalRemarks || `${selectedEntity.name} processed by administrative decision.`
          })
        });
        if (!res.ok) throw new Error();
      }

      setIsApprovalModalOpen(false);
      toast.success(`${selectedEntity.name} has been ${finalStatus.toLowerCase()}!`, { icon: isApprove ? '✅' : '❌' });
      await fetchDatabaseData();
    } catch (error) {
      console.error(error);
      toast.error('Could not write approval state to PostgreSQL.');
    }
  };

  const handleProvisionVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName || !newOwnerEmail || !newOwnerName) {
      toast.error('Please input all required primary registration fields.');
      return;
    }

    try {
      // 1. Create a platform user of role VENDOR
      const userRes = await fetch(`${API_URL}/api/admin-ops/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newOwnerEmail,
          password: 'VendorTempPass123!',
          name: newOwnerName,
          role: 'VENDOR'
        })
      });

      const createdUser = await userRes.json();
      if (!userRes.ok) {
        throw new Error(createdUser.error || 'Failed to register corporate user');
      }

      // 2. We use the selectedHubId from the state
      let headVendorId = selectedHubId;
      if (!headVendorId && hubsList.length > 0) {
        headVendorId = hubsList[0].id;
      }

      // 3. Create the SubVendor (Brand) owned by this user
      const brandRes = await fetch(`${API_URL}/api/admin-ops/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newVendorName,
          slug: newVendorSlug || newVendorName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          headVendorId,
          userId: createdUser.id,
          website: 'https://nammaoorufoods.com'
        })
      });

      const createdBrand = await brandRes.json();
      if (!brandRes.ok) {
        throw new Error(createdBrand.error || 'Failed to provision Brand Approvals');
      }

      setGeneratedCredentials({
        username: newOwnerEmail,
        password: 'VendorTempPass123!'
      });

      setIsCredentialModalOpen(true);

      // Reset input state fields
      setNewVendorName('');
      setNewVendorSlug('');
      setNewOwnerEmail('');
      setNewOwnerName('');
      toast.success('Enterprise Vendor and Brand Node provisioned successfully!', { icon: '🔑' });
      await fetchDatabaseData();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Provisioning workflow failed.');
    }
  };

  // Filter computation
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredBrands = brands.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brandName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredLogs = auditLogs.filter(l => {
    return l.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.performedBy.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Paginated Slices & Page Calculations
  const vendorsTotalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE) || 1;
  const paginatedVendors = filteredVendors.slice((vendorsPage - 1) * ITEMS_PER_PAGE, vendorsPage * ITEMS_PER_PAGE);

  const brandsTotalPages = Math.ceil(filteredBrands.length / ITEMS_PER_PAGE) || 1;
  const paginatedBrands = filteredBrands.slice((brandsPage - 1) * ITEMS_PER_PAGE, brandsPage * ITEMS_PER_PAGE);

  const productsTotalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = filteredProducts.slice((productsPage - 1) * ITEMS_PER_PAGE, productsPage * ITEMS_PER_PAGE);

  const logsTotalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE) || 1;
  const paginatedLogs = filteredLogs.slice((auditLogsPage - 1) * ITEMS_PER_PAGE, auditLogsPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700 font-sans">

      {/* ─── CENTRALIZED TITLE BAR ─────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
              <Shield size={22} className="animate-pulse" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Super Admin Console</span>
          </div>
          <h2 className="text-4xl font-black text-slate-950 tracking-tighter uppercase mt-3">Platform Management Dashboard</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Manage vendors, products, approvals, and platform operations from one place.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Add New Vendor button removed as requested */}
        </div>
      </div>

      {/* ─── GOVERNANCE HIGHLIGHT CARDS ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Active Vendors"
          value={vendors.filter(v => v.status === 'APPROVED').length}
          subtitle="Registered vendors on platform"
          color="bg-blue-600"
          Icon={Users}
        />
        <StatCard
          title="Pending Brand Requests"
          value={brands.filter(b => b.status === 'PENDING').length}
          subtitle="Awaiting admin approval"
          color="bg-amber-600"
          Icon={Tag}
        />
        <StatCard
          title="products Awaiting Review"
          value={products.filter(p => p.status === 'PENDING_ADMIN').length}
          subtitle="Verification required"
          color="bg-indigo-600"
          Icon={Package}
        />
        <StatCard
          title="Platform Health Score"
          value="98.4%"
          subtitle="Platform status overview"
          color="bg-emerald-600"
          Icon={CheckCircle}
        />
      </div>

      {/* ─── NAVIGATION TABS & FILTER BAR ─────────────────────────────── */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-4 mb-6">
          <div className="flex flex-wrap gap-1 bg-slate-50 p-1.5 rounded-2xl">
            <TabButton active={activeTab === 'vendors'} onClick={() => { setActiveTab('vendors'); setStatusFilter('ALL'); }} label="Vendors" Icon={Users} />
            <TabButton active={activeTab === 'brands'} onClick={() => { setActiveTab('brands'); setStatusFilter('ALL'); }} label="Brand Approvals" Icon={Tag} />
            <TabButton active={activeTab === 'products'} onClick={() => { setActiveTab('products'); setStatusFilter('ALL'); }} label="Product Review" Icon={Package} />
          </div>

          {/* Sticky Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendors, brands, products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="h-11 w-64 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
              />
            </div>
            {activeTab !== 'audit' && (
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition-all focus:border-emerald-500 focus:bg-white"
                >
                  <option value="ALL">Filter by Status</option>
                  <option value="APPROVED">Approved / Published</option>
                  <option value="PENDING">Pending Approval</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="SUSPENDED">Suspended / Blocked</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ─── TAB CONTENTS ────────────────────────────────────────────── */}
        <div className="animate-in fade-in duration-300">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <RefreshCw className="h-10 w-10 text-emerald-600 animate-spin" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Syncing with Platform Node Registry...</span>
            </div>
          ) : (
            <>
              {/* A. VENDORS PANEL */}
              {activeTab === 'vendors' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-1">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <th className="py-4 px-6 rounded-l-xl">Vendor Name</th>
                        <th className="py-4 px-6">Contact Information</th>
                        <th className="py-4 px-6 text-center">Approved Brands</th>
                        <th className="py-4 px-6 text-center">Status</th>
                        <th className="py-4 px-6 text-center">Fee Rate</th>
                        <th className="py-4 px-6 text-right rounded-r-xl">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {paginatedVendors.map(vendor => (
                        <tr key={vendor.id} className="hover:bg-slate-50/60 transition-colors group">
                          <td className="py-5 px-6 font-bold">
                            <span className="text-sm font-black text-slate-900 block">{vendor.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 block">slug: {vendor.slug}</span>
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-xs font-black text-slate-700 block">{vendor.ownerName}</span>
                            <span className="text-[10px] text-slate-400 mt-1 block">{vendor.ownerEmail}</span>
                          </td>
                          <td className="py-5 px-6 text-center">
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-wider">
                              {vendor.brandsCount} Brands
                            </span>
                          </td>
                          <td className="py-5 px-6 text-center">
                            <StatusBadge status={vendor.status} />
                          </td>
                          <td className="py-5 px-6 text-center">
                            <span className="text-xs font-black text-slate-900 font-mono">{vendor.commissionRate}%</span>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleSuspension('vendor', vendor.id, vendor.status)}
                                className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 active:scale-95 border border-transparent ${vendor.status === 'SUSPENDED'
                                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-sm shadow-emerald-500/10'
                                  : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white shadow-sm shadow-rose-500/10'
                                  }`}
                              >
                                <Power size={11} /> {vendor.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredVendors.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-20 text-center text-slate-400 font-bold">No vendors registered in registry matching filters.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <PaginationControls currentPage={vendorsPage} totalPages={vendorsTotalPages} onPageChange={setVendorsPage} />
                </div>
              )}

              {/* B. Brand Approvals */}
              {activeTab === 'brands' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-1">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <th className="py-4 px-6 rounded-l-xl">Brand Identifier</th>
                        <th className="py-4 px-6">Parent Vendor Node</th>
                        <th className="py-4 px-6">E-Commerce Trace</th>
                        <th className="py-4 px-6 text-center">Registry Status</th>
                        <th className="py-4 px-6 text-right rounded-r-xl">Operations Moderation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {paginatedBrands.map(brand => (
                        <tr key={brand.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-5 px-6">
                            <span className="text-sm font-black text-slate-900 block">{brand.name}</span>
                            <span className="text-[10px] text-slate-400 mt-1 block italic">{brand.website}</span>
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-xs font-black text-slate-700 block">{brand.vendorName}</span>
                            <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 block">node id: {brand.vendorId}</span>
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-[10px] text-slate-400 font-bold block">{new Date(brand.createdAt).toLocaleDateString('en-IN')}</span>
                          </td>
                          <td className="py-5 px-6 text-center">
                            <StatusBadge status={brand.status} />
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center justify-end gap-2">
                              {brand.status === 'PENDING' ? (
                                <>
                                  <button
                                    onClick={() => handleOpenApprovalModal(brand, 'brand')}
                                    className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1 active:scale-95 shadow-lg shadow-emerald-500/10 border-0"
                                  >
                                    <Check size={12} /> Evaluate
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleToggleSuspension('brand', brand.id, brand.status)}
                                  className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-transparent ${brand.status === 'SUSPENDED'
                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-sm shadow-emerald-500/10'
                                    : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white shadow-sm shadow-rose-500/10'
                                    }`}
                                >
                                  <Power size={11} /> {brand.status === 'SUSPENDED' ? 'Restore' : 'Suspend'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredBrands.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-20 text-center text-slate-400 font-bold">No brands requested matching criteria.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <PaginationControls currentPage={brandsPage} totalPages={brandsTotalPages} onPageChange={setBrandsPage} />
                </div>
              )}

              {/* C. Product Review */}
              {activeTab === 'products' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-1">
                    <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <th className="py-4 px-6 rounded-l-xl">SKU Name</th>
                        <th className="py-4 px-6">Brand Owner</th>
                        <th className="py-4 px-6 text-center">Unit Price</th>
                        <th className="py-4 px-6 text-center">Stock</th>
                        <th className="py-4 px-6 text-center">Status</th>
                        <th className="py-4 px-6 text-right rounded-r-xl">Governance Sign-off</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {paginatedProducts.map(product => (
                        <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-5 px-6">
                            <span className="text-sm font-black text-slate-900 block">{product.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-1.5 block">SKU: {product.sku}</span>
                          </td>
                          <td className="py-5 px-6">
                            <span className="text-xs font-black text-slate-700 block">{product.brandName}</span>
                          </td>
                          <td className="py-5 px-6 text-center font-bold text-xs text-slate-900 font-mono">
                            ₹{product.price.toFixed(2)}
                          </td>
                          <td className="py-5 px-6 text-center">
                            <span className={`text-xs font-bold ${product.stock <= 50 ? 'text-amber-600' : 'text-slate-500'}`}>
                              {product.stock} units
                            </span>
                          </td>
                          <td className="py-5 px-6 text-center">
                            <StatusBadge status={product.status} />
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex items-center justify-end gap-2">
                              {product.status === 'PENDING_ADMIN' ? (
                                <button
                                  onClick={() => handleOpenApprovalModal(product, 'product')}
                                  className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1 active:scale-95 shadow-lg shadow-indigo-500/10 border-0"
                                >
                                  <ShieldAlert size={12} /> Action Panel
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleSuspension('product', product.id, product.status)}
                                  className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-transparent ${product.status === 'BLOCKED'
                                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-sm shadow-emerald-500/10'
                                    : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white shadow-sm shadow-rose-500/10'
                                    }`}
                                >
                                  <Power size={11} /> {product.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-20 text-center text-slate-400 font-bold">No product models matching criteria.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <PaginationControls currentPage={productsPage} totalPages={productsTotalPages} onPageChange={setProductsPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── BLUR OVERLAY MODAL: PRODUCT/BRAND GOVERNANCE DECISION ─────── */}
      {isApprovalModalOpen && selectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 text-indigo-600 mb-6">
              <ShieldAlert size={26} />
              <div>
                <h3 className="text-xl font-black text-slate-950 tracking-tight">Enterprise Governance Review</h3>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Moderating: {selectedEntity.entityType}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Entity Name</span>
                  <span className="text-sm font-black text-slate-800">{selectedEntity.name}</span>
                </div>
                {selectedEntity.entityType === 'product' ? (
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">SKU Identity</span>
                    <span className="text-xs font-bold text-slate-800 font-mono">{selectedEntity.sku}</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Website Trace</span>
                    <span className="text-xs font-bold text-slate-800 italic block truncate">{selectedEntity.website}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-8">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Decision Remarks / Audit Reason</label>
              <textarea
                rows={3}
                placeholder="Detail verification results, agricultural standards matching or rejection reasons..."
                value={approvalRemarks}
                onChange={e => setApprovalRemarks(e.target.value)}
                className="w-full bg-slate-50 rounded-xl p-4 text-xs font-bold border border-slate-100 outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setIsApprovalModalOpen(false)}
                className="h-12 px-6 rounded-xl bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all border-0"
              >
                Cancel Review
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleApproveReject(false)}
                  className="h-12 px-6 rounded-xl bg-red-50 text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-transparent active:scale-95"
                >
                  Reject & Flag
                </button>
                <button
                  onClick={() => handleApproveReject(true)}
                  className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 border-0 shadow-lg shadow-emerald-500/25"
                >
                  Approve & Release
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── BLUR OVERLAY MODAL: PROVISION NEW VENDOR / CREATED INFO ─── */}
      <dialog id="provision_modal" className="modal bg-transparent border-0 backdrop:bg-slate-950/60 backdrop:backdrop-blur-md">
        <div className="modal-box w-full max-w-2xl bg-white rounded-[3.5rem] border border-slate-200 p-8 shadow-2xl">
          {generatedCredentials ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-emerald-600">
                <CheckCircle size={28} />
                <div>
                  <h3 className="text-xl font-black text-slate-950 tracking-tight">Security Credentials Provisioned</h3>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Locked in Platform Database Vault</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-4 shadow-inner">
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Primary Login Username</span>
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold font-mono">
                    <span>{generatedCredentials.username}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Temporary Login Password</span>
                  <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold font-mono">
                    <span className="text-emerald-700 break-all">{generatedCredentials.password}</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
                  IMPORTANT: This is the temporary login password for the vendor to access the Seller Dashboard. Please share it securely with the vendor. They should change it upon first login.
                </p>
              </div>

              <div className="flex justify-end mt-6">
                <form method="dialog">
                  <button
                    onClick={() => {
                      setGeneratedCredentials(null);
                      const dialog = document.getElementById('provision_modal') as any;
                      if (dialog) dialog.close();
                    }}
                    className="h-12 px-8 rounded-xl bg-slate-950 text-white text-xs font-black uppercase tracking-widest border-0"
                  >
                    Ack Credentials
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 text-slate-900 mb-6">
                <Key size={26} />
                <div>
                  <h3 className="text-xl font-black text-slate-950 tracking-tight">Provision New Vendor Node</h3>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Administrative Credential Engine</span>
                </div>
              </div>

              <form onSubmit={handleProvisionVendor} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Assign to Regional Hub</label>
                  <select
                    value={selectedHubId}
                    onChange={e => setSelectedHubId(Number(e.target.value))}
                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 outline-none hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-sm"
                  >
                    {hubsList.map(hub => (
                      <option key={hub.id} value={hub.id}>{hub.name}</option>
                    ))}
                    {hubsList.length === 0 && <option disabled value="">No Hubs Available (Create one first)</option>}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Vendor Corporate Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Malabar Organic Tea Farms"
                      required
                      value={newVendorName}
                      onChange={e => {
                        setNewVendorName(e.target.value);
                        setNewVendorSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                      }}
                      className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 outline-none hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">E-Commerce Slug Path</label>
                    <input
                      type="text"
                      placeholder="e.g. malabar-organic-tea"
                      value={newVendorSlug}
                      onChange={e => setNewVendorSlug(e.target.value)}
                      className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 outline-none hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Primary Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      required
                      value={newOwnerName}
                      onChange={e => setNewOwnerName(e.target.value)}
                      className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 outline-none hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Corporate Owner Email</label>
                    <input
                      type="email"
                      placeholder="e.g. rajesh@malabartea.com"
                      required
                      value={newOwnerEmail}
                      onChange={e => setNewOwnerEmail(e.target.value)}
                      className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 outline-none hover:border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Central Platform Settlement Fee (%)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="2"
                      max="25"
                      value={commissionRate}
                      onChange={e => setCommissionRate(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                    <span className="h-12 w-16 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-sm font-black font-mono text-slate-900">{commissionRate}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      const dialog = document.getElementById('provision_modal') as any;
                      if (dialog) dialog.close();
                    }}
                    className="h-12 px-6 rounded-xl bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all border-0"
                  >
                    Cancel Creation
                  </button>
                  <button
                    type="submit"
                    className="h-12 px-8 rounded-xl bg-slate-950 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg active:scale-95 border-0"
                  >
                    Generate Vault Credentials
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}

// Subcomponents with elite, high-density ERDS aesthetics
function StatCard({ title, value, subtitle, color, Icon }: any) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[140px]">
      <div className="flex items-center justify-between">
        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-white shadow-lg ${color} shadow-slate-200`}>
          <Icon size={18} />
        </div>
        <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
      </div>
      <div className="space-y-1 mt-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</span>
        <h3 className="text-2xl font-black text-slate-950 tracking-tighter leading-none">{value}</h3>
        <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-wide">{subtitle}</p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border-0 transition-all duration-300 ${active
        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 active:scale-95 scale-[1.02]'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
        }`}
    >
      <Icon size={13} />
      <span>{label}</span>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'APPROVED': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'PUBLISHED': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'PENDING': 'bg-amber-50 text-amber-700 border-amber-100',
    'PENDING_ADMIN': 'bg-indigo-50 text-indigo-700 border-indigo-100',
    'PENDING_VENDOR': 'bg-blue-50 text-blue-700 border-blue-100',
    'DRAFT': 'bg-slate-100 text-slate-500 border-slate-200',
    'REJECTED': 'bg-rose-50 text-rose-700 border-rose-100',
    'SUSPENDED': 'bg-rose-50 text-rose-700 border-rose-100',
    'BLOCKED': 'bg-rose-50 text-rose-700 border-rose-100',
  };

  const currentStyle = styles[status] || 'bg-slate-50 text-slate-500 border-slate-200';

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border ${currentStyle}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status.includes('PENDING') ? 'bg-amber-500 animate-pulse' :
        status.includes('APPROVED') || status.includes('PUBLISHED') ? 'bg-emerald-500' :
          status.includes('DRAFT') ? 'bg-slate-400' : 'bg-rose-500'
        }`} />
      {status.replace('_', ' ')}
    </span>
  );
}

function PaginationControls({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-6 px-2 animate-in fade-in duration-500">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        Page {currentPage} of {totalPages}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
          className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:pointer-events-none active:scale-95 flex items-center gap-1"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
          if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`h-9 w-9 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center justify-center border ${currentPage === page
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
              >
                {page}
              </button>
            );
          }
          if (page === 2 || page === totalPages - 1) {
            return <span key={page} className="text-slate-300 text-xs px-1 select-none font-bold">...</span>;
          }
          return null;
        })}
        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
          className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:pointer-events-none active:scale-95 flex items-center gap-1"
        >
          Next
        </button>
      </div>
    </div>
  );
}
