'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Truck, CheckCircle2, RotateCcw, XCircle, ShoppingBag, CreditCard, Mail, Phone, MapPin, ShieldAlert } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { usePlatformSettings } from '@/context/PlatformSettingsContext';

interface OrderDetailClientProps {
  id: string;
}

const formatTxTime = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const hoursStr = String(hours).padStart(2, '0');
  return `${day} ${month} ${year} ${hoursStr}:${minutes} ${ampm}`;
};

export default function OrderDetailClient({ id }: OrderDetailClientProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const { settings } = usePlatformSettings();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);
        const token = localStorage.getItem('namma_orru_token');
        const res = await fetch(`${API_URL}/api/orders/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to fetch order');
        }
        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (status: string) => {
    try {
      setUpdating(true);
      const res = await fetch(`${API_URL}/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('namma_orru_token')}`
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        addToast('Success', `Order status updated to ${status}`);
        const updated = await res.json();
        setOrder((prev: any) => ({ ...prev, status: updated.status }));
      } else {
        addToast('Error', 'Failed to update order status');
      }
    } catch (e) {
      console.error(e);
      addToast('Error', 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-white gap-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="h-10 w-10 border-4 border-emerald-950 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#022c22]">Retrieving Order details...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm animate-in fade-in duration-500">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 mb-6">
          <ShieldAlert size={36} strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase">Order Not Found</h3>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 max-w-sm leading-relaxed">
          The requested order may have been deleted or no longer exists.
        </p>
        <button
          onClick={() => router.push('/admin/notifications')}
          className="mt-8 h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 cursor-pointer border-none"
        >
          <ArrowLeft size={14} />
          Back to Notifications
        </button>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-6">
          <ShieldAlert size={36} strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase">Fetch Error</h3>
        <p className="text-slate-500 font-bold text-xs mt-2 max-w-sm">
          {error || 'Unable to load order details at this moment.'}
        </p>
        <button
          onClick={() => router.push('/admin/notifications')}
          className="mt-8 h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 cursor-pointer border-none"
        >
          Back to Notifications
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <button
            onClick={() => router.push('/admin/notifications')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors mb-3 bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft size={12} /> Back to Notifications
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
            Order <span className="text-emerald-600">#ORD-{order.id.toString().padStart(4, '0')}</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            Placed on {new Date(order.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border ${
            order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
            order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
            order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-100' :
            'bg-amber-50 text-amber-700 border-amber-100'
          }`}>
            Status: {order.status}
          </span>

          <div className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-xl p-1 shadow-sm">
            <button
              disabled={updating || order.status === 'SHIPPED'}
              onClick={() => handleStatusChange('SHIPPED')}
              className="px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer border-none"
            >
              Ship
            </button>
            <button
              disabled={updating || order.status === 'DELIVERED'}
              onClick={() => handleStatusChange('DELIVERED')}
              className="px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-emerald-700 hover:bg-emerald-50/50 disabled:opacity-50 transition-colors cursor-pointer border-none"
            >
              Deliver
            </button>
            <button
              disabled={updating || order.status === 'CANCELLED'}
              onClick={() => handleStatusChange('CANCELLED')}
              className="px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-red-700 hover:bg-red-50/50 disabled:opacity-50 transition-colors cursor-pointer border-none"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Order details & Items */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <ShoppingBag className="text-emerald-600" size={18} />
              Ordered Items
            </h3>
            
            <div className="divide-y divide-slate-100">
              {order.items?.map((item: any) => {
                const vendorName = item.product?.subVendor?.name || 'Namma Ooru Originals';
                return (
                  <div key={item.id} className="py-4 flex items-center gap-4 group">
                    <div className="h-16 w-16 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shrink-0">
                      <img src={item.product?.image || settings?.logo || '/logo.webp'} className="h-full w-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 leading-tight truncate">{item.product?.name}</p>
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mt-1 block">Brand: {vendorName}</span>
                      {item.variantName && (
                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">Variant: {item.variantName}</span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-slate-900">₹{Number(item.unitPrice).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0 min-w-[70px]">
                      <p className="text-sm font-black text-emerald-600">₹{Number(item.totalPrice).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transaction History & Details */}
          {order.transactions && order.transactions.length > 0 && (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <CreditCard className="text-emerald-600" size={18} />
                Transaction logs
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50/50 border border-slate-100 rounded-2xl p-6">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Transaction ID</span>
                  <span className="font-extrabold text-slate-800 text-sm mt-1 block">{order.transactions[0].providerRef || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Payment Method</span>
                  <span className="font-extrabold text-slate-800 text-sm mt-1 block">{order.transactions[0].method || order.paymentMethod || 'Online Payment'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Payment Gateway</span>
                  <span className="font-extrabold text-slate-800 text-sm mt-1 block">{order.transactions[0].gateway || 'HDFC SmartGateway'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Payment Status</span>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase mt-1 ${
                    order.transactions[0].status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' :
                    order.transactions[0].status === 'FAILED' ? 'bg-rose-50 text-rose-700' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {order.transactions[0].status === 'SUCCESS' ? 'Success' :
                     order.transactions[0].status === 'FAILED' ? 'Failed' :
                     'Pending'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Bank Reference</span>
                  <span className="font-extrabold text-slate-800 text-sm mt-1 block">
                    {order.transactions[0].bankReference && order.transactions[0].bankReference !== 'N/A'
                      ? order.transactions[0].bankReference
                      : 'Not Available from Gateway'}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Transaction Time</span>
                  <span className="font-extrabold text-slate-800 text-sm mt-1 block">{formatTxTime(order.transactions[0].createdAt)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Customer info & Summary */}
        <div className="space-y-8">
          {/* Customer profile */}
          <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Customer Profile</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center font-black text-xs">
                  {order.user?.name?.[0] || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-950 truncate leading-snug">{order.user?.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Customer ID: #{order.userId}</p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-300 shrink-0" />
                  <span className="truncate">{order.user?.email}</span>
                </div>
                {order.user?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-300 shrink-0" />
                    <span>{order.user?.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <MapPin className="text-emerald-600" size={18} />
                Shipping Address
              </h3>
              
              <div className="text-xs font-semibold text-slate-600 leading-relaxed space-y-1">
                <p className="font-extrabold text-slate-800">{order.shippingAddress.name}</p>
                {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                <p>{order.shippingAddress.country || 'India'}</p>
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Financial Summary</h3>
            
            <div className="space-y-3 font-semibold text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span>Items Subtotal</span>
                <span className="text-slate-800 font-black">₹{Number(order.totalAmount - order.shippingFees + (order.discountAmount || 0) - (order.gstAmount || 0)).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>GST Charges</span>
                <span className="text-slate-800 font-black">₹{Number(order.gstAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery fees</span>
                <span className="text-slate-800 font-black">₹{Number(order.shippingFees || 0).toLocaleString()}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex items-center justify-between text-rose-600">
                  <span>Discounts Applied</span>
                  <span className="font-black">-₹{Number(order.discountAmount).toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-sm font-black text-slate-900">
                <span className="uppercase tracking-tight text-[11px] text-slate-400">Total Revenue</span>
                <span className="text-lg text-emerald-600 tracking-tighter">₹{Number(order.totalAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
