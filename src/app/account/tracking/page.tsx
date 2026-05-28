'use client';

import { useEffect, useState } from 'react';
import { 
  Truck, Package, MapPin, CheckCircle, Clock, ChevronLeft, 
  Search, SlidersHorizontal, Calendar, FileText, RotateCcw, Star, Loader2, ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';

interface TrackingInfo {
  id: number;
  orderId: number;
  carrierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  updatedAt: string;
  order: { status: string; invoiceNumber?: string; createdAt: string };
}

const STATUS_STEPS = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function TrackingPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackLoading, setTrackLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/orders?userId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!selectedOrderId) { setTracking(null); return; }
    setTrackLoading(true);
    fetch(`${API_URL}/api/tracking/${selectedOrderId}`)
      .then(r => r.json())
      .then(data => setTracking(data.error ? null : data))
      .catch(() => setTracking(null))
      .finally(() => setTrackLoading(false));
  }, [selectedOrderId]);

  // Set default selected order when orders list changes
  useEffect(() => {
    // Filter paid/confirmed orders
    const confirmed = orders.filter(o => devMode || o.status !== 'PENDING');
    if (confirmed.length > 0 && !selectedOrderId) {
      setSelectedOrderId(confirmed[0].id);
    }
  }, [orders, devMode, selectedOrderId]);

  const getStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return {
          step: 3,
          progress: 'w-full bg-emerald-600',
          badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-100',
          label: 'Delivered',
          etaText: 'Delivered successfully'
        };
      case 'SHIPPED':
      case 'IN TRANSIT':
        return {
          step: 2,
          progress: 'w-2/3 bg-blue-500',
          badgeColor: 'text-blue-700 bg-blue-50 border-blue-100',
          label: 'In Transit',
          etaText: 'Arriving in 2-3 working days'
        };
      case 'PROCESSING':
        return {
          step: 1,
          progress: 'w-1/3 bg-orange-500',
          badgeColor: 'text-orange-700 bg-orange-50 border-orange-100',
          label: 'Packing',
          etaText: 'Arriving in 45 mins'
        };
      case 'PENDING':
      default:
        return {
          step: 0,
          progress: 'w-0',
          badgeColor: 'text-slate-500 bg-slate-50 border-slate-100',
          label: 'Awaiting Payment',
          etaText: 'Awaiting payment confirmation'
        };
    }
  };

  const getStepLabels = (status: string) => {
    return [
      { label: 'Ordered', desc: 'Received' },
      { label: 'Packing', desc: 'Confirmed' },
      { label: 'Shipped', desc: 'In Transit' },
      { label: 'Delivered', desc: 'Finished' }
    ];
  };

  const getEstimatedDateString = (createdAt: string, status: string) => {
    const date = new Date(createdAt);
    if (status === 'DELIVERED') {
      return `Delivered on ${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
    }
    date.setDate(date.getDate() + 3);
    return `Est. Delivery: ${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
  };

  // Filter logic
  const filteredOrders = orders
    .filter(order => {
      // Hide pending/unpaid orders unless devMode is active
      if (devMode) return true;
      return order.status !== 'PENDING';
    })
    .filter(order => {
      // Search matching
      const idMatches = order.id.toString().includes(searchQuery);
      const itemsText = (order.orderItems || order.items || []).map((i: any) => i.product?.name || i.name || '').join(' ').toLowerCase();
      const queryMatches = itemsText.includes(searchQuery.toLowerCase());
      return idMatches || queryMatches;
    });

  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const selectedConfig = selectedOrder ? getStatusConfig(selectedOrder.status) : null;
  const stepLabels = selectedOrder ? getStepLabels(selectedOrder.status) : [];

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
      {/* Mobile Back Button */}
      <Link href="/account" className="md:hidden flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-6 bg-emerald-50 w-fit px-4 py-2 rounded-full">
        <ChevronLeft className="h-4 w-4" /> Back to Account
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-emerald-950 tracking-tighter bg-gradient-to-r from-emerald-900 to-green-700 bg-clip-text text-transparent">
            Track Deliveries
          </h1>
          <p className="text-[12px] text-slate-400 font-medium mt-1">Real-time status updates and estimated delivery schedules</p>
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Orders Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          {/* Search bar inside sidebar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search order ID or items..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>

          {/* Orders list */}
          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
            {filteredOrders.map(order => {
              const config = getStatusConfig(order.status);
              const isSelected = selectedOrderId === order.id;

              return (
                <button
                  key={order.id}
                  id={`track-order-${order.id}`}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`text-left rounded-2xl border-2 p-5 transition-all duration-200 relative overflow-hidden ${isSelected ? 'border-emerald-600 bg-emerald-50/50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order #{order.id}</p>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${config.badgeColor}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="font-black text-emerald-950 text-base">₹{Number(order.totalAmount).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {getEstimatedDateString(order.createdAt, order.status)}
                  </p>
                </button>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-sm">
                <Package className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-black text-slate-400">No active shipments found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tracking Details Card (Zepto/Blinkit Style) */}
        <div className="lg:col-span-2">
          {selectedOrder && selectedConfig ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-50 mb-8">
                <div>
                  <p className="text-[9px] uppercase font-black tracking-widest text-slate-400">Order Reference</p>
                  <h3 className="text-xl font-black text-emerald-950 mt-0.5">#{selectedOrder.id}</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase font-black tracking-widest text-slate-400">Bill Total</p>
                  <p className="text-xl font-black text-emerald-800">₹{selectedOrder.totalAmount}</p>
                  <span className={`inline-block text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md mt-1 border ${selectedConfig.badgeColor}`}>
                    {selectedConfig.label}
                  </span>
                </div>
              </div>

              {/* Progress Timeline Tracker */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Live Delivery Progress</p>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5 animate-pulse">
                    <Clock className="h-3 w-3" /> {selectedConfig.etaText}
                  </span>
                </div>
                
                <div className="relative pt-2">
                  {/* Progress bar line background */}
                  <div className="absolute top-[22px] left-8 right-8 h-1 bg-slate-100 rounded-full" />
                  {/* Progress bar line fill */}
                  <div className={`absolute top-[22px] left-8 h-1 rounded-full transition-all duration-500 ${selectedConfig.progress}`} />

                  {/* Progress step markers */}
                  <div className="relative flex justify-between">
                    {stepLabels.map((step, i) => {
                      const isCompleted = selectedConfig.step >= i;
                      const isCurrent = selectedConfig.step === i;

                      return (
                        <div key={i} className="flex flex-col items-center max-w-[80px] text-center">
                          <div className={`h-11 w-11 rounded-full flex items-center justify-center border-2 transition-all shadow-md ${isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : isCurrent ? 'bg-amber-500 border-amber-500 text-white animate-pulse' : 'bg-white border-slate-200 text-slate-300'}`}>
                            <CheckCircle className={`h-5 w-5 ${isCompleted ? 'block' : 'hidden'}`} />
                            <Clock className={`h-5 w-5 ${!isCompleted ? 'block' : 'hidden'}`} />
                          </div>
                          <p className={`text-[9px] font-black uppercase tracking-widest mt-2 ${isCompleted ? 'text-emerald-800' : 'text-slate-300'}`}>{step.label}</p>
                          <p className="text-[8px] text-slate-400 font-semibold mt-0.5">{step.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Items Summary list */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 mb-6">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-4">Packaged Products</p>
                <div className="flex flex-col gap-4">
                  {(selectedOrder.orderItems || selectedOrder.items || []).map((item: any, idx: number) => (
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
                          <p className="text-[10px] text-slate-400 font-bold">{item.variant || 'Standard'} x {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-800 shrink-0">₹{Number(item.price || item.unitPrice || 0) * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carrier details */}
              {trackLoading ? (
                <div className="text-center py-6">
                  <div className="h-8 w-8 border-2 border-slate-100 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                </div>
              ) : tracking ? (
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 mb-6 flex flex-col gap-3">
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Carrier Information</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
                    {tracking.carrierName && (
                      <div>
                        <p className="text-[8px] uppercase font-black tracking-widest text-slate-400">Partner</p>
                        <p className="text-xs font-bold text-emerald-950 mt-0.5">{tracking.carrierName}</p>
                      </div>
                    )}
                    {tracking.trackingNumber && (
                      <div>
                        <p className="text-[8px] uppercase font-black tracking-widest text-slate-400">Tracking Reference</p>
                        <p className="text-xs font-mono font-bold text-slate-600 mt-0.5">{tracking.trackingNumber}</p>
                      </div>
                    )}
                    {tracking.trackingUrl && (
                      <div className="flex items-end">
                        <a 
                          href={tracking.trackingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          Open Carrier map <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 mb-6 text-center">
                  <Truck className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-400">Carrier details will be generated once dispatch starts</p>
                </div>
              )}

              {/* Delivery Address */}
              {selectedOrder.shippingAddress && (
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Delivery Destination</p>
                    <p className="text-xs font-bold text-slate-700 mt-1">
                      {selectedOrder.shippingAddress.recipientName || 'Customer'} ({selectedOrder.shippingAddress.phone})
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      {selectedOrder.shippingAddress.line1}
                      {selectedOrder.shippingAddress.line2 ? `, ${selectedOrder.shippingAddress.line2}` : ''}
                      , {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.pincode}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-12 text-center h-full flex items-center justify-center min-h-[300px]">
              <div>
                <Truck className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="font-black text-slate-300">Select an order from the list to track</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ExternalLinkProps {
  className?: string;
  [key: string]: any;
}
function ExternalLink({ className, ...props }: ExternalLinkProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
