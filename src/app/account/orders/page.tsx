'use client';

import React, { useState, useEffect } from 'react';
import {
  Package, ChevronDown, ChevronUp, Star, RotateCcw, ChevronLeft, Loader2,
  Search, SlidersHorizontal, CheckCircle2, Clock, Truck, FileText,
  MapPin, Calendar, ShoppingBag, Eye, X, ArrowRight, HelpCircle, RefreshCcw
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';

interface InvoiceModalProps {
  order: any;
  onClose: () => void;
}

function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-slideUp">
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex justify-between items-center">
          <div>
            <h3 className="font-black text-lg tracking-tight">Invoice Receipt</h3>
            <p className="text-xs text-emerald-200/80 font-medium">Order #{order.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Date</p>
              <p className="text-sm font-bold text-slate-800">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Payment</p>
              <p className="text-sm font-black text-emerald-700">{order.paymentMethod || 'Online'}</p>
            </div>
          </div>

          <div className="border-t border-b border-slate-100 py-4 mb-6">
            <p className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">Items Purchased</p>
            <div className="flex flex-col gap-3">
              {(order.orderItems || order.items || []).map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">{item.product?.name || item.name} <span className="text-slate-400 font-bold">x{item.quantity}</span></span>
                  <span className="font-bold text-slate-800">₹{Number(item.price || item.unitPrice || 0) * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal</span>
              <span>₹{Number(order.totalAmount) - Number(order.gstAmount || 0)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>GST / Taxes</span>
              <span>₹{order.gstAmount || 0}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Discount</span>
              <span className="text-emerald-600">-₹{order.discountAmount || 0}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-800 pt-2 border-t border-dashed border-slate-100">
              <span>Total Amount</span>
              <span className="text-base text-emerald-800">₹{order.totalAmount}</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 text-[11px] text-slate-400 font-medium text-center">
            Thank you for shopping with Namma Ooru Foods! This is a system-generated receipt.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // ALL, PROCESSING, SHIPPED, DELIVERED
  const [devMode, setDevMode] = useState(false); // Developer mode toggle to show PENDING orders
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [activeInvoice, setActiveInvoice] = useState<any>(null);
  const [reorderedMessage, setReorderedMessage] = useState<string | null>(null);

  // Auto-reset page to 1 when queries or filters are updated
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFilter, devMode]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_URL}/api/orders/user/${user.id}`);
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleReorder = (orderId: number) => {
    setReorderedMessage(`Items from Order #${orderId} successfully copied to cart!`);
    setTimeout(() => setReorderedMessage(null), 3500);
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return {
          label: 'Delivered',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
          step: 3,
          progress: 'w-full bg-emerald-600',
          etaText: 'Delivered successfully'
        };
      case 'SHIPPED':
      case 'IN TRANSIT':
        return {
          label: 'In Transit',
          color: 'text-blue-700 bg-blue-50 border-blue-100',
          step: 2,
          progress: 'w-2/3 bg-blue-500',
          etaText: 'Arriving within 2-3 working days'
        };
      case 'PROCESSING':
        return {
          label: 'Confirmed & Packing',
          color: 'text-orange-700 bg-orange-50 border-orange-100',
          step: 1,
          progress: 'w-1/3 bg-orange-500',
          etaText: 'Arriving in 45 mins'
        };
      case 'PENDING':
      default:
        return {
          label: 'Unpaid / Awaiting Payment',
          color: 'text-slate-500 bg-slate-50 border-slate-100',
          step: 0,
          progress: 'w-0',
          etaText: 'Awaiting payment confirmation'
        };
    }
  };

  const getEstimatedDateString = (order: any) => {
    if (order.status?.toUpperCase() === 'DELIVERED') {
      const delDate = order.deliveryDate || order.updatedAt || order.createdAt;
      return `Delivered on ${new Date(delDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
    }
    
    const expDate = order.deliveryDate || order.shipment?.estimatedDelivery;
    if (expDate) {
      return `Est. Delivery by ${new Date(expDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
    }
    
    return null;
  };

  // Filter logic:
  // 1. Show only paid/confirmed orders unless devMode is active
  const baseFiltered = orders.filter(order => {
    if (devMode) return true; // Show all (Pending included)
    return order.status !== 'PENDING'; // Hide Pending/unpaid
  });

  // 2. Filter by Search Query
  const searchedFiltered = baseFiltered.filter(order => {
    const idMatches = order.id.toString().includes(searchQuery);
    const itemNames = (order.orderItems || order.items || []).map((i: any) => i.product?.name || i.name || '').join(' ').toLowerCase();
    const queryMatches = itemNames.includes(searchQuery.toLowerCase());
    return idMatches || queryMatches;
  });

  // 3. Filter by Tab selection
  const finalFiltered = searchedFiltered.filter(order => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'PROCESSING') return order.status === 'PROCESSING';
    if (selectedFilter === 'SHIPPED') return order.status === 'SHIPPED' || order.status === 'IN TRANSIT';
    if (selectedFilter === 'DELIVERED') return order.status === 'DELIVERED';
    return true;
  });

  const totalPages = Math.ceil(finalFiltered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = finalFiltered.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <Loader2 className="animate-spin text-emerald-600 h-10 w-10" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Tracking Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="py-2 px-0 md:px-4">
      {/* Toast Alert */}
      {reorderedMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-slideUp backdrop-blur-md bg-opacity-95">
          <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
          <p className="text-xs font-black tracking-tight">{reorderedMessage}</p>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-4xl">
        {/* Header Title with premium gradients */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-emerald-950 tracking-tighter bg-gradient-to-r from-emerald-900 to-green-700 bg-clip-text text-transparent">
              Delivery Center
            </h1>
            <p className="text-[12px] text-slate-400 font-medium mt-1">
              Track live shipments, invoices, and reorder from your recent deliveries
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDevMode(!devMode)}
              className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${devMode ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-500'}`}
            >
              Dev Mode: {devMode ? 'All Orders' : 'Paid Only'}
            </button>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-50 to-emerald-100 flex items-center justify-center border border-emerald-200/50">
              <Truck className="h-5 w-5 text-emerald-700" />
            </div>
          </div>
        </div>

        {/* Sticky Filters & Search (Zepto Style) */}
        <div className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md border border-slate-100 rounded-3xl p-3 mb-6 flex flex-col md:flex-row gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID or Product Name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>

          {/* Sticky filter badges */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((filterName) => (
              <button
                key={filterName}
                onClick={() => setSelectedFilter(filterName)}
                className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedFilter === filterName ? 'bg-emerald-950 text-white shadow-md shadow-emerald-950/10' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'}`}
              >
                {filterName === 'SHIPPED' ? 'In Transit' : filterName}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {paginatedOrders.length === 0 ? (
          /* Custom Premium Empty State */
          <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-gradient-to-b from-white to-slate-50/50">
            <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <ShoppingBag className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-black text-emerald-950 tracking-tight">No Shipments Found</h3>
            <p className="text-slate-400 text-xs font-medium max-w-sm mx-auto mt-2 mb-6">
              There are no confirmed or paid orders in this section yet. Make a purchase or toggle Dev Mode above to see pending checkouts.
            </p>
            <Link href="/" className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-lg shadow-emerald-600/10 inline-flex items-center gap-2 transition-all">
              Go To Store <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {paginatedOrders.map(order => {
              const config = getStatusConfig(order.status);
              const items = order.orderItems || order.items || [];
              const isExpanded = expanded === order.id;

              return (
                <div
                  key={order.id}
                  className={`bg-white border border-slate-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.04)] ${isExpanded ? 'ring-2 ring-emerald-500/20' : ''}`}
                >
                  {/* Collapsed Card view */}
                  <div className="p-6">
                    {/* Upper row: Status badge & delivery estimate */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-50 mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      {(() => {
                        const estDateText = getEstimatedDateString(order);
                        if (!estDateText) return null;
                        return (
                          <p className="text-xs font-black text-emerald-950/80 bg-slate-50 px-3 py-1 rounded-lg">
                            {estDateText}
                          </p>
                        );
                      })()}
                    </div>

                    {/* Middle row: Card Details (Thumbnails & Summary info) */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Thumbnail Row */}
                        <div className="flex items-center -space-x-4 overflow-hidden py-1">
                          {items.slice(0, 3).map((item: any, i: number) => (
                            <div
                              key={i}
                              className="h-12 w-12 rounded-xl border-2 border-white bg-slate-50 flex items-center justify-center overflow-hidden shadow-md shrink-0 hover:scale-105 transition-all"
                            >
                              {item.product?.images?.[0] ? (
                                <img src={item.product.images[0]} alt={item.product?.name} className="h-full w-full object-cover" />
                              ) : (
                                <Package className="h-5 w-5 text-slate-300" />
                              )}
                            </div>
                          ))}
                          {items.length > 3 && (
                            <div className="h-12 w-12 rounded-xl border-2 border-white bg-emerald-50 text-emerald-800 text-[10px] font-black flex items-center justify-center shadow-md shrink-0">
                              +{items.length - 3}
                            </div>
                          )}
                        </div>

                        {/* Order info summary */}
                        <div>
                          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Order ID</p>
                          <h4 className="text-sm font-black text-emerald-950 mt-0.5">#{order.id}</h4>
                          <p className="text-xs text-slate-400 font-medium">
                            {items.length} item{items.length > 1 ? 's' : ''} • Paid ₹{order.totalAmount}
                          </p>
                        </div>
                      </div>

                      {/* Dropdown chevron trigger */}
                      <button
                        onClick={() => setExpanded(isExpanded ? null : order.id)}
                        className="self-end md:self-center flex items-center gap-1.5 px-4 py-2 border-2 border-slate-100 hover:border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50/50 transition-all shrink-0"
                      >
                        {isExpanded ? 'Hide Details' : 'Track Order'}
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail view (Timeline progress tracker) */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-gradient-to-b from-white to-slate-50/30 p-6 animate-fadeIn">
                      {/* shipment progress bar */}
                      <div className="mb-5">
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-4">Shipment Progress</p>
                        <div className="relative">
                          {/* Progress Line Background */}
                          <div className="absolute top-4 left-5 right-5 h-1 bg-slate-100 rounded-full" />
                          {/* Progress Line Fill */}
                          <div className={`absolute top-4 left-5 h-1 rounded-full transition-all duration-500 ${config.progress}`} />

                          {/* Steps */}
                          <div className="relative flex justify-between">
                            {[
                              { label: 'Confirmed', desc: 'Order received', icon: Calendar, activeStep: 1 },
                              { label: 'Packing', desc: 'In progress', icon: Package, activeStep: 1 },
                              { label: 'In Transit', desc: 'Out for delivery', icon: Truck, activeStep: 2 },
                              { label: 'Delivered', desc: 'Success', icon: CheckCircle2, activeStep: 3 }
                            ].map((step, i) => {
                              const StepIcon = step.icon;
                              const isCompleted = config.step >= step.activeStep;
                              const isCurrent = config.step === step.activeStep - 1;

                              return (
                                <div key={i} className="flex flex-col items-center max-w-[80px] text-center">
                                  <div className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all shadow-md ${isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : isCurrent ? 'bg-amber-500 border-amber-500 text-white animate-pulse' : 'bg-white border-slate-200 text-slate-300'}`}>
                                    <StepIcon className="h-4 w-4" />
                                  </div>
                                  <p className={`text-[9px] font-black uppercase tracking-widest mt-2 ${isCompleted ? 'text-emerald-800' : 'text-slate-300'}`}>{step.label}</p>
                                  <p className="text-[8px] text-slate-400 font-bold mt-0.5">{step.desc}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Product list details */}
                      <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 mb-3">
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Itemized Bill</p>
                        <div className="flex flex-col gap-4">
                          {items.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-100 bg-white flex items-center justify-center shrink-0">
                                  {item.product?.images?.[0] ? (
                                    <img src={item.product.images[0]} alt={item.product?.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <Package className="h-5 w-5 text-slate-300" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs font-black text-emerald-950 truncate max-w-[200px] md:max-w-xs">{item.product?.name || item.name}</p>
                                  <p className="text-[10px] text-slate-400 font-medium">{item.variant || 'Standard'} x {item.quantity}</p>
                                </div>
                              </div>
                              <span className="text-xs font-black text-slate-800 shrink-0">₹{Number(item.price || item.unitPrice || 0) * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Address & Invoice info */}
                      {order.shippingAddress && (
                        <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 mb-3 flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Delivery Address</p>
                            <p className="text-xs font-bold text-slate-700 mt-1">
                              {order.shippingAddress.recipientName || 'Customer'} ({order.shippingAddress.phone})
                            </p>
                            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                              {order.shippingAddress.line1}
                              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
                              , {order.shippingAddress.city}, {order.shippingAddress.pincode}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tracking Info — shown when shipment data exists */}
                      {order.shipment && (order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                        <div className="bg-blue-50/60 rounded-2xl border border-blue-100 p-4 mb-3">
                          <p className="text-[10px] uppercase font-black tracking-widest text-blue-400 mb-3">Shipment Tracking</p>
                          <div className="flex flex-col gap-2">
                            {order.shipment.carrierName && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-400 font-bold w-24">Courier</span>
                                <span className="font-black text-slate-700">{order.shipment.carrierName}</span>
                              </div>
                            )}
                            {order.shipment.trackingNumber && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-slate-400 font-bold w-24">Tracking No.</span>
                                <span className="font-black text-slate-800 font-mono bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                                  {order.shipment.trackingNumber}
                                </span>
                              </div>
                            )}
                            {order.shipment.trackingUrl && (
                              <a
                                href={order.shipment.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all w-fit shadow-sm shadow-blue-600/20"
                              >
                                <Truck className="h-3.5 w-3.5" />
                                Track Package
                                <ArrowRight className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Bottom Action CTAs */}
                      {order.status?.toUpperCase() === 'DELIVERED' && (
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100/60 animate-fadeIn">
                          <button
                            onClick={() => setActiveInvoice(order)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all hover:border-slate-300"
                          >
                            <FileText className="h-4 w-4" /> View Invoice
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all hover:border-slate-300">
                            <Star className="h-4 w-4" /> Rate Items
                          </button>
                          {order.refundStatus ? (
                            <Link
                              href={`/account/refund-requests`}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-300 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                            >
                              <RefreshCcw className="h-4 w-4" /> View Refund Status
                            </Link>
                          ) : (
                            <Link
                              href={`/account/refund-requests/new?orderId=${order.id}`}
                              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:border-orange-300 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                            >
                              <HelpCircle className="h-4 w-4" /> Raise Refund Request
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-white border border-slate-100 px-6 py-4 rounded-2xl shadow-sm">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="flex items-center gap-1 px-4 py-2 border border-slate-200 text-slate-500 hover:text-emerald-800 disabled:opacity-40 disabled:hover:text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:bg-transparent transition-all"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`h-9 w-9 rounded-xl text-xs font-black transition-all ${currentPage === page ? 'bg-emerald-950 text-white shadow-md shadow-emerald-950/10' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="flex items-center gap-1 px-4 py-2 border border-slate-200 text-slate-500 hover:text-emerald-800 disabled:opacity-40 disabled:hover:text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:bg-transparent transition-all"
                >
                  Next <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invoice modal renderer */}
      {activeInvoice && (
        <InvoiceModal
          order={activeInvoice}
          onClose={() => setActiveInvoice(null)}
        />
      )}
    </div>
  );
}
