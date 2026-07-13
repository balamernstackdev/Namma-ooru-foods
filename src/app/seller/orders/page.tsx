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
  }, [searchTerm]);

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

  const filteredOrders = orders?.filter(o =>
    o.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.items.some(i => i.productName.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

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
      <div className="flex flex-col md:flex-row gap-4">
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
        <button className="h-16 px-8 rounded-[1.5rem] bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 transition-all text-[11px] font-black uppercase tracking-widest flex items-center gap-3 shadow-sm">
          <Filter size={18} /> Filter Desk
        </button>
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
              {/* Collapsed row */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10 p-6 md:p-8">
                {/* Order Identity */}
                <div className="flex items-center gap-6 w-full lg:w-1/4">
                  <div className="h-20 w-20 rounded-2xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 shrink-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order</span>
                    <span className="text-xl font-black text-slate-800">#{order.id}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</span>
                    <h4 className="text-[15px] font-black text-slate-850 truncate">{order.user.name}</h4>
                    <p className="text-[10px] font-bold text-slate-450 truncate">{order.user.email}</p>
                  </div>
                </div>

                {/* Products */}
                <div className="w-full lg:flex-1 flex flex-col gap-3 lg:gap-4">
                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Products</div>
                  <div className="flex flex-wrap gap-3">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                        <Package size={14} className="text-[#0F7A4D]" />
                        <span className="text-[11px] font-black text-slate-700">{item.productName} × {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status & Amount */}
                <div className="flex flex-col items-start lg:items-end gap-2 lg:gap-3 w-full lg:w-1/5 border-t border-slate-100 pt-4 lg:pt-0 lg:border-t-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${order.status === 'DELIVERED' ? 'bg-[#DCFCE7] border-[#DCFCE7] text-[#15803D]' :
                        order.status === 'SHIPPED' ? 'bg-[#DBEAFE] border-[#DBEAFE] text-[#2563EB]' :
                          order.status === 'PROCESSING' ? 'bg-[#FEF3C7] border-[#FEF3C7] text-[#B45309]' :
                            order.status === 'CANCELLED' ? 'bg-[#FEE2E2] border-[#FEE2E2] text-[#DC2626]' :
                              'bg-[#F3F4F6] border-[#F3F4F6] text-[#4B5563]'
                      }`}>{order.status}</span>
                  </div>
                  <div className="text-xl font-black text-slate-800 tracking-tighter">₹{order.totalAmount}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full lg:w-auto justify-end pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-8 relative">
                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-100 transition-all"
                    title="View Details"
                  >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  {/* Quick advance status */}
                  <button
                    onClick={() => handleUpdateStatus(order.id, getNextStatus(order.status))}
                    disabled={updatingOrderId === order.id || order.status === 'DELIVERED'}
                    title={`Mark as ${getNextStatus(order.status)}`}
                    className="h-14 w-14 rounded-2xl bg-[#0F7A4D] hover:bg-[#0c623d] text-white flex items-center justify-center transition-all shadow-sm disabled:opacity-40"
                  >
                    {updatingOrderId === order.id ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <CheckCircle size={20} />
                    )}
                  </button>

                  {/* Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdownId(openDropdownId === order.id ? null : order.id)}
                      className="h-14 w-14 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 transition-all"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {openDropdownId === order.id && (
                      <div className="absolute right-0 top-16 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50">
                        <button onClick={() => handleUpdateStatus(order.id, 'PROCESSING')} className="w-full px-4 py-3 flex items-center gap-3 text-left text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
                          <Clock size={16} className="text-amber-500" /> Processing
                        </button>
                        <button onClick={() => handleUpdateStatus(order.id, 'SHIPPED')} className="w-full px-4 py-3 flex items-center gap-3 text-left text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
                          <Truck size={16} className="text-blue-500" /> Shipped
                        </button>
                        <button onClick={() => handleUpdateStatus(order.id, 'DELIVERED')} className="w-full px-4 py-3 flex items-center gap-3 text-left text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
                          <CheckCircle size={16} className="text-emerald-500" /> Delivered
                        </button>
                        <div className="border-t border-slate-100 my-1" />
                        <button onClick={() => handleUpdateStatus(order.id, 'CANCELLED')} className="w-full px-4 py-3 flex items-center gap-3 text-left text-[12px] font-bold text-red-650 hover:bg-red-50 transition-all">
                          <XCircle size={16} className="text-red-500" /> Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Panel */}
              {isExpanded && (
                <div className="border-t border-slate-100 px-8 pb-8 pt-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Delivery Address */}
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin size={16} className="text-[#0F7A4D]" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Address</span>
                      </div>
                      {order.shippingAddress ? (
                        <div className="space-y-1">
                          <p className="text-sm font-black text-slate-800">
                            {order.shippingAddress.recipientName || order.user.name}
                          </p>
                          <p className="text-xs font-bold text-slate-500">
                            📞 {order.shippingAddress.phone || order.user.phone || 'N/A'}
                          </p>
                          <p className="text-xs text-slate-600 font-medium mt-1">
                            {order.shippingAddress.line1}
                            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 font-medium">No address on record</p>
                      )}
                    </div>

                    {/* Tracking Form */}
                    <div className="bg-amber-50/20 rounded-2xl p-5 border border-amber-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Truck size={16} className="text-amber-500" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Shipment Tracking</span>
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Carrier Name (e.g. DTDC, Blue Dart)"
                          value={trackingForm.carrierName}
                          onChange={e => setTrackingForms(prev => ({ ...prev, [order.id]: { ...trackingForm, carrierName: e.target.value } }))}
                          className="w-full h-10 px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#0F7A4D] transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Tracking Number"
                          value={trackingForm.trackingNumber}
                          onChange={e => setTrackingForms(prev => ({ ...prev, [order.id]: { ...trackingForm, trackingNumber: e.target.value } }))}
                          className="w-full h-10 px-4 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#0F7A4D] transition-all"
                        />
                        <input
                          type="url"
                          placeholder="Tracking URL (https://...)"
                          value={trackingForm.trackingUrl}
                          onChange={e => setTrackingForms(prev => ({ ...prev, [order.id]: { ...trackingForm, trackingUrl: e.target.value } }))}
                          className="w-full h-10 px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#0F7A4D] transition-all"
                        />
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase font-black tracking-widest text-slate-400">Estimated Delivery Date & Time</label>
                          <input
                            type="datetime-local"
                            value={trackingForm.estimatedDelivery}
                            onChange={e => setTrackingForms(prev => ({ ...prev, [order.id]: { ...trackingForm, estimatedDelivery: e.target.value } }))}
                            className="w-full h-10 px-4 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 placeholder:text-slate-300 outline-none focus:border-[#0F7A4D] transition-all"
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={() => handleSaveTracking(order.id)}
                            disabled={savingTrackingId === order.id}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#0F7A4D] hover:bg-[#0c623d] disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all"
                          >
                            {savingTrackingId === order.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save & Mark Shipped
                          </button>
                          {trackingForm.trackingUrl && (
                            <a href={trackingForm.trackingUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest"
                            >
                              Preview Link <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                      {providerRef && (
                        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
                          <span className="text-[10px] text-slate-400 font-bold mr-auto">Provider Ref: {providerRef}</span>
                          <button onClick={() => handleVerifyPayment(providerRef)} className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
                            <RotateCcw size={14} /> Verify Payment Status
                          </button>
                          <button onClick={() => handleRefund(providerRef, order.totalAmount)} className="px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
                            <XCircle size={14} /> Initiate Refund
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
