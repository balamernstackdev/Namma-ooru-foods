'use client';

import { useEffect, useState } from 'react';
import { Truck, Package, MapPin, CheckCircle, Clock, ChevronLeft, ExternalLink } from 'lucide-react';
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

const STATUS_STEPS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function TrackingPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/orders?userId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        if (data.length > 0) setSelectedOrderId(data[0].id);
      })
      .catch(console.error);
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

  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const currentStep = selectedOrder ? STATUS_STEPS.indexOf(selectedOrder.status) : 0;

  return (
    <div className="py-2 px-0 md:px-4">
      <Link href="/account" className="md:hidden flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-6 bg-emerald-50 w-fit px-4 py-2 rounded-full">
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-emerald-950 tracking-tighter">Track Orders</h1>
          <p className="text-[12px] text-slate-400 font-medium mt-1">Real-time shipment visibility</p>
        </div>
        <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
          <Truck className="h-6 w-6 text-emerald-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order List */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          {orders.map(order => (
            <button
              key={order.id}
              id={`track-order-${order.id}`}
              onClick={() => setSelectedOrderId(order.id)}
              className={`text-left rounded-2xl border-2 p-5 transition-all ${selectedOrderId === order.id ? 'border-emerald-600 bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Order #{order.id}</p>
              <p className="font-black text-emerald-950 text-sm mt-1">₹{Number(order.totalAmount).toLocaleString()}</p>
              <span className={`inline-block mt-2 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                'bg-amber-100 text-amber-700'
              }`}>{order.status}</span>
            </button>
          ))}
          {orders.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <Package className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm font-black text-slate-300">No orders yet</p>
            </div>
          )}
        </div>

        {/* Tracking Detail */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Order #{selectedOrder.id}</p>
                  <p className="text-2xl font-black text-emerald-950 tracking-tight mt-1">₹{Number(selectedOrder.totalAmount).toLocaleString()}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                {tracking?.trackingUrl && (
                  <a href={tracking.trackingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-100 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">
                    Track on Carrier <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              {/* Progress Timeline */}
              <div className="mb-8">
                <div className="flex items-center gap-0">
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all ${i <= currentStep ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                          {i <= currentStep ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                        </div>
                        <p className={`text-[9px] font-black uppercase tracking-widest mt-2 ${i <= currentStep ? 'text-emerald-700' : 'text-slate-300'}`}>{step}</p>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all ${i < currentStep ? 'bg-emerald-600' : 'bg-slate-100'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Carrier Info */}
              {trackLoading ? (
                <div className="text-center py-8"><div className="h-8 w-8 border-2 border-slate-100 border-t-emerald-500 rounded-full animate-spin mx-auto" /></div>
              ) : tracking ? (
                <div className="bg-slate-50 rounded-2xl p-6 flex flex-col gap-3">
                  <h3 className="text-sm font-black text-emerald-950 uppercase tracking-widest mb-2">Shipment Details</h3>
                  {tracking.carrierName && (
                    <div className="flex items-center gap-3">
                      <Truck className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Carrier</p>
                        <p className="text-sm font-black text-emerald-950">{tracking.carrierName}</p>
                      </div>
                    </div>
                  )}
                  {tracking.trackingNumber && (
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Tracking Number</p>
                        <p className="text-sm font-black text-emerald-950 font-mono">{tracking.trackingNumber}</p>
                      </div>
                    </div>
                  )}
                  {tracking.estimatedDelivery && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Estimated Delivery</p>
                        <p className="text-sm font-black text-emerald-950">{new Date(tracking.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-6 text-center">
                  <Truck className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm font-black text-slate-300">Tracking info will appear once your order is shipped.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-12 text-center h-full flex items-center justify-center">
              <div>
                <Truck className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="font-black text-slate-300">Select an order to track</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
