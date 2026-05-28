'use client';

import React, { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { RefreshCcw, Search, Filter, ShieldCheck, XCircle, ArrowRight, Eye, ChevronDown, CheckCircle2, Clock, Check, Loader2 } from 'lucide-react';

export default function AdminRefundRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  
  // Modal state
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (statusFilter) query.append('status', statusFilter);
      
      const res = await fetch(`${API_URL}/api/refund-requests/admin/all?${query.toString()}`);
      const data = await res.json();
      setRequests(data.requests || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const fetchRequestDetails = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/refund-requests/${id}`);
      const data = await res.json();
      setSelectedRequest(data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!selectedRequest) return;
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/api/refund-requests/admin/${selectedRequest.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNote,
          noteForTimeline: `Status updated to ${newStatus.replace('_', ' ')} by Admin. ${adminNote}`
        })
      });
      if (res.ok) {
        setSelectedRequest(null);
        setAdminNote('');
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW': return <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-md text-[10px] font-black uppercase tracking-widest">Pending</span>;
      case 'UNDER_INVESTIGATION': return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-md text-[10px] font-black uppercase tracking-widest">Investigating</span>;
      case 'APPROVED': return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md text-[10px] font-black uppercase tracking-widest">Approved</span>;
      case 'REJECTED': return <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-md text-[10px] font-black uppercase tracking-widest">Rejected</span>;
      case 'REFUND_PROCESSED': return <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-md text-[10px] font-black uppercase tracking-widest">Processed</span>;
      default: return <span className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-md text-[10px] font-black uppercase tracking-widest">{status}</span>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <RefreshCcw className="h-6 w-6 text-emerald-600" /> Refund Requests
          </h1>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Manage customer complaints, returns, and refund resolutions.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">Filter Status:</span>
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-500 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="UNDER_INVESTIGATION">Under Investigation</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="REFUND_PROCESSED">Refund Processed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-emerald-600 h-8 w-8" /></div>
        ) : requests.length === 0 ? (
          <div className="p-20 text-center text-slate-500 text-sm font-medium">No refund requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Ticket ID</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Customer</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Issue</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => (
                  <tr key={req.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-xs font-black text-slate-700">{req.ticketId}</td>
                    <td className="p-4">
                      <p className="text-xs font-bold text-slate-800">{req.user?.name || 'User'}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{req.user?.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-black text-slate-700">{req.issueType.replace('_', ' ')}</p>
                      <p className="text-[10px] text-slate-500">Order #{req.orderId}</p>
                    </td>
                    <td className="p-4 text-xs font-black text-emerald-600">₹{req.totalAmount}</td>
                    <td className="p-4">{getStatusBadge(req.status)}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => fetchRequestDetails(req.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors"
                      >
                        <Eye className="h-3 w-3" /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-black disabled:opacity-50 text-slate-600">Previous</button>
            <span className="text-xs font-black text-slate-500">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-black disabled:opacity-50 text-slate-600">Next</button>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col md:flex-row">
            
            {/* Left Side: Request Details */}
            <div className="w-full md:w-3/5 p-8 border-r border-slate-100 bg-slate-50/30">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800">Ticket {selectedRequest.ticketId}</h3>
                  <p className="text-xs text-slate-500 mt-1">Created on {new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                </div>
                {getStatusBadge(selectedRequest.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Customer</p>
                  <p className="text-xs font-bold text-slate-800">{selectedRequest.user?.name}</p>
                  <p className="text-[10px] text-slate-500">{selectedRequest.user?.email}</p>
                  <p className="text-[10px] text-slate-500">{selectedRequest.user?.phone}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Issue Type</p>
                  <p className="text-xs font-bold text-slate-800">{selectedRequest.issueType.replace('_', ' ')}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 mb-1">Preference</p>
                  <p className="text-xs font-bold text-emerald-600">{selectedRequest.preference.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Customer Description</p>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-xs text-slate-700 whitespace-pre-wrap">
                  {selectedRequest.description || 'No description provided.'}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Affected Items</p>
                <div className="flex flex-col gap-2">
                  {selectedRequest.items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-slate-50 rounded-lg overflow-hidden shrink-0">
                          {item.orderItem?.product?.images?.[0] && <img src={item.orderItem.product.images[0]} className="h-full w-full object-cover" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.orderItem?.product?.name}</p>
                          <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-600">₹{item.requestedAmount}</span>
                    </div>
                  ))}
                </div>
                <div className="text-right mt-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Requested</span>
                  <p className="text-lg font-black text-emerald-700">₹{selectedRequest.totalAmount}</p>
                </div>
              </div>
            </div>

            {/* Right Side: Resolution Action */}
            <div className="w-full md:w-2/5 p-8 flex flex-col bg-white relative">
              <button onClick={() => setSelectedRequest(null)} className="absolute top-4 right-4 h-8 w-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                <XCircle className="h-5 w-5 text-slate-500" />
              </button>
              
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Resolution Panel</h4>
              
              <div className="flex-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Admin Internal Note</label>
                <textarea 
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Enter reason for approval/rejection or internal notes..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-700 outline-none focus:border-emerald-500 h-32 resize-none mb-6"
                />

                <div className="flex flex-col gap-3">
                  <button onClick={() => updateStatus('UNDER_INVESTIGATION')} disabled={updating || selectedRequest.status === 'UNDER_INVESTIGATION'} className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors border border-blue-200 disabled:opacity-50">
                    Mark as Investigating
                  </button>
                  <button onClick={() => updateStatus('APPROVED')} disabled={updating || selectedRequest.status === 'APPROVED'} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50">
                    Approve Refund
                  </button>
                  <button onClick={() => updateStatus('REFUND_PROCESSED')} disabled={updating || selectedRequest.status === 'REFUND_PROCESSED'} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50">
                    Mark as Processed
                  </button>
                  <button onClick={() => updateStatus('REJECTED')} disabled={updating || selectedRequest.status === 'REJECTED'} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors border border-red-200 mt-4 disabled:opacity-50">
                    Reject Request
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
