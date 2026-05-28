'use client';

import { useState, useEffect } from 'react';
import { Truck, Save, Package, CheckCircle, ExternalLink } from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import AdminPagination from '@/components/admin/AdminPagination';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminTrackingPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, mutate } = useSWR(`${API_URL}/api/orders?page=${currentPage}&limit=10`, fetcher);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [form, setForm] = useState({ carrierName: '', trackingNumber: '', trackingUrl: '', estimatedDelivery: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'>('ALL');

  const { orders = [], totalPages = 1 } = data || {};

  const shippableOrders = orders.filter((o: any) => ['PROCESSING', 'PENDING', 'SHIPPED', 'DELIVERED'].includes(o.status));
  const filtered = shippableOrders.filter((o: any) => {
    if (activeTab === 'PROCESSING' && o.status !== 'PROCESSING') return false;
    if (activeTab === 'SHIPPED' && o.status !== 'SHIPPED') return false;
    if (activeTab === 'DELIVERED' && o.status !== 'DELIVERED') return false;
    return String(o.id).includes(searchTerm) || o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    if (!selectedOrderId) return;
    fetch(`${API_URL}/api/tracking/${selectedOrderId}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setForm({
            carrierName: data.carrierName || '',
            trackingNumber: data.trackingNumber || '',
            trackingUrl: data.trackingUrl || '',
            estimatedDelivery: data.estimatedDelivery ? data.estimatedDelivery.slice(0, 16) : ''
          });
        } else {
          setForm({ carrierName: '', trackingNumber: '', trackingUrl: '', estimatedDelivery: '' });
        }
      }).catch(() => setForm({ carrierName: '', trackingNumber: '', trackingUrl: '', estimatedDelivery: '' }));
  }, [selectedOrderId]);

  const [markingDelivered, setMarkingDelivered] = useState(false);

  const handleMarkDelivered = async () => {
    if (!selectedOrderId) return;
    setMarkingDelivered(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/${selectedOrderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DELIVERED' })
      });
      if (res.ok) {
        mutate();
      }
    } catch (error) {
      console.error('Failed to mark delivered:', error);
    } finally {
      setMarkingDelivered(false);
    }
  };

  const handleSave = async () => {
    if (!selectedOrderId) return;
    setSaving(true); setSaved(false);
    try {
      await fetch(`${API_URL}/api/tracking/${selectedOrderId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      setSaved(true);
      mutate();
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  const selectedOrder = orders.find((o: any) => o.id === selectedOrderId);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-4xl font-black text-[var(--admin-sidebar)] tracking-tighter">Shipment Management</h2>
        <p className="text-slate-400 font-medium text-sm mt-1">Assign carrier tracking details to orders and update shipment status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-100 px-5 py-3 flex items-center gap-3 shadow-sm">
            <Package className="h-4 w-4 text-slate-300" />
            <input type="text" placeholder="Search order ID or customer..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 text-sm font-bold outline-none text-[var(--admin-sidebar)] placeholder:text-slate-300 bg-transparent" />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'PROCESSING', label: 'Processing' },
              { id: 'SHIPPED', label: 'Shipped' },
              { id: 'DELIVERED', label: 'Delivered' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedOrderId(null);
                }}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap border
                  ${activeTab === tab.id 
                    ? 'bg-[var(--admin-sidebar)] text-white border-[var(--admin-sidebar)] shadow-md shadow-slate-900/10' 
                    : 'bg-white text-slate-400 border-slate-100 hover:text-slate-600 hover:border-slate-200'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading && <div className="text-center py-12"><div className="h-8 w-8 border-2 border-slate-100 border-t-[var(--admin-accent)] rounded-full animate-spin mx-auto" /></div>}
          {filtered.map((order: any) => (
            <button key={order.id} id={`admin-track-order-${order.id}`} onClick={() => setSelectedOrderId(order.id)}
              className={`w-full text-left rounded-2xl border-2 p-5 transition-all ${selectedOrderId === order.id ? 'border-[var(--admin-accent)] bg-amber-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Order #{order.id}</p>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg 
                  ${order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : 
                    order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : 
                    'bg-amber-100 text-amber-700'}`}>
                  {order.status}
                </span>
              </div>
              <p className="font-black text-[var(--admin-sidebar)] text-sm mt-1">{order.user?.name || 'Customer'}</p>
              <p className="text-xs text-slate-400 font-medium">₹{Number(order.totalAmount).toLocaleString()}</p>
            </button>
          ))}
          {!isLoading && filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-300 font-bold text-sm">No orders available for tracking</div>
          )}
          <div className="pt-4">
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* Tracking Form */}
        <div className="lg:col-span-2">
          {selectedOrder ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-black text-[var(--admin-sidebar)] text-lg">Order #{selectedOrder.id} — Shipment Details</h3>
                  <p className="text-xs text-slate-400 font-medium">{selectedOrder.user?.name} · ₹{Number(selectedOrder.totalAmount).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                {[
                  { label: 'Carrier Name', key: 'carrierName', placeholder: 'Delhivery, Shiprocket, DTDC...' },
                  { label: 'Tracking Number', key: 'trackingNumber', placeholder: 'DL1234567890IN' },
                  { label: 'Tracking URL', key: 'trackingUrl', placeholder: 'https://www.delhivery.com/track...' },
                  { label: 'Estimated Delivery', key: 'estimatedDelivery', type: 'datetime-local' },
                ].map(field => (
                  <div key={field.key} className={field.key === 'trackingUrl' ? 'sm:col-span-2' : ''}>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">{field.label}</label>
                    <input type={field.type || 'text'} value={(form as any)[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-sm text-[var(--admin-sidebar)] outline-none focus:border-[var(--admin-accent)] transition-all" />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button id="save-tracking-btn" onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[var(--admin-sidebar)] text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50">
                  {saved ? <><CheckCircle className="h-4 w-4 text-emerald-400" /> Saved!</> : saving ? 'Saving...' : <><Save className="h-4 w-4" /> Save & Mark Shipped</>}
                </button>
                {selectedOrder.status !== 'DELIVERED' && (
                  <button id="mark-delivered-btn" onClick={handleMarkDelivered} disabled={markingDelivered}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50">
                    {markingDelivered ? 'Updating...' : <><CheckCircle className="h-4 w-4" /> Mark Delivered</>}
                  </button>
                )}
                {form.trackingUrl && (
                  <a href={form.trackingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
                    Preview Link <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-12 text-center h-full min-h-[400px] flex items-center justify-center">
              <div>
                <Truck className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="font-black text-slate-300">Select an order from the list to assign tracking details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
