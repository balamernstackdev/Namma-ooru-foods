'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield, Users, Tag, Package, CheckCircle, XCircle, AlertTriangle,
  Search, Filter, Key, History, PlusCircle, Power, RefreshCw,
  Send, Eye, Check, X, ShieldAlert, Award, FileText, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '@/lib/api';
import { ActionGroup, ViewButton, EvaluateButton, SuspendButton, UnlinkButton, ActionPanelButton } from '@/components/ui/ActionButtons';

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
  hubName?: string;
  hubId?: number | null;
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
  userId?: string;
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

function VendorPayoutsTab({ selectedVendor, brands }: { selectedVendor: Vendor, brands: Brand[] }) {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayouts = async () => {
      setLoading(true);
      try {
        const vendorBrand = brands.find(b => b.userId === selectedVendor.id);
        if (!vendorBrand) {
          setPayouts([]);
          return;
        }
        
        const res = await fetch(`${API_URL}/api/vendor/payouts/vendor/${vendorBrand.id}`);
        if (res.ok) {
          const data = await res.json();
          setPayouts(data);
        }
      } catch (err) {
        console.error('Failed to fetch payouts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayouts();
  }, [selectedVendor.id, brands]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">
        Vendor Settlement Ledger
      </h3>
      {/* Desktop View */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-[2rem] overflow-hidden p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-1 min-w-[1000px] admin-data-table">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <th className="py-4 px-6 rounded-l-xl">Payout Cycle</th>
                <th className="py-4 px-6 text-right">Gross Sales</th>
                <th className="py-4 px-6 text-right">Commission</th>
                <th className="py-4 px-6 text-right">Net Payable</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Payout Date</th>
                <th className="py-4 px-6 text-right rounded-r-xl">UTR Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                    Loading Ledgers...
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                    No Payout Records Found
                  </td>
                </tr>
              ) : (
                payouts.map((payout, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-5 px-6 font-bold text-xs text-slate-800">
                      {payout.payoutWeekStart ? new Date(payout.payoutWeekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Custom Cycle'}
                    </td>
                    <td className="py-5 px-6 text-right font-mono text-xs text-slate-900">
                      ₹{Number(payout.grossAmount).toFixed(2)}
                    </td>
                    <td className="py-5 px-6 text-right font-mono text-xs text-slate-900">
                      ₹{Number(payout.commission).toFixed(2)}
                    </td>
                    <td className="py-5 px-6 text-right font-mono text-xs font-black text-slate-900">
                      ₹{Number(payout.payableAmount).toFixed(2)}
                    </td>
                    <td className="py-5 px-6 text-center">
                      {payout.status === 'SETTLED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border bg-emerald-50 text-emerald-700 border-emerald-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> SETTLED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border bg-amber-50 text-amber-700 border-amber-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-5 px-6 text-center text-xs text-slate-500">
                      {payout.payoutDate ? new Date(payout.payoutDate).toLocaleDateString('en-CA') : '--'}
                    </td>
                    <td className="py-5 px-6 text-right font-mono text-xs text-slate-500">
                      {payout.transactionRef || '--'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Mobile View - Settlement Ledger Card list */}
      <div className="block md:hidden divide-y divide-slate-100 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Ledgers...</div>
        ) : payouts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No Payout Records Found</div>
        ) : payouts.map((payout, idx) => (
          <div key={idx} className="py-4 space-y-3">
            <div className="flex justify-between items-start">
              <span className="font-bold text-xs text-slate-800">
                {payout.payoutWeekStart ? new Date(payout.payoutWeekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Custom Cycle'}
              </span>
              {payout.status === 'SETTLED' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border bg-emerald-50 text-emerald-700 border-emerald-100">
                  SETTLED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black tracking-widest border bg-amber-50 text-amber-700 border-amber-100">
                  PENDING
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 text-xs">
              <div>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Gross Sales</span>
                <span className="font-bold text-slate-800 font-mono">₹{Number(payout.grossAmount).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Commission</span>
                <span className="font-bold text-slate-800 font-mono">₹{Number(payout.commission).toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Net Payable</span>
                <span className="font-black text-slate-900 font-mono">₹{Number(payout.payableAmount).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>Date: {payout.payoutDate ? new Date(payout.payoutDate).toLocaleDateString('en-CA') : '--'}</span>
              <span>Ref: {payout.transactionRef || '--'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VendorSettingsTab({ selectedVendor, brands, fetchDatabaseData }: { selectedVendor: Vendor, brands: Brand[], fetchDatabaseData: () => void }) {
  const [commRate, setCommRate] = useState(selectedVendor.commissionRate);
  const [statusVal, setStatusVal] = useState(selectedVendor.status);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setCommRate(selectedVendor.commissionRate);
    setStatusVal(selectedVendor.status);
  }, [selectedVendor]);

  const vendorBrand = brands.find(b => b.userId === selectedVendor.id);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      if (vendorBrand) {
        const brandRes = await fetch(`${API_URL}/api/admin-ops/brands/${vendorBrand.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commissionRate: commRate })
        });
        if (!brandRes.ok) throw new Error('Failed to update brand commission rate');
      }

      const userRes = await fetch(`${API_URL}/api/admin-ops/users/${selectedVendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deletedAt: statusVal === 'SUSPENDED' ? new Date().toISOString() : null
        })
      });
      if (!userRes.ok) throw new Error('Failed to update vendor user status');

      toast.success('Vendor configuration saved successfully!', { icon: '🛡️' });
      await fetchDatabaseData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update vendor settings');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
      <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight pb-3 border-b border-slate-100">
        Vendor Operations Settings
      </h3>
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Commission Rate (%)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="2"
              max="25"
              value={commRate}
              onChange={e => setCommRate(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <span className="h-10 w-16 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-sm font-black font-mono text-slate-900">{commRate}%</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Moderation / Operating Status</label>
          <select
            value={statusVal}
            onChange={e => setStatusVal(e.target.value as any)}
            className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-sm"
          >
            <option value="APPROVED">ACTIVE (Approved & Operating)</option>
            <option value="SUSPENDED">SUSPENDED (Operating Blocked)</option>
          </select>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isUpdating}
            className="h-12 px-8 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95 border-0 disabled:opacity-50"
          >
            {isUpdating ? 'Saving Configurations...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function MarketplaceGovernancePage() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'products' | 'credentials' | 'audit'>('vendors');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Vendor Details View State
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorDetailsTab, setVendorDetailsTab] = useState<'overview' | 'brands' | 'products' | 'payouts' | 'documents' | 'settings'>('overview');

  // Brand Creation state
  const [isCreateBrandOpen, setIsCreateBrandOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandSlug, setNewBrandSlug] = useState('');
  const [newBrandWebsite, setNewBrandWebsite] = useState('');
  const [newBrandDesc, setNewBrandDesc] = useState('');
  const [newBrandLogo, setNewBrandLogo] = useState('');
  const [newBrandBanner, setNewBrandBanner] = useState('');
  const [newBrandHubId, setNewBrandHubId] = useState<number | ''>('');

  // State for pagination
  const [vendorsPage, setVendorsPage] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [auditLogsPage, setAuditLogsPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Reset page numbers when search filters or active tabs change
  useEffect(() => {
    setVendorsPage(1);
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
  const [generatedCredentials, setGeneratedCredentials] = useState<{ username: string, password?: string, apiKey?: string } | null>(null);
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

      let mappedVendors: Vendor[] = [];

      // Map Users to governance console vendors tab representation
      if (usersData && usersData.users) {
        const allBrandsForCount = brandsData?.subVendors || [];
        mappedVendors = usersData.users
          .filter((u: any) => u.role === 'VENDOR' || u.role === 'SELLER')
          .map((u: any) => {
            const userBrands = allBrandsForCount.filter((sv: any) => sv.userId === u.id);
            return {
              id: u.id.toString(),
              name: u.subVendor?.name || u.name || 'Artisan Partner',
              slug: u.subVendor?.slug || '',
              ownerName: u.name || 'Unnamed User',
              ownerEmail: u.email,
              status: u.deletedAt ? 'SUSPENDED' : 'APPROVED',
              commissionRate: u.subVendor?.commissionRate || 10.0,
              brandsCount: userBrands.length,
              createdAt: u.createdAt,
              hubName: u.subVendor?.headVendor?.name || 'No Hub Assigned',
              hubId: u.subVendor?.headVendorId || null
            };
          });
        setVendors(mappedVendors);
        setSelectedVendor(prev => {
          if (!prev) return null;
          const updated = mappedVendors.find(v => v.id === prev.id);
          return updated || prev;
        });
      }

      // Map SubVendors to governance console brands registry representation
      if (brandsData && brandsData.subVendors) {
        const mappedBrands: Brand[] = brandsData.subVendors.map((sv: any) => ({
          id: sv.id.toString(),
          vendorId: sv.userId?.toString() || '',
          vendorName: sv.owner?.name || sv.headVendor?.name || 'Native Hub',
          name: sv.name,
          slug: sv.slug || '',
          status: sv.deletedAt ? 'SUSPENDED' : 'APPROVED',
          createdAt: sv.createdAt,
          website: sv.website || 'https://nammaoorufoods.com',
          userId: sv.userId?.toString() || ''
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
        throw new Error(createdBrand.error || 'Failed to provision Brand');
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

  const handleSelectVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setVendorDetailsTab('overview');
  };

  // Filter computation
  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'ALL' || v.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brandName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  // Paginated Slices & Page Calculations
  const vendorsTotalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE) || 1;
  const paginatedVendors = filteredVendors.slice((vendorsPage - 1) * ITEMS_PER_PAGE, vendorsPage * ITEMS_PER_PAGE);

  const productsTotalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = filteredProducts.slice((productsPage - 1) * ITEMS_PER_PAGE, productsPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700 font-sans">

      {/* ─── CENTRALIZED TITLE BAR ─────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic mt-3">Management <span className="text-emerald-600">Dashboard</span></h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Manage vendors, products, approvals, and platform operations from one place.</p>
        </div>
        <button
          onClick={() => {
            const dialog = document.getElementById('provision_modal') as any;
            if (dialog) dialog.showModal();
          }}
          className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95 border-0 self-start xl:self-auto"
        >
          + Add New Vendor
        </button>
      </div>

      {selectedVendor ? (
        /* ─── VENDOR DETAILS VIEW ─────────────────────────────────────── */
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <div className="space-y-2">
              <button
                onClick={() => setSelectedVendor(null)}
                className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                ← Back to Dashboard
              </button>
              <div className="flex items-center gap-3 mt-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">{selectedVendor.name}</h2>
                <StatusBadge status={selectedVendor.status} />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Owner: {selectedVendor.ownerName} • Email: {selectedVendor.ownerEmail}
              </p>
            </div>
          </div>

          {/* Details Tabs */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-6">
            <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1.5 rounded-2xl mb-8">
              {(['overview', 'brands', 'products', 'payouts', 'settings'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setVendorDetailsTab(tab)}
                  className={`h-10 px-5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border-0 transition-all duration-300 ${
                    vendorDetailsTab === tab
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 active:scale-95 scale-[1.02]'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sub-tab Contents */}
            <div className="animate-in fade-in duration-300">
              {vendorDetailsTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Profile Card */}
                  <div className="lg:col-span-2 bg-slate-50/50 border border-slate-100 rounded-3xl p-8 space-y-6">
                    <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight pb-3 border-b border-slate-200/60">
                      Corporate Profile
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Corporate Entity Name</span>
                        <span className="text-sm font-bold text-slate-800">{selectedVendor.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">URL Slug Path</span>
                        <span className="text-sm font-mono text-slate-800">/{selectedVendor.slug || 'n/a'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Contact Owner</span>
                        <span className="text-sm font-bold text-slate-800">{selectedVendor.ownerName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Corporate Email</span>
                        <span className="text-sm font-bold text-slate-800">{selectedVendor.ownerEmail}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Regional Hub Assignment</span>
                        <span className="text-sm font-bold text-slate-800">{selectedVendor.hubName || 'No Hub Assigned'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Platform Fee Rate</span>
                        <span className="text-sm font-mono font-bold text-slate-800">{selectedVendor.commissionRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
                    <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight pb-3 border-b border-slate-200/60">
                      Operations Stats
                    </h3>
                    <div className="space-y-4 flex-grow mt-4">
                      <div className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase">Artisanal Brands</span>
                        <span className="text-lg font-black text-slate-900">{brands.filter(b => b.userId === selectedVendor.id).length}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase">Total Catalog Items</span>
                        <span className="text-lg font-black text-slate-900">
                          {products.filter(p => {
                            const vendorBrands = brands.filter(b => b.userId === selectedVendor.id);
                            const vendorBrandIds = vendorBrands.map(b => b.id);
                            return vendorBrandIds.includes(p.brandId);
                          }).length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                        <span className="text-xs font-bold text-slate-500 uppercase">Platform Status</span>
                        <StatusBadge status={selectedVendor.status} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {vendorDetailsTab === 'brands' && (
                <div className="space-y-6">
                  {(() => {
                    const vendorBrands = brands.filter(b => b.userId === selectedVendor.id);
                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-black text-slate-955 uppercase tracking-tight">
                            Artisanal Brands Registry
                          </h3>
                          {vendorBrands.length === 0 && (
                            <div className="flex gap-2">
                              {brands.filter(b => !b.userId).length > 0 && (
                                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                                  <select
                                    id="link_brand_select"
                                    className="bg-transparent text-xs font-bold outline-none cursor-pointer"
                                  >
                                    <option value="">Select unassigned brand...</option>
                                    {brands.filter(b => !b.userId).map(b => (
                                      <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={async () => {
                                      const selectEl = document.getElementById('link_brand_select') as HTMLSelectElement;
                                      if (!selectEl || !selectEl.value) {
                                        toast.error('Please select a brand to link');
                                        return;
                                      }
                                      const brandId = selectEl.value;
                                      try {
                                        const res = await fetch(`${API_URL}/api/admin-ops/brands/${brandId}`, {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ userId: parseInt(selectedVendor.id) })
                                        });
                                        if (!res.ok) throw new Error();
                                        toast.success('Brand linked successfully!');
                                        await fetchDatabaseData();
                                      } catch (err) {
                                        toast.error('Failed to link brand');
                                      }
                                    }}
                                    className="h-7 px-3 bg-emerald-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-emerald-700"
                                  >
                                    Link
                                  </button>
                                </div>
                              )}
                              <button
                                onClick={() => setIsCreateBrandOpen(true)}
                                className="h-10 px-4 bg-slate-950 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 flex items-center gap-1.5"
                              >
                                <PlusCircle size={14} /> Create Brand
                              </button>
                            </div>
                          )}
                        </div>

                        {isCreateBrandOpen && (
                          <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-6 space-y-6 animate-in slide-in-from-top-5 duration-300">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Register Brand Directly under {selectedVendor.name}</h4>
                            <form onSubmit={async (e) => {
                              e.preventDefault();
                              if (!newBrandName) {
                                toast.error('Brand name is required');
                                return;
                              }
                              try {
                                let finalHubId = newBrandHubId || selectedVendor.hubId;
                                if (!finalHubId && hubsList.length > 0) {
                                  finalHubId = hubsList[0].id;
                                }
                                if (!finalHubId) {
                                  toast.error('A Hub is required. Please create a Hub first.');
                                  return;
                                }
                                const res = await fetch(`${API_URL}/api/admin-ops/brands`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    name: newBrandName,
                                    slug: newBrandSlug || newBrandName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                                    website: newBrandWebsite || 'https://nammaoorufoods.com',
                                    description: newBrandDesc || `${newBrandName} - premium food brand.`,
                                    logo: newBrandLogo || null,
                                    banner: newBrandBanner || null,
                                    headVendorId: finalHubId,
                                    userId: parseInt(selectedVendor.id)
                                  })
                                });
                                if (!res.ok) {
                                  const errData = await res.json();
                                  throw new Error(errData.error || 'Failed to create brand');
                                }
                                toast.success('Brand created successfully!');
                                setIsCreateBrandOpen(false);
                                setNewBrandName('');
                                setNewBrandSlug('');
                                setNewBrandWebsite('');
                                setNewBrandDesc('');
                                setNewBrandLogo('');
                                setNewBrandBanner('');
                                await fetchDatabaseData();
                              } catch (err: any) {
                                toast.error(err.message || 'Failed to create brand');
                              }
                            }} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase text-slate-500">Brand Name</label>
                                  <input
                                    type="text"
                                    required
                                    value={newBrandName}
                                    onChange={e => {
                                      setNewBrandName(e.target.value);
                                      setNewBrandSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                                    }}
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase text-slate-500">Slug</label>
                                  <input
                                    type="text"
                                    value={newBrandSlug}
                                    onChange={e => setNewBrandSlug(e.target.value)}
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase text-slate-500">Website</label>
                                  <input
                                    type="text"
                                    value={newBrandWebsite}
                                    onChange={e => setNewBrandWebsite(e.target.value)}
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                    placeholder="https://example.com"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase text-slate-500">Regional Hub</label>
                                  <select
                                    value={newBrandHubId}
                                    onChange={e => setNewBrandHubId(e.target.value ? Number(e.target.value) : '')}
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                  >
                                    <option value="">Use Vendor's Hub or Select...</option>
                                    {hubsList.map(hub => (
                                      <option key={hub.id} value={hub.id}>{hub.name}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-500">Description</label>
                                <textarea
                                  value={newBrandDesc}
                                  onChange={e => setNewBrandDesc(e.target.value)}
                                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                  rows={2}
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase text-slate-500">Logo Image URL</label>
                                  <input
                                    type="text"
                                    value={newBrandLogo}
                                    onChange={e => setNewBrandLogo(e.target.value)}
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                    placeholder="e.g., /uploads/logo.png"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase text-slate-500">Banner Image URL</label>
                                  <input
                                    type="text"
                                    value={newBrandBanner}
                                    onChange={e => setNewBrandBanner(e.target.value)}
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                    placeholder="e.g., /uploads/banner.png"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end pt-2">
                                <button
                                  type="button"
                                  onClick={() => setIsCreateBrandOpen(false)}
                                  className="h-10 px-4 bg-slate-200 text-slate-600 rounded-lg text-xs font-black uppercase"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className="h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase"
                                >
                                  Submit Brand
                                </button>
                              </div>
                            </form>
                          </div>
                        )}

                        {/* Desktop View */}
                        <div className="hidden md:block bg-white border border-slate-200 rounded-[2rem] overflow-hidden p-6 shadow-sm">
                          <table className="w-full text-left border-separate border-spacing-y-1 min-w-[1000px] admin-data-table">
                            <thead>
                              <tr className="bg-slate-50/50 text-[13px] font-black text-slate-500 uppercase tracking-[0.15em]">
                                <th className="py-4 px-6 rounded-l-xl">Brand Identifier</th>
                                <th className="py-4 px-6">Slug Path</th>
                                <th className="py-4 px-6">E-Commerce Trace</th>
                                <th className="py-4 px-6 text-center">Status</th>
                                <th className="py-4 px-6 text-right rounded-r-xl">Operations</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {vendorBrands.map(brand => (
                                <tr key={brand.id} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="py-5 px-6">
                                    <span className="text-base font-black text-slate-900 block">{brand.name}</span>
                                    <span className="text-xs text-slate-400 mt-1 block italic">{brand.website}</span>
                                  </td>
                                  <td className="py-5 px-6 font-mono text-sm text-slate-700">
                                    /{brand.slug}
                                  </td>
                                  <td className="py-5 px-6">
                                    <span className="text-[13px] text-slate-500 font-bold block">{new Date(brand.createdAt).toLocaleDateString('en-IN')}</span>
                                  </td>
                                  <td className="py-5 px-6 text-center">
                                    <StatusBadge status={brand.status} />
                                  </td>
                                  <td className="py-5 px-6">
                                    <ActionGroup>
                                      {brand.status === 'PENDING' ? (
                                        <EvaluateButton onClick={() => handleOpenApprovalModal(brand, 'brand')} />
                                      ) : (
                                        <SuspendButton 
                                          isSuspended={brand.status === 'SUSPENDED'} 
                                          onClick={() => handleToggleSuspension('brand', brand.id, brand.status)} 
                                        />
                                      )}
                                      <UnlinkButton
                                        onClick={async () => {
                                          if (!confirm('Are you sure you want to unlink this brand from the vendor? It will become an unassigned brand.')) return;
                                          try {
                                            const res = await fetch(`${API_URL}/api/admin-ops/brands/${brand.id}`, {
                                              method: 'PUT',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({ userId: null })
                                            });
                                            if (!res.ok) throw new Error();
                                            toast.success('Brand unlinked successfully!');
                                            await fetchDatabaseData();
                                          } catch (err) {
                                            toast.error('Failed to unlink brand');
                                          }
                                        }}
                                      />
                                    </ActionGroup>
                                  </td>
                                </tr>
                              ))}
                              {vendorBrands.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="py-20 text-center text-slate-400 font-bold">
                                    No brands linked to this vendor. Click "+ Create Brand" or link an existing one.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile View */}
                        <div className="block md:hidden divide-y divide-slate-100 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                          {vendorBrands.map(brand => (
                            <div key={brand.id} className="py-4 space-y-3">
                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-0.5">
                                  <span className="text-sm font-black text-slate-900 block">{brand.name}</span>
                                  <span className="text-xs text-slate-400 block break-all">{brand.website}</span>
                                </div>
                                <StatusBadge status={brand.status} />
                              </div>
                              <div className="grid grid-cols-2 gap-2 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 text-xs">
                                <div>
                                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Slug Path</span>
                                  <span className="font-mono text-slate-700">/{brand.slug}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Created Date</span>
                                  <span className="font-bold text-slate-700">{new Date(brand.createdAt).toLocaleDateString('en-IN')}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 justify-end pt-1">
                                {brand.status === 'PENDING' ? (
                                  <button
                                    onClick={() => handleOpenApprovalModal(brand, 'brand')}
                                    className="h-9 px-3 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1"
                                  >
                                    Evaluate Brand
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleToggleSuspension('brand', brand.id, brand.status)}
                                    className={`h-9 px-3 rounded-lg border text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 ${
                                      brand.status === 'SUSPENDED' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
                                    }`}
                                  >
                                    {brand.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                                  </button>
                                )}
                                <button
                                  onClick={async () => {
                                    if (!confirm('Are you sure you want to unlink this brand from the vendor? It will become an unassigned brand.')) return;
                                    try {
                                      const res = await fetch(`${API_URL}/api/admin-ops/brands/${brand.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ userId: null })
                                      });
                                      if (!res.ok) throw new Error();
                                      toast.success('Brand unlinked successfully!');
                                      await fetchDatabaseData();
                                    } catch (err) {
                                      toast.error('Failed to unlink brand');
                                    }
                                  }}
                                  className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-100 transition-colors"
                                  title="Unlink Brand"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                          {vendorBrands.length === 0 && (
                            <div className="py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                              No brands linked to this vendor. Click "+ Create Brand" or link an existing one.
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {vendorDetailsTab === 'products' && (() => {
                const vendorBrands = brands.filter(b => b.userId === selectedVendor.id);
                const vendorBrandIds = vendorBrands.map(b => b.id);
                const vendorProducts = products.filter(p => vendorBrandIds.includes(p.brandId));

                return (
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                      Catalog Moderation Queue
                    </h3>
                    {/* Desktop View */}
                    <div className="hidden md:block bg-white border border-slate-200 rounded-[2rem] overflow-hidden p-6 shadow-sm">
                      <table className="w-full text-left border-separate border-spacing-y-1 min-w-[1000px] admin-data-table">
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
                          {vendorProducts.map(product => (
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
                                <ActionGroup>
                                  {product.status === 'PENDING_ADMIN' ? (
                                    <ActionPanelButton onClick={() => handleOpenApprovalModal(product, 'product')} />
                                  ) : (
                                    <SuspendButton
                                      isSuspended={product.status === 'BLOCKED'}
                                      tooltip={product.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                                      onClick={() => handleToggleSuspension('product', product.id, product.status)}
                                    />
                                  )}
                                </ActionGroup>
                              </td>
                            </tr>
                          ))}
                          {vendorProducts.length === 0 && (
                            <tr>
                              <td colSpan={6} className="py-20 text-center text-slate-400 font-bold">
                                No products registered under this vendor's brands.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View */}
                    <div className="block md:hidden divide-y divide-slate-100 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-4">
                      {vendorProducts.map(product => (
                        <div key={product.id} className="py-4 space-y-3">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-0.5">
                              <span className="text-sm font-black text-slate-900 block">{product.name}</span>
                              <span className="text-[10px] text-slate-400 block font-mono">SKU: {product.sku}</span>
                            </div>
                            <StatusBadge status={product.status} />
                          </div>
                          <div className="grid grid-cols-3 gap-2 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 text-xs">
                            <div>
                              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Brand Owner</span>
                              <span className="font-bold text-slate-800">{product.brandName}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Price</span>
                              <span className="font-bold text-slate-850 font-mono">₹{product.price.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Stock Level</span>
                              <span className={`font-bold ${product.stock <= 50 ? 'text-amber-600' : 'text-slate-850'}`}>
                                {product.stock} units
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-end pt-1">
                            {product.status === 'PENDING_ADMIN' ? (
                              <button
                                onClick={() => handleOpenApprovalModal(product, 'product')}
                                className="h-9 px-3 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1"
                              >
                                Evaluate Product
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleSuspension('product', product.id, product.status)}
                                className={`h-9 px-3 rounded-lg border text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 ${
                                  product.status === 'BLOCKED' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-red-50 border-red-100 text-red-600'
                                }`}
                              >
                                {product.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {vendorProducts.length === 0 && (
                        <div className="py-12 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                          No products registered under this vendor's brands.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {vendorDetailsTab === 'payouts' && (
                <VendorPayoutsTab 
                  selectedVendor={selectedVendor} 
                  brands={brands} 
                />
              )}

              {vendorDetailsTab === 'settings' && (
                <VendorSettingsTab 
                  selectedVendor={selectedVendor} 
                  brands={brands} 
                  fetchDatabaseData={fetchDatabaseData} 
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ─── MAIN DASHBOARD VIEW ─────────────────────────────────────── */
        <>
          {/* ─── NAVIGATION TABS & FILTER BAR ─────────────────────────────── */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-1 bg-slate-50 p-1.5 rounded-2xl w-full lg:w-auto">
                <TabButton active={activeTab === 'vendors'} onClick={() => { setActiveTab('vendors'); setStatusFilter('ALL'); }} label="Vendors" Icon={Users} />
                <TabButton active={activeTab === 'products'} onClick={() => { setActiveTab('products'); setStatusFilter('ALL'); }} label="Product Review" Icon={Package} />
              </div>

              {/* Sticky Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search vendors, products..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="h-11 w-full bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 text-xs font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
                  />
                </div>
                {activeTab !== 'audit' && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter size={14} className="text-slate-400 shrink-0" />
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="h-11 w-full sm:w-auto bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-bold outline-none cursor-pointer hover:bg-slate-100 transition-all focus:border-emerald-500 focus:bg-white"
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
                    <>
                      {/* Desktop View */}
                      <div className="hidden md:block overflow-x-auto min-h-[280px]">
                        <table className="w-full text-left border-separate border-spacing-y-1 min-w-[1000px] admin-data-table">
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
                                  <ActionGroup>
                                    <ViewButton onClick={() => handleSelectVendor(vendor)} />
                                    <SuspendButton
                                      isSuspended={vendor.status === 'SUSPENDED'}
                                      tooltip={vendor.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                                      onClick={() => handleToggleSuspension('vendor', vendor.id, vendor.status)}
                                    />
                                  </ActionGroup>
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
                      </div>

                      {/* Mobile View - Card Layout */}
                      <div className="block md:hidden divide-y divide-slate-100">
                        {paginatedVendors.map(vendor => (
                          <div key={vendor.id} className="py-5 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-0.5">
                                <span className="text-sm font-black text-slate-900 block">{vendor.name}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 block">slug: {vendor.slug}</span>
                              </div>
                              <StatusBadge status={vendor.status} />
                            </div>

                            <div className="space-y-2 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 text-xs text-slate-500 font-semibold">
                              <div>
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Owner Contact</span>
                                <p className="text-slate-800 font-bold mt-0.5">{vendor.ownerName}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{vendor.ownerEmail}</p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                <div>
                                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Brands</span>
                                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black tracking-wider block w-fit mt-1">
                                    {vendor.brandsCount} Brands
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Commission</span>
                                  <span className="text-slate-800 text-[11px] font-bold block mt-1">{vendor.commissionRate}%</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 justify-end pt-1">
                              <button
                                onClick={() => handleSelectVendor(vendor)}
                                className="h-11 flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all"
                              >
                                <Eye size={13} /> View Hub
                              </button>
                              <button
                                onClick={() => handleToggleSuspension('vendor', vendor.id, vendor.status)}
                                className={`h-11 px-4 flex items-center justify-center rounded-xl border transition-all ${
                                  vendor.status === 'SUSPENDED' 
                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white' 
                                    : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-500 hover:text-white'
                                }`}
                              >
                                <Power size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                        {filteredVendors.length === 0 && (
                          <div className="py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No vendors registered in registry matching filters.</div>
                        )}
                      </div>

                      <PaginationControls currentPage={vendorsPage} totalPages={vendorsTotalPages} onPageChange={setVendorsPage} />
                    </>
                  )}

                  {/* C. Product Review */}
                  {activeTab === 'products' && (
                    <>
                      {/* Desktop View */}
                      <div className="hidden md:block overflow-x-auto min-h-[280px]">
                        <table className="w-full text-left border-separate border-spacing-y-1 min-w-[1000px] admin-data-table">
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
                                  <ActionGroup>
                                    {product.status === 'PENDING_ADMIN' ? (
                                      <ActionPanelButton onClick={() => handleOpenApprovalModal(product, 'product')} />
                                    ) : (
                                      <SuspendButton
                                        isSuspended={product.status === 'BLOCKED'}
                                        tooltip={product.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                                        onClick={() => handleToggleSuspension('product', product.id, product.status)}
                                      />
                                    )}
                                  </ActionGroup>
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
                      </div>

                      {/* Mobile View - Card Layout */}
                      <div className="block md:hidden divide-y divide-slate-100">
                        {paginatedProducts.map(product => (
                          <div key={product.id} className="py-5 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-0.5">
                                <span className="text-sm font-black text-slate-900 block">{product.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-1.5 block">SKU: {product.sku}</span>
                              </div>
                              <StatusBadge status={product.status} />
                            </div>

                            <div className="space-y-2 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 text-xs text-slate-500 font-semibold">
                              <div>
                                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Brand Owner</span>
                                <span className="text-slate-850 font-bold mt-0.5 block">{product.brandName}</span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                <div>
                                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Stock Level</span>
                                  <span className={`text-[11px] font-bold block mt-1 ${product.stock <= 50 ? 'text-amber-600' : 'text-slate-800'}`}>
                                    {product.stock} units
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Unit Price</span>
                                  <span className="text-slate-800 text-[11px] font-bold block mt-1 font-mono">₹{product.price.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 justify-end pt-1">
                              {product.status === 'PENDING_ADMIN' ? (
                                <button
                                  onClick={() => handleOpenApprovalModal(product, 'product')}
                                  className="h-11 flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10"
                                >
                                  <CheckCircle size={14} /> Evaluate Product
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleSuspension('product', product.id, product.status)}
                                  className={`h-11 flex-1 flex items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition-all ${
                                    product.status === 'BLOCKED'
                                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                                      : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-500 hover:text-white'
                                  }`}
                                >
                                  <Power size={14} /> {product.status === 'BLOCKED' ? 'Unblock Product' : 'Block Product'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {filteredProducts.length === 0 && (
                          <div className="py-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">No product models matching criteria.</div>
                        )}
                      </div>

                      <PaginationControls currentPage={productsPage} totalPages={productsTotalPages} onPageChange={setProductsPage} />
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

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
function DocumentCard({ name, docNum, expiry, status }: { name: string; docNum: string; expiry: string; status: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
          <FileText size={18} />
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[8px] font-black uppercase tracking-widest">{status}</span>
      </div>
      <div>
        <h4 className="text-sm font-black text-slate-900 block truncate">{name}</h4>
        <span className="text-[10px] text-slate-400 font-bold mt-1 block">ID/No: {docNum}</span>
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-500">
        <span>Expiry: {expiry}</span>
        <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Mock Document View Initiated'); }} className="text-emerald-600 hover:underline">View PDF</a>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, color, Icon }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group relative overflow-hidden flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-md ${color} shadow-slate-200`}>
          <Icon size={16} />
        </div>
        <ChevronRight size={12} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
      </div>
      <div className="space-y-0.5 mt-3">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</span>
        <h3 className="text-xl font-black text-slate-950 tracking-tighter leading-none">{value}</h3>
        <p className="text-[9px] text-slate-400 font-bold mt-0.5 tracking-wide">{subtitle}</p>
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
