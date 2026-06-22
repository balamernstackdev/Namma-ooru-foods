'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import Link from 'next/link';
import { 
  Landmark, 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Phone, 
  Mail, 
  TrendingUp, 
  FileText, 
  ShoppingBag,
  CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';

const fetcher = (url: string) => {
  const token = localStorage.getItem('token');
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());
};

export default function PayoutDetailClient({ id }: { id: string }) {
  // Modal settlement state
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [utrNumber, setUtrNumber] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSettling, setIsSettling] = useState(false);

  const { 
    data: payout, 
    isLoading, 
    mutate 
  } = useSWR(`${API_URL}/api/vendor/payouts/${id}`, fetcher);

  const getStatusColor = (statusVal: string) => {
    switch (statusVal) {
      case 'SETTLED':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'ON_HOLD':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const handleSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber) {
      toast.error('Please enter a UTR or reference number');
      return;
    }

    setIsSettling(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/vendor/payouts/settle/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethod,
          utrNumber,
          receiptUrl,
          notes: adminNotes,
          settlementDate
        })
      });

      if (!res.ok) throw new Error('Settlement processing failed');
      toast.success('Payout settled successfully!');
      setIsSettleModalOpen(false);
      mutate();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error processing settlement');
    } finally {
      setIsSettling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!payout) {
    return (
      <div className="max-w-[1400px] mx-auto text-center py-20">
        <AlertCircle className="h-16 w-16 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">Payout Record Not Found</h3>
        <Link href="/admin/vendor-payouts" className="mt-4 inline-flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-xs">
          <ArrowLeft size={16} /> Back to payouts listing
        </Link>
      </div>
    );
  }

  const primaryMethod = payout.subVendor?.payoutMethods?.find((m: any) => m.isPrimary) || payout.subVendor?.payoutMethods?.[0];

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-16">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/vendor-payouts"
            className="h-11 w-11 rounded-2xl border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-100 flex items-center justify-center transition-colors bg-white shadow-sm"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payout ID #PAY-{payout.id}</h1>
              <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(payout.status)}`}>
                {payout.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 font-bold uppercase tracking-widest">
              Generated: {new Date(payout.createdAt).toLocaleDateString()} • Week Ending {payout.payoutWeekEnd ? new Date(payout.payoutWeekEnd).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {(payout.status === 'PENDING' || payout.status === 'PROCESSING') && (
          <button
            onClick={() => setIsSettleModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <CreditCard size={15} />
            Settle Payout
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* VENDOR DETAILS & BANK INFO */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
            <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="text-emerald-600" size={16} />
              Vendor Profile Info
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor Store Name</span>
                <p className="text-sm font-black text-slate-900">{payout.subVendor?.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commission Rate</span>
                <p className="text-sm font-black text-emerald-600">{payout.subVendor?.commissionRate}%</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Support Contact</span>
                <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone size={13} className="text-slate-400" />
                  {payout.subVendor?.owner?.phone || 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Support Email</span>
                <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail size={13} className="text-slate-400" />
                  {payout.subVendor?.owner?.email || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
            <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
              <Landmark className="text-indigo-600" size={16} />
              Vendor Settlement Accounts
            </h3>

            {primaryMethod ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Type</span>
                  <p className="text-xs font-black uppercase text-indigo-600 tracking-wider">{primaryMethod.type}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Holder Name</span>
                  <p className="text-sm font-black text-slate-900">{primaryMethod.accountHolderName || payout.subVendor?.name}</p>
                </div>

                {primaryMethod.type === 'BANK' ? (
                  <>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Name</span>
                      <p className="text-sm font-bold text-slate-800">{primaryMethod.bankName}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Number</span>
                      <p className="text-sm font-mono font-bold text-slate-900">{primaryMethod.accountNumber}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">IFSC Code</span>
                      <p className="text-sm font-mono font-bold text-slate-900">{primaryMethod.ifscCode}</p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UPI ID</span>
                    <p className="text-sm font-mono font-bold text-slate-900">{primaryMethod.upiId}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center">
                <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No primary settlement method configured by vendor</p>
              </div>
            )}
          </div>
        </div>

        {/* EARNINGS BREAKDOWN */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
            <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
              <TrendingUp className="text-emerald-600" size={16} />
              Earnings Breakdown
            </h3>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Gross Revenue:</span>
                <span className="font-bold text-slate-800">₹{Number(payout.grossAmount).toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Coupon Discount Deducts:</span>
                <span className="font-bold text-rose-500">-₹{Number(payout.couponAmount || 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Refund Deducts:</span>
                <span className="font-bold text-rose-500">-₹{Number(payout.refundAmount || 0).toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Platform Commission:</span>
                <span className="font-bold text-rose-500">-₹{Number(payout.commission).toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Shipping Adjusts:</span>
                <span className="font-bold text-emerald-600">+₹{Number(payout.shippingAdjustment || 0).toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Net Settled Amount:</span>
                <span className="text-xl font-black text-emerald-600">₹{Number(payout.payableAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* SETTLEMENT DETAILS IF SETTLED */}
          {payout.status === 'SETTLED' && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-[2rem] p-8 space-y-4">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-950 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Settlement Confirmed
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-emerald-800/70">Settled On:</span>
                  <span className="font-bold text-emerald-950">{payout.payoutDate ? new Date(payout.payoutDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-emerald-800/70">Reference / UTR:</span>
                  <span className="font-mono font-bold text-emerald-950">{payout.transactionRef || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-emerald-800/70">Payment Channel:</span>
                  <span className="font-bold text-emerald-950 uppercase">{payout.paymentReference || 'N/A'}</span>
                </div>
                {payout.receiptUrl && (
                  <div className="pt-2">
                    <a
                      href={payout.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:text-emerald-900 hover:underline"
                    >
                      <FileText size={12} />
                      View Receipt Screenshot
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ORDERS LIST TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-8 space-y-6">
        <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 flex items-center gap-2">
          <ShoppingBag className="text-emerald-600" size={16} />
          Included Orders ({payout.payoutOrders?.length || 0})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px] admin-data-table">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20">
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Purchased Date</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Delivery Status</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Commission Charged</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Refund Deduct</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right font-black">Vendor Earning</th>
              </tr>
            </thead>
            <tbody>
              {payout.payoutOrders?.map((po: any) => (
                <tr key={po.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-xs font-black text-slate-800">#ORD-{po.order?.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-xs font-bold text-slate-700">{po.order?.user?.name || 'N/A'}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-xs text-slate-500 font-semibold">{po.order?.createdAt ? new Date(po.order.createdAt).toLocaleDateString() : 'N/A'}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${po.order?.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {po.order?.status || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right text-rose-500 font-semibold text-xs">
                    -₹{Number(po.commission).toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-right text-rose-500 font-semibold text-xs">
                    -₹{Number(po.refundAdjustment || 0).toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-right text-emerald-600 font-black text-xs">
                    ₹{Number(po.vendorEarning).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SETTLEMENT MODAL */}
      {isSettleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsSettleModalOpen(false)}></div>
          
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl z-10 w-full max-w-xl overflow-hidden p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Record Settlement</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Payout ID: #PAY-{id} • {payout.subVendor?.name}</p>
              </div>
              <button 
                onClick={() => setIsSettleModalOpen(false)}
                className="h-9 w-9 rounded-full bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-4">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex justify-between items-center">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Total Settlement Amount:</span>
                <span className="text-2xl font-black text-emerald-700">₹{Number(payout.payableAmount).toFixed(2)}</span>
              </div>

              {/* Payment Method */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-semibold text-slate-700 text-sm bg-slate-50/50"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="UPI">UPI</option>
                  <option value="CASH">Cash</option>
                </select>
              </div>

              {/* UTR / Reference */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">UTR / Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g. UTR1234567890"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-semibold text-slate-700 text-sm"
                  required
                />
              </div>

              {/* Receipt / Screenshot URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Receipt Image Link / S3 URL</label>
                <input
                  type="text"
                  placeholder="https://s3-receipts..."
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  className="h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-semibold text-slate-700 text-sm"
                />
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Notes</label>
                <textarea
                  placeholder="Add any internal reference or notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="h-20 p-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-semibold text-slate-700 text-sm resize-none"
                />
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Settlement Date</label>
                <input
                  type="date"
                  value={settlementDate}
                  onChange={(e) => setSettlementDate(e.target.value)}
                  className="h-12 px-4 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 font-semibold text-slate-700 text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSettling}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all mt-4 flex items-center justify-center"
              >
                {isSettling ? 'Processing Settlement...' : 'Record Settlement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
