'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';
import {
  ShoppingBag, Package, Clock, CheckCircle, MoreVertical,
  Search, Filter, Loader2, XCircle, Truck, MapPin, ChevronDown,
  ChevronUp, ExternalLink, Save, RotateCcw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface VendorOrder {
  id: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: { name: string; email: string; phone?: string };
  shippingAddress?: {
    line1: string; line2?: string; city: string;
    state: string; pincode: string; phone?: string;
    recipientName?: string;
  };
  shipment?: {
    carrierName?: string; trackingNumber?: string;
    trackingUrl?: string; estimatedDelivery?: string;
  };
  items: { id: number; productId: number; productName: string; quantity: number; price: number }[];
  transactions?: { providerRef: string }[];
}

export default function VendorOrders() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [savingTrackingId, setSavingTrackingId] = useState<number | null>(null);
  const [trackingForms, setTrackingForms] = useState<Record<number, { carrierName: string; trackingNumber: string; trackingUrl: string; estimatedDelivery: string }>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const { data: orders, error, mutate } = useSWR<VendorOrder[]>(
    user?.brandId ? `${API_URL}/api/orders/vendor?subVendorId=${user.brandId}` : null,
    fetcher
  );

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);
    setOpenDropdownId(null);
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) await mutate();
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleSaveTracking = async (orderId: number) => {
    const form = trackingForms[orderId];
    if (!form) return;
    setSavingTrackingId(orderId);
    try {
      const res = await fetch(`${API_URL}/api/tracking/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        await mutate();
        setSuccessMsg(`Tracking saved for Order #${orderId}`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error('Failed to save tracking', err);
    } finally {
      setSavingTrackingId(null);
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDING': return 'PROCESSING';
      case 'PROCESSING': return 'SHIPPED';
      case 'SHIPPED': return 'DELIVERED';
      default: return 'PROCESSING';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'text-emerald-600';
      case 'SHIPPED': return 'text-blue-500';
      case 'PROCESSING': return 'text-amber-500';
      default: return 'text-slate-400';
    }
  };

  const handleVerifyPayment = async (providerRef: string) => {
    try {
      setSuccessMsg('Verifying payment status...');
      const res = await fetch(`${API_URL}/api/payments/status/${providerRef}`);
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Gateway Status: ${data.status}`);
        mutate();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        alert(data.error || 'Failed to verify payment');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to verify payment');
    }
  };

  const handleRefund = async (providerRef: string, totalAmount: number) => {
    if (!confirm(`Are you sure you want to issue a full refund of ₹${totalAmount}?`)) return;
    try {
      setSuccessMsg('Initiating refund...');
      const res = await fetch(`${API_URL}/api/payments/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: providerRef, amount: totalAmount, reason: 'Vendor Action' })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Refund successful! Status: ${data.gatewayResponse?.status || 'Initiated'}`);
        mutate();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        alert(data.error || 'Failed to refund order');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to refund order');
    }
  };

  const filteredOrders = orders?.filter(o => {
    const matchesSearch = o.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items.some(i => i.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const paginatedOrders = React.useMemo(() => {
    return filteredOrders.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredOrders, currentPage]);

  const loading = user?.brandId ? (!orders && !error) : false;

  return (
    <div className="space-y-10">
      {/* Toast */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F7A4D] text-white px-5 py-4 rounded-2xl shadow-xl text-xs font-black">
          ✓ {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-[#0F7A4D] tracking-tighter uppercase">Fulfillment Desk</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest leading-relaxed">
            Managing order resolution for <span className="text-emerald-800">Namma Reseller Store</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <ShoppingBag size={20} />
            </div>
            <div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Needs Action</div>
              <div className="text-lg font-black text-slate-800">{filteredOrders.filter(o => o.status === 'PROCESSING').length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4 relative">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by customer name or Product Name..."
            className="w-full h-16 pl-16 pr-6 rounded-[1.5rem] bg-white border border-slate-200/80 focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 transition-all outline-none font-bold text-slate-800 placeholder:text-slate-350 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <button 
            type="button"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="h-16 px-8 rounded-[1.5rem] bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 transition-all text-[11px] font-black uppercase tracking-widest flex items-center gap-3 shadow-sm"
          >
            <Filter size={18} /> {statusFilter === 'ALL' ? 'Filter Desk' : `Status: ${statusFilter}`}
          </button>
          
          {showFilterDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 py-3 space-y-1">
              {['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status);
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wide ${
                    statusFilter === status 
                      ? 'bg-[#0F7A4D]/10 text-[#0F7A4D] font-black' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {status === 'ALL' ? 'All Orders' : status}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Orders */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)
        ) : paginatedOrders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
          const providerRef = order.transactions?.[0]?.providerRef;
          const trackingForm = trackingForms[order.id] || {
            carrierName: order.shipment?.carrierName || '',
            trackingNumber: order.shipment?.trackingNumber || '',
            trackingUrl: order.shipment?.trackingUrl || '',
            estimatedDelivery: order.shipment?.estimatedDelivery ? order.shipment.estimatedDelivery.slice(0, 16) : ''
          };

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:border-emerald-500/20 transition-all group relative"
            >
              {/* Clean row for sellers */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10 p-6 md:p-8">
                {/* Order Identity */}
                <div className="flex items-center gap-6 w-full lg:w-[15%]">
                  <div className="h-20 w-20 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 shrink-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order</span>
                    <span className="text-xl font-black text-slate-800">#{order.id}</span>
                  </div>
                </div>

                {/* Products */}
                <div className="w-full lg:w-[65%] flex flex-col gap-3 lg:gap-4">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Products & Earnings</div>
                  <div className="flex flex-col gap-2.5">
                    {order.items.map((item: any) => {
                      const comm = item.commissionRate || 10;
                      const itemGross = item.price * item.quantity;
                      const itemEarnings = itemGross * (1 - comm / 100);
                      return (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100/80 text-[11px] font-bold text-slate-700">
                          <div className="flex items-center gap-3">
                            <Package size={14} className="text-[#0F7A4D] shrink-0" />
                            <div>
                              <span className="font-black text-slate-800">{item.productName}</span>
                              <span className="text-[10px] text-slate-400 font-bold ml-2">Qty: {item.quantity} × ₹{item.price}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-black tracking-tight text-slate-500">
                            <div>
                              <span className="text-slate-400 font-bold">Gross: </span>
                              <span className="font-black text-slate-700">₹{itemGross}</span>
                            </div>
                            <div className="bg-amber-50/60 px-2 py-0.5 rounded border border-amber-100/50 text-amber-700">
                              <span>Comm: {comm}%</span>
                            </div>
                            <div className="bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 text-[#0F7A4D]">
                              <span>Earnings: </span>
                              <span className="font-bold">₹{itemEarnings.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status & Amount */}
                <div className="flex flex-col items-start lg:items-end gap-2 lg:gap-3 w-full lg:w-[20%] border-t border-slate-100 pt-4 lg:pt-0 lg:border-t-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${order.status === 'DELIVERED' ? 'bg-[#DCFCE7] border-[#DCFCE7] text-[#15803D]' :
                        order.status === 'SHIPPED' ? 'bg-[#DBEAFE] border-[#DBEAFE] text-[#2563EB]' :
                          order.status === 'PROCESSING' ? 'bg-[#FEF3C7] border-[#FEF3C7] text-[#B45309]' :
                            order.status === 'CANCELLED' ? 'bg-[#FEE2E2] border-[#FEE2E2] text-[#DC2626]' :
                              'bg-[#F3F4F6] border-[#F3F4F6] text-[#4B5563]'
                      }`}>{order.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Your Total Earnings</span>
                    <span className="text-xl font-black text-[#0F7A4D] tracking-tighter">
                      ₹{order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity) * (1 - (item.commissionRate || 10) / 100), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deco */}
              <div className="absolute top-0 right-0 w-32 h-full overflow-hidden rounded-[2.5rem] pointer-events-none">
                <div className="w-full h-full bg-slate-50/50 -skew-x-12 translate-x-8" />
              </div>
            </motion.div>
          );
        })}
        {!loading && filteredOrders.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
              <ShoppingBag size={40} />
            </div>
            <h3 className="text-xl font-black text-emerald-950 uppercase tracking-tighter">No Active Fulfillment Required</h3>
            <p className="text-slate-400 max-w-xs text-sm font-medium">Your Product is balanced. Check back soon for new customer integrations.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-6 px-2 animate-in fade-in duration-500">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => { setCurrentPage(currentPage - 1); }}
              className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:pointer-events-none active:scale-95 flex items-center gap-1"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                return (
                  <button
                    key={page}
                    onClick={() => { setCurrentPage(page); }}
                    className={`h-9 w-9 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center justify-center border ${currentPage === page
                      ? 'bg-[#0F7A4D] text-white shadow-md border-[#0F7A4D]'
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
              onClick={() => { setCurrentPage(currentPage + 1); }}
              className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:pointer-events-none active:scale-95 flex items-center gap-1"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
