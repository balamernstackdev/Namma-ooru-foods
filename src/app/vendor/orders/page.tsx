'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';
import {
  ShoppingBag, Package, Clock, CheckCircle, MoreVertical,
  Search, Filter, Loader2, XCircle, Truck, MapPin, ChevronDown,
  ChevronUp, ExternalLink, Save
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

  const filteredOrders = orders?.filter(o =>
    o.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.items.some(i => i.productName.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const loading = user?.brandId ? (!orders && !error) : false;

  return (
    <div className="space-y-10">
      {/* Toast */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-white px-5 py-4 rounded-2xl shadow-xl text-xs font-black">
          ✓ {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-emerald-950 dark:text-white tracking-tighter uppercase">Fulfillment Desk</h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-relaxed">
            Managing order resolution for <span className="text-emerald-900 dark:text-emerald-400">Namma Reseller Store</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
              <ShoppingBag size={20} />
            </div>
            <div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Needs Action</div>
              <div className="text-lg font-black text-emerald-950 dark:text-white">{filteredOrders.filter(o => o.status === 'PROCESSING').length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          <input
            type="text"
            placeholder="Search by customer name or product title..."
            className="w-full h-16 pl-16 pr-6 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:border-emerald-100 transition-all outline-none font-bold text-emerald-950 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="h-16 px-8 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-emerald-950 dark:text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
          <Filter size={18} /> Filter Desk
        </button>
      </div>

      {/* Orders */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)
        ) : filteredOrders.map((order) => {
          const isExpanded = expandedOrderId === order.id;
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
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group relative"
            >
              {/* Collapsed row */}
              <div className="flex flex-col lg:flex-row items-center gap-10 p-8">
                {/* Order Identity */}
                <div className="flex items-center gap-6 lg:w-1/4">
                  <div className="h-20 w-20 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order</span>
                    <span className="text-xl font-black text-emerald-950 dark:text-white">#{order.id}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Customer</span>
                    <h4 className="text-[15px] font-black text-emerald-950 dark:text-white">{order.user.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">{order.user.email}</p>
                  </div>
                </div>

                {/* Products */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.3em]">Payload Integration</div>
                  <div className="flex flex-wrap gap-3">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800">
                        <Package size={14} className="text-emerald-600" />
                        <span className="text-[11px] font-black text-emerald-950 dark:text-emerald-100">{item.productName} × {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status & Amount */}
                <div className="flex flex-col items-end gap-3 lg:w-1/5">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className={getStatusColor(order.status)} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>{order.status}</span>
                  </div>
                  <div className="text-xl font-black text-emerald-950 dark:text-white tracking-tighter">₹{order.totalAmount}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pl-8 border-l border-slate-50 dark:border-slate-800 relative">
                  {/* Expand toggle */}
                  <button
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all"
                    title="View Details"
                  >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  {/* Quick advance status */}
                  <button
                    onClick={() => handleUpdateStatus(order.id, getNextStatus(order.status))}
                    disabled={updatingOrderId === order.id || order.status === 'DELIVERED'}
                    title={`Mark as ${getNextStatus(order.status)}`}
                    className="h-14 w-14 rounded-2xl bg-emerald-950 text-white flex items-center justify-center hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-40"
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
                      className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-50 transition-all"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {openDropdownId === order.id && (
                      <div className="absolute right-0 top-16 w-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl py-2 z-50">
                        <button onClick={() => handleUpdateStatus(order.id, 'PROCESSING')} className="w-full px-4 py-3 flex items-center gap-3 text-left text-[12px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                          <Clock size={16} className="text-amber-500" /> Processing
                        </button>
                        <button onClick={() => handleUpdateStatus(order.id, 'SHIPPED')} className="w-full px-4 py-3 flex items-center gap-3 text-left text-[12px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                          <Truck size={16} className="text-blue-500" /> Shipped
                        </button>
                        <button onClick={() => handleUpdateStatus(order.id, 'DELIVERED')} className="w-full px-4 py-3 flex items-center gap-3 text-left text-[12px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                          <CheckCircle size={16} className="text-emerald-500" /> Delivered
                        </button>
                        <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                        <button onClick={() => handleUpdateStatus(order.id, 'CANCELLED')} className="w-full px-4 py-3 flex items-center gap-3 text-left text-[12px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
                          <XCircle size={16} className="text-red-500" /> Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Panel */}
              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-800 px-8 pb-8 pt-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Delivery Address */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin size={16} className="text-emerald-600" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Address</span>
                      </div>
                      {order.shippingAddress ? (
                        <div className="space-y-1">
                          <p className="text-sm font-black text-emerald-950 dark:text-white">
                            {order.shippingAddress.recipientName || order.user.name}
                          </p>
                          <p className="text-xs font-bold text-slate-500">
                            📞 {order.shippingAddress.phone || order.user.phone || 'N/A'}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                            {order.shippingAddress.line1}
                            {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 font-medium">No address on record</p>
                      )}
                    </div>

                    {/* Tracking Form */}
                    <div className="bg-blue-50/60 dark:bg-blue-900/10 rounded-2xl p-5 border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-4">
                        <Truck size={16} className="text-blue-500" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Shipment Tracking</span>
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Carrier Name (e.g. DTDC, Blue Dart)"
                          value={trackingForm.carrierName}
                          onChange={e => setTrackingForms(prev => ({ ...prev, [order.id]: { ...trackingForm, carrierName: e.target.value } }))}
                          className="w-full h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-white placeholder:text-slate-300 outline-none focus:border-blue-400 transition-all"
                        />
                        <input
                          type="text"
                          placeholder="Tracking Number"
                          value={trackingForm.trackingNumber}
                          onChange={e => setTrackingForms(prev => ({ ...prev, [order.id]: { ...trackingForm, trackingNumber: e.target.value } }))}
                          className="w-full h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-700 dark:text-white placeholder:text-slate-300 outline-none focus:border-blue-400 transition-all"
                        />
                        <input
                          type="url"
                          placeholder="Tracking URL (https://...)"
                          value={trackingForm.trackingUrl}
                          onChange={e => setTrackingForms(prev => ({ ...prev, [order.id]: { ...trackingForm, trackingUrl: e.target.value } }))}
                          className="w-full h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-white placeholder:text-slate-300 outline-none focus:border-blue-400 transition-all"
                        />
                        <div className="space-y-1">
                          <label className="block text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">Estimated Delivery Date & Time</label>
                          <input
                            type="datetime-local"
                            value={trackingForm.estimatedDelivery}
                            onChange={e => setTrackingForms(prev => ({ ...prev, [order.id]: { ...trackingForm, estimatedDelivery: e.target.value } }))}
                            className="w-full h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-white placeholder:text-slate-300 outline-none focus:border-blue-400 transition-all"
                          />
                        </div>
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={() => handleSaveTracking(order.id)}
                            disabled={savingTrackingId === order.id}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all"
                          >
                            {savingTrackingId === order.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            Save & Mark Shipped
                          </button>
                          {trackingForm.trackingUrl && (
                            <a href={trackingForm.trackingUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[10px] font-black text-blue-500 hover:text-blue-700 uppercase tracking-widest"
                            >
                              Preview Link <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Deco */}
              <div className="absolute top-0 right-0 w-32 h-full overflow-hidden rounded-[2.5rem] pointer-events-none">
                <div className="w-full h-full bg-slate-50/50 dark:bg-slate-800/10 -skew-x-12 translate-x-8" />
              </div>
            </motion.div>
          );
        })}
        {!loading && filteredOrders.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
              <ShoppingBag size={40} />
            </div>
            <h3 className="text-xl font-black text-emerald-950 dark:text-white uppercase tracking-tighter">No Active Fulfillment Required</h3>
            <p className="text-slate-400 max-w-xs text-sm font-medium">Your Product is balanced. Check back soon for new customer integrations.</p>
          </div>
        )}
      </div>
    </div>
  );
}
