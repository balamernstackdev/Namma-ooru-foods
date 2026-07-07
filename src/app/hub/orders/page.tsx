'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { Search, ShoppingBag, ChevronRight, ChevronLeft, Download, ListFilter } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }).then(res => {
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  });
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  DELIVERED: { label: 'Delivered', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  COMPLETED: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  PENDING:   { label: 'Pending',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  PROCESSING:{ label: 'Processing',cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  SHIPPED:   { label: 'Shipped',   cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-50 text-red-600 border-red-200' },
};

const fmtRs = (n: number) => `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function HubOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const { hasPermission } = useAuth();
  const hasExportPerm = hasPermission('orders', 'export');

  const { data, error, isLoading } = useSWR(
    `${API_URL}/api/vendor-hub/orders?page=${page}&limit=10&search=${searchTerm}${statusFilter ? `&status=${statusFilter}` : ''}`,
    fetcher
  );

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6 pb-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
            <Link href="/hub/dashboard" className="hover:text-[#059669] transition-colors">Dashboard</Link>
            <ChevronRight size={10} />
            <span className="text-slate-500">Hub Orders</span>
          </div>
          <h2 className="text-3xl lg:text-[36px] font-black tracking-tight leading-tight uppercase italic text-[#0F172A]">
            Hub <span className="text-[#059669]">Orders</span>
          </h2>
          <p className="text-[15px] font-medium text-slate-500 mt-1">
            Monitor and manage all orders across your assigned regional hub vendors.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {hasExportPerm && (
            <button
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/70 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <Download size={15} />
              Export
            </button>
          )}
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-[18px] border border-slate-200/60 shadow-sm overflow-hidden">

        {/* Filters Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center bg-slate-50/50">
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search order ID or customer..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] outline-none text-sm font-semibold text-slate-700 bg-white transition-all"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2">
              <ListFilter size={15} className="text-slate-400" />
              <select
                className="border border-slate-200 rounded-xl px-3 py-2.5 bg-white focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669] outline-none text-sm font-bold text-slate-700 appearance-none pr-8 cursor-pointer"
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Result count */}
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 shrink-0">
            {total} orders
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-100 border-t-[#059669] mx-auto mb-3" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 font-semibold text-sm">
              Failed to load orders. Please retry.
            </div>
          ) : orders.length === 0 ? (
            <div className="p-16 text-center">
              <ShoppingBag size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">No orders found.</p>
              <p className="text-slate-400 text-xs font-medium mt-1">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  {['Order ID', 'Date & Time', 'Customer', 'Items', 'Hub Subtotal', 'Order Total', 'Status'].map(h => (
                    <th key={h} className="px-5 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order: any) => {
                  const sc = statusConfig[order.status] || { label: order.status, cls: 'bg-slate-50 text-slate-600 border-slate-200' };
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                          {order.orderIdStr || `ORD-${order.id}`}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold text-slate-600">
                          {order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : '—'}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-medium mt-0.5">
                          {order.createdAt ? format(new Date(order.createdAt), 'hh:mm a') : ''}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-slate-900">{order.customerName || '—'}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-sm font-bold text-slate-700">{order.itemsCount ?? '—'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-black text-[#059669]">{fmtRs(order.hubSubtotal)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-slate-900">{fmtRs(order.totalAmount)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black border tracking-wider ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <span className="text-[11px] font-bold text-slate-500">
              Page {page} of {totalPages} &middot; {total} total orders
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs font-bold hover:border-[#059669]/40 hover:text-[#059669] disabled:opacity-40 transition-all"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs font-bold hover:border-[#059669]/40 hover:text-[#059669] disabled:opacity-40 transition-all"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
