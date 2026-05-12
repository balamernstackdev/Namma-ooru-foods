'use client';

import { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle, XCircle, Clock, Eye, Trash2 } from 'lucide-react';
import { API_URL } from '@/lib/api';
import AdminPagination from '@/components/admin/AdminPagination';

interface RefundOrder {
  id: number; invoiceNumber?: string; refundStatus: string; refundAmount?: number;
  totalAmount: number; createdAt: string;
  user: { name?: string; email: string; };
  items: { product: { name: string } }[];
}

const STATUS_COLOR: Record<string, string> = {
  REQUESTED: 'bg-amber-100 text-amber-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-600'
};

export default function AdminRefundsPage() {
  const [orders, setOrders] = useState<RefundOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRefunds(currentPage);
  }, [currentPage]);

  const fetchRefunds = (page: number) => {
    setLoading(true);
    fetch(`${API_URL}/api/refunds/admin/requests?page=${page}&limit=${itemsPerPage}`)
      .then(r => r.json())
      .then(data => {
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setLoading(false));
  };

  const updateStatus = async (orderId: number, refundStatus: string) => {
    setUpdating(orderId);
    try {
      await fetch(`${API_URL}/api/refunds/admin/${orderId}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refundStatus })
      });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, refundStatus } : o));
    } finally { setUpdating(null); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently remove this refund record? This action is irreversible.')) return;
    try {
      const res = await fetch(`${API_URL}/api/refunds/admin/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-4xl font-black text-[var(--admin-sidebar)] tracking-tighter uppercase">REFUND REQUESTS</h2>
        <p className="text-slate-400 font-medium text-sm mt-1">{orders.length} refund requests on this page</p>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                {['Order', 'Customer', 'Items', 'Amount', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="px-8 py-20 text-center"><div className="h-12 w-12 border-4 border-slate-100 border-t-[var(--admin-accent)] rounded-full animate-spin mx-auto" /></td></tr>
              ) : orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-5">
                    <p className="text-xs font-black text-[var(--admin-sidebar)]">#{order.id}</p>
                    {order.invoiceNumber && <p className="text-[10px] text-slate-400 font-mono">{order.invoiceNumber}</p>}
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-black text-[var(--admin-sidebar)]">{order.user?.name || 'N/A'}</p>
                    <p className="text-[10px] text-slate-400">{order.user?.email}</p>
                  </td>
                  <td className="px-8 py-5 max-w-[200px]">
                    <p className="text-xs text-slate-500 font-medium line-clamp-2">
                      {order.items?.map(i => i.product?.name).join(', ') || 'N/A'}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-[var(--admin-sidebar)]">₹{Number(order.refundAmount || order.totalAmount).toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${STATUS_COLOR[order.refundStatus] || 'bg-slate-100 text-slate-500'}`}>
                      {order.refundStatus}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <p className="text-xs font-bold text-slate-400">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </td>
                  <td className="px-8 py-5">
                    {updating === order.id ? (
                      <div className="h-8 w-8 border-2 border-slate-100 border-t-[var(--admin-accent)] rounded-full animate-spin" />
                    ) : (
                      <div className="flex items-center gap-2">
                        {order.refundStatus === 'REQUESTED' && (
                          <>
                            <button id={`approve-refund-${order.id}`} onClick={() => updateStatus(order.id, 'COMPLETED')} title="Approve Refund"
                              className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all">
                              <CheckCircle size={15} />
                            </button>
                            <button id={`reject-refund-${order.id}`} onClick={() => updateStatus(order.id, 'REJECTED')} title="Reject Refund"
                              className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 text-red-300 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                        {order.refundStatus === 'PROCESSING' && (
                          <button onClick={() => updateStatus(order.id, 'COMPLETED')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-200 transition-all">
                            <CheckCircle size={12} /> Mark Complete
                          </button>
                        )}
                        <button onClick={() => handleDelete(order.id)} className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 text-red-300 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all" title="Delete Record">
                           <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && orders.length === 0 && (
                <tr><td colSpan={7} className="px-8 py-20 text-center">
                  <RotateCcw className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-300 font-bold text-sm">No refund requests yet.</p>
                </td></tr>
              )}
            </tbody>
          </table>
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
