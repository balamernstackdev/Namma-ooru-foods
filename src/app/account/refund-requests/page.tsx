'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';
import Link from 'next/link';
import { RefreshCcw, Package, ChevronRight, Clock, ShieldCheck, HelpCircle, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { format } from 'date-fns';

export default function RefundRequestsDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDetail, setActiveDetail] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const fetchRequests = async () => {
      try {
        const res = await fetch(`${API_URL}/api/refund-requests/customer?userId=${user.id}`);
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch refund requests', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW': return <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><Clock className="h-3 w-3" /> Under Review</span>;
      case 'APPROVED': return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Approved</span>;
      case 'REFUND_PROCESSED': return <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Refunded</span>;
      case 'REJECTED': return <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-[9px] font-black uppercase tracking-widest">Rejected</span>;
      default: return <span className="px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-full text-[9px] font-black uppercase tracking-widest">{status.replace('_', ' ')}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <RefreshCcw className="h-8 w-8 text-emerald-600 animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900/50">Loading Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-emerald-950 tracking-tighter bg-gradient-to-r from-emerald-900 to-green-700 bg-clip-text text-transparent">
            Refunds & Issues
          </h1>
          <p className="text-[12px] text-slate-400 font-medium mt-1">
            Track your return requests, refunds, and support tickets
          </p>
        </div>
        <div className="h-12 w-12 rounded-[1rem] bg-gradient-to-tr from-orange-50 to-orange-100 flex items-center justify-center border border-orange-200/50 shadow-sm shadow-orange-500/10">
          <HelpCircle className="h-5 w-5 text-orange-600" />
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-gradient-to-b from-white to-slate-50/50">
          <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <RefreshCcw className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-black text-emerald-950 tracking-tight">No Active Requests</h3>
          <p className="text-slate-400 text-xs font-medium max-w-sm mx-auto mt-2 mb-6">
            You haven't raised any issues for your recent orders. If you need help with a delivered item, you can raise a request from your Orders page.
          </p>
          <Link href="/account/orders" className="px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-lg shadow-emerald-600/10 inline-flex items-center gap-2 transition-all">
            View My Orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map(req => {
            const itemCount = req.items?.length || 0;
            const firstItemImage = req.items?.[0]?.orderItem?.product?.images?.[0];
            return (
              <div key={req.id} className="bg-white border border-slate-100 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-xl hover:shadow-emerald-900/5 transition-all overflow-hidden flex flex-col">
                <div className="p-6 pb-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ticket ID</span>
                    <span className="text-sm font-black text-emerald-950 font-mono bg-white px-2 py-0.5 rounded-lg border border-slate-100 w-fit">{req.ticketId}</span>
                  </div>
                  {getStatusBadge(req.status)}
                </div>
                
                <div className="p-6 flex-1 flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl border-2 border-white bg-slate-50 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                        {firstItemImage ? (
                          <img src={firstItemImage} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-6 w-6 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 tracking-tight">{req.issueType.replace('_', ' ')}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Order #{req.orderId} • {itemCount} item{itemCount > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Requested</span>
                      <span className="text-sm font-black text-emerald-600">₹{req.totalAmount}</span>
                    </div>
                  </div>

                  {req.timelineLogs && req.timelineLogs.length > 0 && (
                    <div className="bg-slate-50 rounded-2xl p-4 mt-auto">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Latest Update</p>
                      <p className="text-xs text-slate-600 font-medium">"{req.timelineLogs[0].note}"</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-2 text-right">{format(new Date(req.timelineLogs[0].createdAt), 'MMM dd, h:mm a')}</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <button 
                    onClick={() => setActiveDetail(req)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-black uppercase tracking-widest text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    View Full Details <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      {activeDetail && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ticket ID</p>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-mono font-black text-emerald-950">{activeDetail.ticketId}</h3>
                  {getStatusBadge(activeDetail.status)}
                </div>
              </div>
              <button 
                onClick={() => setActiveDetail(null)}
                className="h-10 w-10 rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 flex items-center justify-center transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Summary Block */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Issue Type</p>
                  <p className="text-sm font-bold text-slate-800">{activeDetail.issueType.replace('_', ' ')}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Resolution Preference</p>
                  <p className="text-sm font-bold text-slate-800">{activeDetail.preference.replace('_', ' ')}</p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 col-span-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Customer Description</p>
                  <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap">{activeDetail.description || 'No description provided.'}</p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-emerald-950 mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-emerald-600" /> Affected Items
                </h4>
                <div className="flex flex-col gap-3">
                  {activeDetail.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-white shadow-sm">
                      <div className="h-12 w-12 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                        {item.orderItem?.product?.images?.[0] ? (
                          <img src={item.orderItem.product.images[0]} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 text-slate-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-slate-800">{item.orderItem?.product?.name || 'Unknown Product'}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-700">₹{item.requestedAmount}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center px-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Request Amount</span>
                  <span className="text-lg font-black text-emerald-950">₹{activeDetail.totalAmount}</span>
                </div>
              </div>

            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end">
              <button 
                onClick={() => setActiveDetail(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-black/10"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
