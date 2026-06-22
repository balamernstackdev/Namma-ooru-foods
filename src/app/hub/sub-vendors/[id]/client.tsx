'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, ShoppingBag, Users, Wallet, CheckCircle2, XCircle, Clock, IndianRupee } from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }).then(res => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  });
};

const fmt = (n: number) => Number(n || 0).toLocaleString('en-IN');
const fmtRs = (n: number) => `₹${fmt(n)}`;

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    DELIVERED: 'bg-green-100 text-green-800',
    PENDING: 'bg-amber-100 text-amber-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-purple-100 text-purple-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    DRAFT: 'bg-slate-100 text-slate-600',
    COMPLETED: 'bg-green-100 text-green-800',
    SETTLED: 'bg-teal-100 text-teal-800',
    ON_HOLD: 'bg-orange-100 text-orange-800',
    FAILED: 'bg-red-100 text-red-800',
  };
  return map[s] || 'bg-slate-100 text-slate-600';
};

type Tab = 'profile' | 'products' | 'orders' | 'customers' | 'payouts';

export default function SubVendorDetailClient() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params?.id as string;
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [productPage, setProductPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const [payoutPage, setPayoutPage] = useState(1);

  const { data: vendor, error: vendorError, isLoading: vendorLoading } = useSWR(
    vendorId ? `${API_URL}/api/vendor-hub/sub-vendors/${vendorId}/detail` : null, fetcher
  );
  const { data: productsData, isLoading: prodLoading } = useSWR(
    activeTab === 'products' && vendorId ? `${API_URL}/api/vendor-hub/sub-vendors/${vendorId}/products?page=${productPage}&limit=10` : null, fetcher
  );
  const { data: ordersData, isLoading: ordLoading } = useSWR(
    activeTab === 'orders' && vendorId ? `${API_URL}/api/vendor-hub/sub-vendors/${vendorId}/orders?page=${orderPage}&limit=10` : null, fetcher
  );
  const { data: customersData, isLoading: custLoading } = useSWR(
    activeTab === 'customers' && vendorId ? `${API_URL}/api/vendor-hub/sub-vendors/${vendorId}/customers?page=${customerPage}&limit=10` : null, fetcher
  );
  const { data: payoutsData, isLoading: payLoading } = useSWR(
    activeTab === 'payouts' && vendorId ? `${API_URL}/api/vendor-hub/sub-vendors/${vendorId}/payouts?page=${payoutPage}&limit=10` : null, fetcher
  );

  if (vendorLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-700" />
      </div>
    );
  }

  if (vendorError || !vendor) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">
        Error loading sub-vendor details. Please go back and try again.
      </div>
    );
  }

  const selId = `SEL-${vendor.id.toString().padStart(3, '0')}`;
  const hubId = vendor.headVendor?.vendorHubId || `VEN-${(vendor.headVendorId || 0).toString().padStart(3, '0')}`;
  const status = vendor.deletedAt ? 'Disabled' : (vendor.userId ? 'Active' : 'Pending');
  const stats = vendor.stats || {};

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'profile', label: 'Profile', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'payouts', label: 'Payouts', icon: Wallet },
  ];

  const statCards = [
    { label: 'Products', value: fmt(stats.totalProducts), icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Total Orders', value: fmt(stats.totalOrders), icon: ShoppingBag, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Revenue', value: fmtRs(stats.revenue), icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Pending Orders', value: fmt(stats.pendingOrders), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Delivered', value: fmt(stats.deliveredOrders), icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Cancelled', value: fmt(stats.cancelledOrders), icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Customers', value: fmt(stats.totalCustomers), icon: Users, color: 'text-sky-500', bg: 'bg-sky-50' },
    { label: 'Total Payout', value: fmtRs(stats.totalPayout), icon: Wallet, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors mt-1">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            {vendor.logo && (
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden">
                <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-contain" />
              </div>
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">{vendor.name}</h1>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  status === 'Active' ? 'bg-green-100 text-green-800 border-green-200' :
                  status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  'bg-red-100 text-red-800 border-red-200'
                }`}>{status}</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {selId}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">Hub: {hubId}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
                <Icon size={20} className={s.color} />
              </div>
              <div className="text-xl font-black text-slate-900">{s.value}</div>
              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50/50">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                    : 'border-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 border-b border-slate-100 pb-3">Business Details</h3>
                {[
                  { label: 'Store Name', value: vendor.name },
                  { label: 'Owner Name', value: vendor.owner?.name || 'Unassigned' },
                  { label: 'Email', value: vendor.owner?.email || '-' },
                  { label: 'Phone', value: vendor.owner?.phone || '-' },
                  { label: 'Website', value: vendor.website || '-' },
                  { label: 'Slug', value: vendor.slug || '-' },
                  { label: 'Commission Rate', value: `${vendor.commissionRate || 10}%` },
                  { label: 'Joined Date', value: new Date(vendor.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-800 text-right max-w-[60%]">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-700 border-b border-slate-100 pb-3">Financial Summary</h3>
                {[
                  { label: 'Available Balance', value: fmtRs(vendor.availableBalance) },
                  { label: 'Pending Balance', value: fmtRs(vendor.pendingBalance) },
                  { label: 'Total Revenue', value: fmtRs(stats.revenue) },
                  { label: 'Total Payout', value: fmtRs(stats.totalPayout) },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">{item.value}</span>
                  </div>
                ))}
                {vendor.description && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Description</p>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">{vendor.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {prodLoading ? (
                <div className="py-10 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-emerald-600 rounded-full mx-auto" /></div>
              ) : (productsData?.products?.length === 0) ? (
                <div className="py-10 text-center text-slate-400 text-sm font-bold">No products found for this vendor.</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {['Product ID', 'SKU', 'Image', 'Name', 'Category', 'Stock', 'Price', 'Status'].map(h => (
                            <th key={h} className="pb-3 px-2 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-sm font-semibold text-slate-700">
                        {productsData?.products?.map((p: any) => (
                          <tr key={p.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-2">
                              <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                                {p.productIdStr || `PROD-${p.id.toString().padStart(3,'0')}`}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <span className="font-mono text-[10px] text-slate-500">
                                {p.skuCode || p.sku || '-'}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              {p.image ? (
                                <img src={p.image} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-100" />
                              ) : (
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300">
                                  <Package size={16} />
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-2 max-w-[200px]">
                              <div className="font-bold text-slate-900 truncate text-xs">{p.name}</div>
                            </td>
                            <td className="py-3 px-2 text-xs text-slate-500">{p.category?.name || '-'}</td>
                            <td className="py-3 px-2 text-center font-bold">{p.stock || 0}</td>
                            <td className="py-3 px-2 font-bold text-slate-900">₹{Number(p.price).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusColor(p.status)}`}>{p.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {productsData?.totalPages > 1 && (
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
                      <span>Page {productPage} of {productsData.totalPages}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setProductPage(p => Math.max(p-1,1))} disabled={productPage===1} className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40">Prev</button>
                        <button onClick={() => setProductPage(p => Math.min(p+1, productsData.totalPages))} disabled={productPage===productsData.totalPages} className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40">Next</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {ordLoading ? (
                <div className="py-10 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-emerald-600 rounded-full mx-auto" /></div>
              ) : (ordersData?.orders?.length === 0) ? (
                <div className="py-10 text-center text-slate-400 text-sm font-bold">No orders found.</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {['Order ID', 'Customer', 'Date', 'Amount', 'Payment', 'Delivery Status'].map(h => (
                            <th key={h} className="pb-3 px-2 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {ordersData?.orders?.map((o: any) => (
                          <tr key={o.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-2">
                              <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                {o.orderIdStr || `ORD-${o.id.toString().padStart(3,'0')}`}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-sm font-semibold text-slate-800">{o.customerName}</td>
                            <td className="py-3 px-2 text-xs text-slate-500">
                              {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                            </td>
                            <td className="py-3 px-2 font-bold text-slate-900 text-sm">
                              ₹{Number(o.hubSubtotal).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-2 text-xs text-slate-500">{o.paymentMethod || '-'}</td>
                            <td className="py-3 px-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusColor(o.status)}`}>{o.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {ordersData?.totalPages > 1 && (
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
                      <span>Page {orderPage} of {ordersData.totalPages}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setOrderPage(p => Math.max(p-1,1))} disabled={orderPage===1} className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40">Prev</button>
                        <button onClick={() => setOrderPage(p => Math.min(p+1, ordersData.totalPages))} disabled={orderPage===ordersData.totalPages} className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40">Next</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              {custLoading ? (
                <div className="py-10 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-emerald-600 rounded-full mx-auto" /></div>
              ) : (customersData?.customers?.length === 0) ? (
                <div className="py-10 text-center text-slate-400 text-sm font-bold">No customers found.</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {['Name', 'Mobile', 'Email', 'Orders Count', 'Total Spend', 'Last Purchase'].map(h => (
                            <th key={h} className="pb-3 px-2 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {customersData?.customers?.map((c: any) => (
                          <tr key={c.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-2 font-bold text-slate-900 text-sm">{c.name}</td>
                            <td className="py-3 px-2 text-xs font-semibold text-slate-600">{c.phone || '-'}</td>
                            <td className="py-3 px-2 text-xs text-slate-500">{c.email}</td>
                            <td className="py-3 px-2 text-center font-bold text-slate-900">{c.ordersCount}</td>
                            <td className="py-3 px-2 font-bold text-emerald-700">₹{Number(c.totalSpend).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-2 text-xs text-slate-500">
                              {new Date(c.lastPurchase).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {customersData?.totalPages > 1 && (
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
                      <span>Page {customerPage} of {customersData.totalPages}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setCustomerPage(p => Math.max(p-1,1))} disabled={customerPage===1} className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40">Prev</button>
                        <button onClick={() => setCustomerPage(p => Math.min(p+1, customersData.totalPages))} disabled={customerPage===customersData.totalPages} className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40">Next</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* PAYOUTS TAB */}
          {activeTab === 'payouts' && (
            <div className="space-y-4">
              {payLoading ? (
                <div className="py-10 text-center"><div className="animate-spin h-8 w-8 border-b-2 border-emerald-600 rounded-full mx-auto" /></div>
              ) : (payoutsData?.payouts?.length === 0) ? (
                <div className="py-10 text-center text-slate-400 text-sm font-bold">No payouts found.</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {['Payout ID', 'Settlement Date', 'Gross Revenue', 'Commission', 'Net Payable', 'UTR', 'Status'].map(h => (
                            <th key={h} className="pb-3 px-2 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {payoutsData?.payouts?.map((p: any) => (
                          <tr key={p.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-2">
                              <span className="font-mono text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                                {p.payoutIdStr || `PAY-${p.id.toString().padStart(3,'0')}`}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-xs text-slate-500">
                              {p.payoutDate ? new Date(p.payoutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '-'}
                            </td>
                            <td className="py-3 px-2 font-bold text-slate-900">₹{Number(p.grossAmount || 0).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-2 font-semibold text-red-600">₹{Number(p.commission || 0).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-2 font-bold text-emerald-700">₹{Number(p.amount || 0).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-2 text-xs font-mono text-slate-500">{p.transactionRef || '-'}</td>
                            <td className="py-3 px-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusColor(p.status)}`}>{p.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {payoutsData?.totalPages > 1 && (
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
                      <span>Page {payoutPage} of {payoutsData.totalPages}</span>
                      <div className="flex gap-2">
                        <button onClick={() => setPayoutPage(p => Math.max(p-1,1))} disabled={payoutPage===1} className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40">Prev</button>
                        <button onClick={() => setPayoutPage(p => Math.min(p+1, payoutsData.totalPages))} disabled={payoutPage===payoutsData.totalPages} className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40">Next</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
