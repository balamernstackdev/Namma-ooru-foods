'use client';

import { useEffect, useState } from 'react';
import { RotateCcw, ChevronLeft, AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';

export default function RefundPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/orders?userId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        const eligible = (Array.isArray(data) ? data : []).filter((o: any) =>
          ['DELIVERED', 'SHIPPED'].includes(o.status) && !o.refundStatus
        );
        setOrders(eligible);
      })
      .catch(console.error);
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return setError('Please select an order');
    if (reason.trim().length < 10) return setError('Please provide a reason (at least 10 characters)');
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/refunds/initiate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: selectedOrderId, reason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess('Your refund request has been submitted. We will process it within 5-7 business days.');
      setSelectedOrderId(''); setReason('');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="mx-auto w-full py-12" style={{ maxWidth: '1400px', paddingLeft: '5%', paddingRight: '5%' }}>
      <Link href="/account" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-6 bg-emerald-50 w-fit px-4 py-2 rounded-full">
        <ChevronLeft className="h-4 w-4" /> Back to Account
      </Link>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#022c22] tracking-tighter uppercase">Refund Request</h1>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">We process refunds within 5–7 business days</p>
        </div>
        <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center">
          <RotateCcw className="h-6 w-6 text-rose-500" />
        </div>
      </div>

      <div className="max-w-2xl">
        {success ? (
          <div className="bg-white rounded-[2rem] border border-emerald-100 p-12 text-center shadow-sm">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-emerald-950 mb-2">Request Submitted!</h2>
            <p className="text-slate-500 font-medium text-sm">{success}</p>
            <Link href="/account/orders" className="mt-6 inline-block px-6 py-3 rounded-xl bg-emerald-950 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-800 transition-all">View Orders</Link>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-100 p-10 shadow-sm">
            <div className="flex items-start gap-4 bg-amber-50 rounded-2xl p-5 mb-8">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">Refund Policy</p>
                <p className="text-xs text-amber-800 font-medium">Refunds are accepted within 7 days of delivery. Perishable items must be reported within 24 hours with photographic evidence.</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Select Order *</label>
                {orders.length === 0 ? (
                  <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4 text-slate-400">
                    <Clock className="h-4 w-4" />
                    <p className="text-xs font-bold">No eligible orders found. Refunds are available for delivered orders only.</p>
                  </div>
                ) : (
                  <select id="refund-order-select" value={selectedOrderId} onChange={e => setSelectedOrderId(e.target.value as any)}
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-sm text-[#022c22] outline-none focus:border-amber-400 transition-all">
                    <option value="">-- Select an order --</option>
                    {orders.map(o => <option key={o.id} value={o.id}>Order #{o.id} — ₹{Number(o.totalAmount).toLocaleString()} ({o.status})</option>)}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Reason for Refund *</label>
                <textarea id="refund-reason-input" value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="Please describe the issue..." rows={5}
                  className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-sm text-[#022c22] outline-none focus:border-amber-400 transition-all resize-none" />
              </div>
              {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
              <button id="submit-refund-btn" type="submit" disabled={loading || orders.length === 0}
                className="w-full h-14 rounded-2xl bg-rose-500 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : 'Submit Refund Request'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
