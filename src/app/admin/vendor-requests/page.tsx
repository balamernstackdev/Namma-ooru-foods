'use client';

import React, { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import AdminListToolbar from '@/components/admin/AdminListToolbar';
import { Shield, Users, CheckCircle, FileText, MoreHorizontal, Square, CheckSquare, Eye, Check, X, Trash2, Calendar, AlertCircle } from 'lucide-react';

export default function AdminVendorRequestsPage() {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') || '' : '';
  const { addToast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search, filter, and sorting states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('latest');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Modal details state
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/vendor-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reqId: number, status: string, notes: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API_URL}/api/vendor-requests/${reqId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: status,
          adminNotes: notes
        })
      });
      if (res.ok) {
        addToast('Success', `Registration marked as ${status}`);
        setSelectedRequest(null);
        fetchRequests(); // Refresh list
      } else {
        addToast('Error', 'Failed to update registration status');
      }
    } catch (err) {
      console.error('Failed to update status', err);
      addToast('Error', 'Network error during update');
    } finally {
      setUpdating(false);
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedIds.length === 0) return;
    const confirmMessage = `Are you sure you want to bulk ${action} ${selectedIds.length} selected registration(s)?`;
    if (!confirm(confirmMessage)) return;

    let successCount = 0;
    for (const id of selectedIds) {
      try {
        if (action === 'delete') {
          // Standard delete request
          const res = await fetch(`${API_URL}/api/vendor-requests/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) successCount++;
        } else {
          // Status update
          const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
          const res = await fetch(`${API_URL}/api/vendor-requests/${id}/status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus, adminNotes: 'Bulk updated via admin list action.' })
          });
          if (res.ok) successCount++;
        }
      } catch (err) {
        console.error(`Failed bulk action on request ${id}`, err);
      }
    }

    addToast('Success', `Successfully completed action for ${successCount} registration(s)`);
    setSelectedIds([]);
    fetchRequests();
  };

  const handleExport = (format: 'CSV' | 'EXCEL' | 'PDF') => {
    if (filteredAndSortedRequests.length === 0) {
      addToast('Error', 'No vendor registrations available to export');
      return;
    }
    addToast('Info', `Generating and downloading ${format} archive...`);
    
    setTimeout(() => {
      const headers = ["S.No", "Registration ID", "Store Name", "Owner Email", "Owner Phone", "Status", "Date Requested"];
      
      const rows = filteredAndSortedRequests.map((req: any, index: number) => {
        return [
          index + 1,
          `REG-00${req.id}`,
          `"${(req.name || '').replace(/"/g, '""')}"`,
          `"${(req.email || '').replace(/"/g, '""')}"`,
          `"${(req.phoneNumber || '').replace(/"/g, '""')}"`,
          req.status || 'Pending',
          `"${new Date(req.createdAt).toLocaleDateString('en-IN')}"`
        ];
      });
      
      const csvContent = headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
      
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", `vendor_registrations_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
      
      addToast('Success', 'Vendor registrations exported successfully');
    }, 1000);
  };

  // Helper selectors
  const toggleSelectRow = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAndSortedRequests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAndSortedRequests.map(r => r.id));
    }
  };

  // 1. Search + Filter Logic
  const filteredAndSortedRequests = requests
    .filter(req => {
      // 1. Search Match
      const matchesSearch =
        req.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.mobileNumber?.includes(searchTerm);

      // 2. Status Match
      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === 'latest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortOrder === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortOrder === 'alphabetical') return a.businessName.localeCompare(b.businessName);
      return 0;
    });

  // Calculate Quick Stats
  const statTotal = requests.length;
  const statPending = requests.filter(r => r.status === 'Pending').length;
  const statApproved = requests.filter(r => r.status === 'Approved').length;
  const statReview = requests.filter(r => r.status === 'Under Review').length;

  const quickStats = [
    { label: 'Total Registrations', value: statTotal, gradient: 'from-slate-800 to-slate-900', icon: <FileText size={24} /> },
    { label: 'Pending Approval', value: statPending, gradient: 'from-amber-500 to-amber-600', icon: <AlertCircle size={24} /> },
    { label: 'Approved Sellers', value: statApproved, gradient: 'from-emerald-600 to-emerald-700', icon: <CheckCircle size={24} /> },
    { label: 'Under Review', value: statReview, gradient: 'from-blue-600 to-blue-700', icon: <Shield size={24} /> },
  ];

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-4 text-emerald-950 font-black uppercase tracking-widest text-xs">
        <div className="h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span>Syncing registration logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">Vendor <span className="text-emerald-600">Registrations</span></h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Review, filter, and onboard new farmer registries and vendor profiles.</p>
      </div>

      {/* Advanced Filter Toolbar */}
      <AdminListToolbar
        searchPlaceholder="Search by business, email, contact..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusOptions={[
          { label: 'All Registrations', value: 'ALL' },
          { label: 'Pending', value: 'Pending' },
          { label: 'Approved', value: 'Approved' },
          { label: 'Rejected', value: 'Rejected' },
          { label: 'Under Review', value: 'Under Review' },
        ]}
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
        sortOptions={[
          { label: 'Latest First', value: 'latest' },
          { label: 'Oldest First', value: 'oldest' },
          { label: 'Alphabetical', value: 'alphabetical' },
        ]}
        selectedSort={sortOrder}
        onSortChange={setSortOrder}
        quickStats={quickStats}
        onExportClick={handleExport}
        selectedCount={selectedIds.length}
        onBulkAction={handleBulkAction}
      />

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mt-6">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto min-h-[280px]">
          <table className="w-full text-left border-collapse min-w-[1000px] admin-data-table">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 w-12 border-b border-slate-100 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600 transition-colors">
                    {selectedIds.length === filteredAndSortedRequests.length && filteredAndSortedRequests.length > 0 ? (
                      <CheckSquare size={16} className="text-emerald-600" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Date</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Business Details</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Owner & Contact</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Type</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-bold text-sm">
              {filteredAndSortedRequests.map(req => (
                <tr key={req.id} className="group hover:bg-slate-50/40 transition-colors">
                  <td className="px-6 py-4 text-center border-b border-slate-50">
                    <button onClick={() => toggleSelectRow(req.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      {selectedIds.includes(req.id) ? (
                        <CheckSquare size={16} className="text-emerald-600" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-medium border-b border-slate-50">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 border-b border-slate-50">
                    <p className="font-extrabold text-slate-900 text-sm leading-snug">{req.businessName}</p>
                    <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-wider block mt-0.5">
                      GST: {req.gstNumber || 'No GST Registered'}
                    </span>
                  </td>
                  <td className="px-6 py-4 border-b border-slate-50">
                    <p className="text-slate-800 font-semibold">{req.ownerName}</p>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <span>{req.email}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-200" />
                      <span>{req.mobileNumber}</span>
                    </p>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-500 border-b border-slate-50">{req.businessType}</td>
                  <td className="px-6 py-4 border-b border-slate-50">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      req.status === 'Under Review' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right border-b border-slate-50 relative ${activeMenuId === req.id ? '!z-[60]' : ''}`}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setSelectedRequest(req); setStatusUpdate(req.status); setAdminNotes(req.adminNotes || ''); }}
                        className="h-9 px-3 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-xs transition-all"
                      >
                        <Eye size={13} /> View
                      </button>
 
                      {/* Three dots Action dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === req.id ? null : req.id)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <MoreHorizontal size={16} />
                        </button>
 
                        {activeMenuId === req.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                              <button
                                onClick={() => { handleStatusUpdate(req.id, 'Approved', 'Quick approved from table row action.'); setActiveMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center gap-2"
                              >
                                <Check size={14} /> Approve Request
                              </button>
                              <button
                                onClick={() => { handleStatusUpdate(req.id, 'Rejected', 'Rejected from table row action.'); setActiveMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-800 transition-colors flex items-center gap-2"
                              >
                                <X size={14} /> Reject Request
                              </button>
                              <button
                                onClick={() => { handleStatusUpdate(req.id, 'Under Review', 'Marked under review.'); setActiveMenuId(null); }}
                                className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-800 transition-colors flex items-center gap-2"
                              >
                                <Shield size={14} /> Under Review
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
 
              {filteredAndSortedRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center border-b border-slate-50">
                    <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                      <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                        <FileText size={20} />
                      </div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">No vendor registrations found</h4>
                      <p className="text-[10px] text-slate-400 font-bold">
                        We couldn't locate any farmer registrations matching the selected search query or active filter tags.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Card Layout */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredAndSortedRequests.map(req => (
            <div key={req.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleSelectRow(req.id)} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                    {selectedIds.includes(req.id) ? (
                      <CheckSquare size={16} className="text-emerald-600" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-slate-900 text-sm leading-snug">{req.businessName}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Submitted {new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                  req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                  req.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                  req.status === 'Under Review' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {req.status}
                </span>
              </div>

              <div className="space-y-2.5 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 text-xs text-slate-500 font-semibold">
                <div>
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Owner Details</span>
                  <p className="text-slate-800 font-bold mt-0.5">{req.ownerName}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{req.email} • {req.mobileNumber}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Business Type</span>
                    <span className="text-slate-800 text-[11px] font-bold">{req.businessType}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Taxation</span>
                    <span className="text-amber-600 text-[10px] font-extrabold">{req.gstNumber || 'No GST'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end pt-1">
                <button
                  onClick={() => { setSelectedRequest(req); setStatusUpdate(req.status); setAdminNotes(req.adminNotes || ''); }}
                  className="h-11 flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all"
                >
                  <Eye size={13} /> View Details
                </button>
                <div className="relative">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === req.id ? null : req.id)}
                    className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {activeMenuId === req.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                      <div className="absolute right-0 bottom-full mb-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <button
                          onClick={() => { handleStatusUpdate(req.id, 'Approved', 'Quick approved from action.'); setActiveMenuId(null); }}
                          className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center gap-2"
                        >
                          <Check size={14} /> Approve Request
                        </button>
                        <button
                          onClick={() => { handleStatusUpdate(req.id, 'Rejected', 'Rejected from action.'); setActiveMenuId(null); }}
                          className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-800 transition-colors flex items-center gap-2"
                        >
                          <X size={14} /> Reject Request
                        </button>
                        <button
                          onClick={() => { handleStatusUpdate(req.id, 'Under Review', 'Marked under review.'); setActiveMenuId(null); }}
                          className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-800 transition-colors flex items-center gap-2"
                        >
                          <Shield size={14} /> Under Review
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredAndSortedRequests.length === 0 && (
            <div className="py-20 text-center">
              <div className="max-w-md mx-auto flex flex-col items-center gap-3 px-6">
                <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                  <FileText size={20} />
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">No registrations found</h4>
                <p className="text-[10px] text-slate-400 font-bold text-center">
                  We couldn't locate any registrations matching the active criteria.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in scale-in duration-300 border border-slate-100">
            <div className="sticky top-0 bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-black text-slate-900">Request Details</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Registration ID: VR-00{selectedRequest.id}</p>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="h-10 w-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-500 transition-colors">
                ✕
              </button>
            </div>
            
            <div className="p-8 grid md:grid-cols-2 gap-8 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Business Info</h4>
                  <p className="font-extrabold text-slate-900 text-lg leading-tight">{selectedRequest.businessName}</p>
                  <p className="font-semibold text-emerald-700 text-sm mt-1">{selectedRequest.ownerName}</p>
                  <p className="text-xs text-slate-500 mt-1.5">{selectedRequest.businessType} • {selectedRequest.yearsExperience || 0} Yrs Experience</p>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Contact Details</h4>
                  <p className="font-bold text-slate-800 text-sm">{selectedRequest.email}</p>
                  <p className="font-bold text-slate-800 text-sm mt-1">{selectedRequest.mobileNumber}</p>
                  {selectedRequest.whatsappNumber && <p className="text-xs text-slate-400 mt-1">WhatsApp: {selectedRequest.whatsappNumber}</p>}
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Address Details</h4>
                  <p className="font-bold text-slate-700 text-xs leading-relaxed">
                    {selectedRequest.addressLine1} {selectedRequest.addressLine2}<br />
                    {selectedRequest.city}, {selectedRequest.state} - {selectedRequest.pincode}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Product Categories</h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedRequest.productCategories?.map((c: string) => (
                      <span key={c} className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100/50 rounded-xl text-[10px] font-bold">{c}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Legal Registrations</h4>
                  <div className="space-y-1.5 mt-2">
                    <p className="font-bold text-slate-700 text-xs">
                      <span className="text-slate-400 uppercase font-black tracking-widest text-[9px] mr-1.5">GSTIN:</span> 
                      {selectedRequest.gstNumber || 'No GST details provided'}
                    </p>
                    <p className="font-bold text-slate-700 text-xs">
                      <span className="text-slate-400 uppercase font-black tracking-widest text-[9px] mr-1.5">FSSAI License:</span> 
                      {selectedRequest.fssaiNumber || 'No FSSAI details provided'}
                    </p>
                  </div>
                </div>

                {selectedRequest.createdAt && (
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Submitted On</h4>
                    <p className="font-bold text-slate-700 text-xs flex items-center gap-1.5 mt-1">
                      <Calendar size={13} className="text-slate-400" /> {new Date(selectedRequest.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-4">Admin Assessment</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Update Status</label>
                  <select
                    value={statusUpdate}
                    onChange={e => setStatusUpdate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-emerald-600 outline-none font-bold text-xs shadow-inner"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">Admin Notes (Internal)</label>
                  <textarea
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-emerald-600 outline-none font-bold text-xs shadow-inner"
                    placeholder="Enter review remarks..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-6 py-3 font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedRequest.id, statusUpdate, adminNotes)}
                  disabled={updating}
                  className="px-8 py-3 bg-[#022c22] hover:bg-[#033a2d] text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg disabled:opacity-50 transition-colors"
                >
                  {updating ? 'Saving...' : 'Save Decision'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}