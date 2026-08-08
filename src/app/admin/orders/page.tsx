'use client';

import React, { useState } from 'react';
import { Eye, Clock, Truck, CheckCircle2, RotateCcw, XCircle, Search, Filter, MoreVertical, Loader2, Download, AlertCircle, ShoppingBag, ChevronDown, Square, CheckSquare, FileText, Trash2, MoreHorizontal } from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { usePlatformSettings } from '@/context/PlatformSettingsContext';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminListToolbar from '@/components/admin/AdminListToolbar';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminOrders() {
  const { settings } = usePlatformSettings();
  const { addToast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('latest');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const itemsPerPage = 10;
  const { data, error, mutate } = useSWR(
    `${API_URL}/api/admin/orders?limit=1000&search=${searchTerm}`,
    fetcher
  );
  
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const { orders = [], statusCounts = {}, totalPages = 1 } = data || {};

  const getStatusCount = (status: string) => {
    return statusCounts[status] || 0;
  };

  const getOrderVendors = (order: any) => {
    const vendorMap = new Map();
    let hasOfficial = false;
    order.items?.forEach((item: any) => {
      const brand = item.product?.subVendor || item.product?.brand;
      if (brand) {
        vendorMap.set(brand.id, brand);
      } else {
        hasOfficial = true;
      }
    });
    return { resellers: Array.from(vendorMap.values()), hasOfficial };
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        addToast('Success', `Order status updated to ${status}`);
        mutate();
      }
    } catch (e) {
      console.error(e);
      addToast('Error', 'Failed to update order status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this order registry?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Success', 'Order purged successfully');
        mutate();
      }
    } catch (e) {
      console.error(e);
      addToast('Error', 'Failed to delete order');
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Perform bulk ${action} on ${selectedIds.length} orders?`)) return;

    let successCount = 0;
    for (const id of selectedIds) {
      try {
        if (action === 'delete') {
          const res = await fetch(`${API_URL}/api/admin/orders/${id}`, { method: 'DELETE' });
          if (res.ok) successCount++;
        } else {
          const newStatus = action === 'approve' ? 'DELIVERED' : 'CANCELLED';
          const res = await fetch(`${API_URL}/api/admin/orders/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          });
          if (res.ok) successCount++;
        }
      } catch (err) {
        console.error(err);
      }
    }

    addToast('Success', `Completed action for ${successCount} orders`);
    setSelectedIds([]);
    mutate();
  };

  const handleVerifyPayment = async (providerRef: string) => {
    try {
      addToast('Info', 'Verifying payment status with Gateway...');
      const res = await fetch(`${API_URL}/api/payments/status/${providerRef}`);
      const data = await res.json();
      if (res.ok) {
        addToast('Success', `Gateway Status: ${data.status}`);
        mutate();
      } else {
        addToast('Error', data.error || 'Failed to verify payment');
      }
    } catch (e) {
      console.error(e);
      addToast('Error', 'Failed to verify payment');
    }
  };

  const handleRefund = async (providerRef: string, totalAmount: number) => {
    if (!confirm(`Are you sure you want to issue a full refund of ₹${totalAmount}?`)) return;
    try {
      addToast('Info', 'Initiating refund with Gateway...');
      const res = await fetch(`${API_URL}/api/payments/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: providerRef, amount: totalAmount, reason: 'Admin Action' })
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Success', `Refund successful! Status: ${data.gatewayResponse?.status || 'Initiated'}`);
        mutate();
      } else {
        addToast('Error', data.error || 'Failed to refund order');
      }
    } catch (e) {
      console.error(e);
      addToast('Error', 'Failed to refund order');
    }
  };

  const handleExport = (format: 'CSV' | 'EXCEL' | 'PDF') => {
    if (filteredOrders.length === 0) {
      addToast('Error', 'No orders available to export');
      return;
    }
    addToast('Info', `Preparing orders export as ${format}...`);
    
    setTimeout(() => {
      const headers = ["S.No", "Order ID", "Order Date", "Customer Name", "Customer Email", "Vendors / Brands", "Total Items", "Total Amount (INR)", "Status"];
      
      const rows = filteredOrders.map((o: any, index: number) => {
        const { resellers, hasOfficial } = getOrderVendors(o);
        const vendorNames = [];
        if (hasOfficial) vendorNames.push("Namma Ooru Originals");
        resellers.forEach((vendor: any) => vendorNames.push(vendor.name));
        const vendorsStr = vendorNames.join(", ");
        
        return [
          index + 1,
          o.orderIdStr || `ORD-${o.id.toString().padStart(4, '0')}`,
          `"${new Date(o.createdAt).toLocaleDateString('en-IN')}"`,
          `"${(o.user?.name || '').replace(/"/g, '""')}"`,
          `"${(o.user?.email || '').replace(/"/g, '""')}"`,
          `"${vendorsStr.replace(/"/g, '""')}"`,
          o.items?.length || 0,
          o.totalAmount,
          o.status || 'PENDING'
        ];
      });
      
      const csvContent = headers.join(",") + "\n" + rows.map((r: any) => r.join(",")).join("\n");
      
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", `orders_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
      
      addToast('Success', 'Orders exported successfully');
    }, 1000);
  };

  const toggleSelectRow = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o: any) => o.id));
    }
  };

  const filteredOrders = orders.filter((o: any) => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  const calculatedTotalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const quickStats = [
    { label: 'Paid', value: getStatusCount('PROCESSING'), gradient: 'from-teal-500 to-teal-600', icon: <Clock size={24} /> },
    { label: 'In Transit', value: getStatusCount('SHIPPED'), gradient: 'from-blue-600 to-blue-700', icon: <Truck size={24} /> },
    { label: 'Delivered', value: getStatusCount('DELIVERED'), gradient: 'from-emerald-600 to-emerald-700', icon: <CheckCircle2 size={24} /> },
    { label: 'Cancelled Orders', value: getStatusCount('CANCELLED'), gradient: 'from-rose-500 to-rose-600', icon: <XCircle size={24} /> },
  ];

  if (!data && !error) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-white gap-6">
        <div className="h-10 w-10 border-4 border-emerald-950 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#022c22]">Processing Global Orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">Order <span className="text-emerald-600">Management</span></h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Review orders status, export log archives, and manage dispatch status.</p>
      </div>

      {/* Advanced Filter Toolbar */}
      <AdminListToolbar
        searchPlaceholder="Find orders by ID, email, name..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusOptions={[
          { label: 'All Orders', value: 'ALL' },
          { label: 'Paid', value: 'PROCESSING' },
          { label: 'Shipped', value: 'SHIPPED' },
          { label: 'Delivered', value: 'DELIVERED' },
          { label: 'Cancelled', value: 'CANCELLED' },
        ]}
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
        sortOptions={[
          { label: 'Latest First', value: 'latest' },
          { label: 'Oldest First', value: 'oldest' },
        ]}
        selectedSort={sortOrder}
        onSortChange={setSortOrder}
        quickStats={quickStats}
        onExportClick={handleExport}
        selectedCount={selectedIds.length}
        onBulkAction={handleBulkAction}
      />

      {/* Orders List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mt-6">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto min-h-[280px]">
          <table className="w-full text-left border-collapse min-w-[1000px] admin-data-table">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 w-12 border-b border-slate-100 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600 transition-colors">
                    {selectedIds.length === filteredOrders.length && filteredOrders.length > 0 ? (
                      <CheckSquare size={16} className="text-emerald-600" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Order & Date</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Customer</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Vendor(s)</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Items</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Total</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-bold text-sm">
              {paginatedOrders.map((order: any) => {
                const { resellers, hasOfficial } = getOrderVendors(order);
                const isSelected = selectedIds.includes(order.id);
                return (
                  <React.Fragment key={order.id}>
                    <tr
                      className={`group hover:bg-slate-50/40 transition-colors cursor-pointer ${isSelected ? 'bg-slate-50/30' : ''}`}
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    >
                      <td className="px-6 py-4 text-center border-b border-slate-50" onClick={e => e.stopPropagation()}>
                        <button onClick={() => toggleSelectRow(order.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                          {isSelected ? (
                            <CheckSquare size={16} className="text-emerald-600" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 border-b border-slate-50">
                        <span className="text-[13px] font-extrabold text-slate-900 flex items-center gap-1.5 leading-none">
                          #{order.orderIdStr || order.id.toString().padStart(4, '0')}
                          <ChevronDown size={13} className={`text-slate-300 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4 border-b border-slate-50">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{order.user?.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium lowercase">{order.user?.email}</span>
                          {(order.shippingAddress?.phone || order.user?.phone) && (
                            <span className="text-[10px] text-slate-500 font-bold mt-0.5">📞 {order.shippingAddress?.phone || order.user?.phone}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-slate-50">
                        <div className="flex flex-col gap-1">
                          {hasOfficial && (
                            <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wide bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50 w-fit">
                              Originals
                            </span>
                          )}
                          {resellers.map((vendor: any) => (
                             <span key={vendor.id} className="text-[10px] font-bold text-slate-600 block leading-tight">
                               {vendor.name}
                             </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 border-b border-slate-50">
                        <span className="text-xs font-semibold text-slate-500">{order.items?.length} Items</span>
                      </td>
                      <td className="px-6 py-4 border-b border-slate-50">
                        <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-100' :
                          order.status === 'PROCESSING' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {order.status === 'PROCESSING' ? 'Paid' : order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right border-b border-slate-50">
                        <span className="text-sm font-black text-slate-900">₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-6 py-4 text-right border-b border-slate-50 relative" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="h-9 px-3 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-xs transition-all"
                          >
                            <Eye size={13} /> View
                          </button>

                          <div className="relative">
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === order.id ? null : order.id)}
                              className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <MoreHorizontal size={16} />
                            </button>

                            {activeMenuId === order.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                  <button
                                    onClick={() => { handleStatusChange(order.id, 'SHIPPED'); setActiveMenuId(null); }}
                                    className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-800 transition-colors flex items-center gap-2"
                                  >
                                    <Truck size={14} /> Mark Shipped
                                  </button>
                                  <button
                                    onClick={() => { handleStatusChange(order.id, 'DELIVERED'); setActiveMenuId(null); }}
                                    className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center gap-2"
                                  >
                                    <CheckCircle2 size={14} /> Mark Delivered
                                  </button>
                                  <button
                                    onClick={() => { handleStatusChange(order.id, 'CANCELLED'); setActiveMenuId(null); }}
                                    className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-800 transition-colors flex items-center gap-2"
                                  >
                                    <XCircle size={14} /> Cancel Order
                                  </button>
                                  <button
                                    onClick={() => { handleDelete(order.id); setActiveMenuId(null); }}
                                    className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                  >
                                    <Trash2 size={14} /> Purge Order
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>

                    {expandedOrder === order.id && (
                      <tr key={`${order.id}-detail`}>
                        <td colSpan={8} className="p-6 bg-slate-50/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(() => {
                              const groups: any = {};
                              order.items.forEach((item: any) => {
                                const vName = item.product?.subVendor?.name || item.product?.brand?.name || 'namma ooru Originals';
                                if (!groups[vName]) groups[vName] = [];
                                groups[vName].push(item);
                              });

                              return Object.keys(groups).map(vendorName => (
                                <div key={vendorName} className="space-y-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                                    <span className="text-[10px] font-black text-emerald-950 uppercase tracking-widest">{vendorName}</span>
                                    <span className="text-[8px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">{groups[vendorName].length} items</span>
                                  </div>
                                  <div className="space-y-2">
                                    {groups[vendorName].map((item: any) => (
                                      <div key={item.id} className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-150 shadow-sm transition-all hover:shadow-md">
                                        <div className="h-10 w-10 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shrink-0">
                                          <img src={item.product?.image || settings?.logo || '/logo.webp'} className="h-full w-full object-cover" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-[13px] font-black text-slate-900 truncate leading-snug flex items-center gap-2">
                                            <span>{item.product?.name}</span>
                                            {item.variantName && (
                                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black tracking-wider uppercase whitespace-nowrap border border-slate-200/50">
                                                {item.variantName}
                                              </span>
                                            )}
                                          </p>
                                          <div className="flex items-center gap-4 mt-1">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Qty: {item.quantity}</span>
                                            <span className="text-[10px] text-slate-400 font-semibold">
                                              MRP: <span className="line-through text-slate-350">₹{Number(item.product?.originalPrice || item.unitPrice || item.price || 0).toLocaleString()}</span>
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-semibold">
                                              Price: <span className="text-emerald-600 font-bold">₹{Number(item.unitPrice || item.price || 0).toLocaleString()}</span>
                                            </span>
                                            <span className="text-[12px] font-black text-emerald-700 tracking-tighter ml-auto">Subtotal: ₹{Number((item.unitPrice || item.price || 0) * item.quantity).toLocaleString()}</span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ));
                            })()}
                          </div>
                          {order.shippingAddress && (
                            <div className="mt-6 pt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700 space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm w-fit min-w-[340px]">
                              <span className="text-[10px] font-black text-emerald-950 uppercase tracking-widest block border-b border-slate-100 pb-1 mb-2">Delivery Details</span>
                              
                              <div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Recipient Name:</span>
                                <p className="font-extrabold text-slate-900 text-[13px]">{order.shippingAddress.recipientName || order.shippingAddress.name || 'Customer'}</p>
                              </div>

                              <div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Contact Number:</span>
                                <p className="font-bold text-slate-800">{order.shippingAddress.phone}</p>
                              </div>

                              <div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Street Address / Building:</span>
                                <p className="text-slate-700 font-bold">{order.shippingAddress.line1}</p>
                              </div>

                              {order.shippingAddress.line2 && (
                                <div>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Landmark / Area:</span>
                                  <p className="text-slate-700 font-bold bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100 w-fit">{order.shippingAddress.line2}</p>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">City:</span>
                                  <p className="text-slate-700 font-bold">{order.shippingAddress.city}</p>
                                </div>
                                <div>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Pincode:</span>
                                  <p className="text-slate-700 font-bold">{order.shippingAddress.pincode}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {order.transactions && order.transactions.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-slate-200/60 flex flex-wrap items-center justify-end gap-3">
                              <span className="text-[10px] text-slate-400 font-bold mr-auto">Provider Ref: {order.transactions[0].providerRef}</span>
                              <button onClick={() => handleVerifyPayment(order.transactions[0].providerRef)} className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
                                <RotateCcw size={14} /> Verify Payment Status
                              </button>
                              <button onClick={() => handleRefund(order.transactions[0].providerRef, order.totalAmount)} className="px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5">
                                <XCircle size={14} /> Initiate Refund
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                      <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                        <FileText size={20} />
                      </div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">No transaction logs found</h4>
                      <p className="text-[10px] text-slate-400 font-bold">
                        We couldn't locate any records matching your search queries.
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
          {paginatedOrders.map((order: any) => {
            const { resellers, hasOfficial } = getOrderVendors(order);
            const isSelected = selectedIds.includes(order.id);
            const isExpanded = expandedOrder === order.id;

            return (
              <div key={order.id} className={`p-6 space-y-4 ${isSelected ? 'bg-slate-50/30' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-extrabold text-slate-900 flex items-center gap-1.5 leading-none">
                      #{order.orderIdStr || order.id.toString().padStart(4, '0')}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleSelectRow(order.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      {isSelected ? (
                        <CheckSquare size={16} className="text-emerald-600" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Customer</span>
                    <span className="font-extrabold text-slate-800 block truncate">
                      {order.user?.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block truncate lowercase">
                      {order.user?.email}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Total Amount</span>
                    <span className="font-extrabold text-slate-900 block text-sm">
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Vendor(s)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {hasOfficial && (
                        <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wide bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">
                          Originals
                        </span>
                      )}
                      {resellers.map((vendor: any) => (
                        <span key={vendor.id} className="text-[9px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                          {vendor.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-slate-500">{order.items?.length} Items</span>
                    <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-100' :
                      order.status === 'PROCESSING' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                      'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {order.status === 'PROCESSING' ? 'Paid' : order.status}
                    </span>
                  </div>
                </div>

                {/* Expandable Order Details for Mobile Card */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-4 animate-in slide-in-from-top-1 duration-200">
                    {(() => {
                      const groups: any = {};
                      order.items.forEach((item: any) => {
                        const vName = item.product?.subVendor?.name || item.product?.brand?.name || 'namma ooru Originals';
                        if (!groups[vName]) groups[vName] = [];
                        groups[vName].push(item);
                      });

                      return Object.keys(groups).map(vendorName => (
                        <div key={vendorName} className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <div className="h-3 w-1 bg-emerald-500 rounded-full" />
                            <span className="text-[9px] font-black text-emerald-950 uppercase tracking-widest">{vendorName}</span>
                            <span className="text-[8px] font-bold text-slate-400">({groups[vendorName].length} items)</span>
                          </div>
                          <div className="space-y-1.5">
                            {groups[vendorName].map((item: any) => (
                              <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100">
                                <div className="h-9 w-9 bg-slate-50 border border-slate-100 rounded overflow-hidden shrink-0">
                                  <img src={item.product?.image || settings?.logo || '/logo.webp'} className="h-full w-full object-cover" alt="" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black text-slate-900 truncate leading-tight flex items-center gap-1.5">
                                    <span>{item.product?.name}</span>
                                    {item.variantName && (
                                      <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[8px] font-black tracking-wider uppercase whitespace-nowrap border border-slate-200/50">
                                        {item.variantName}
                                      </span>
                                    )}
                                  </p>
                                  <div className="flex flex-col gap-1 mt-1">
                                    <div className="flex items-center gap-2.5 text-[9px] text-slate-400 font-bold uppercase">
                                      <span>Qty: {item.quantity}</span>
                                      <span>MRP: <span className="line-through">₹{Number(item.product?.originalPrice || item.unitPrice || item.price || 0).toLocaleString()}</span></span>
                                      <span>Price: <span className="text-emerald-600 font-bold">₹{Number(item.unitPrice || item.price || 0).toLocaleString()}</span></span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-black text-emerald-700">
                                      <span className="text-[9px] text-slate-400 uppercase font-black">Subtotal</span>
                                      <span>₹{Number((item.unitPrice || item.price || 0) * item.quantity).toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                    {order.transactions && order.transactions.length > 0 && (
                      <div className="pt-3 mt-3 border-t border-slate-200/60 flex flex-col gap-2">
                        <span className="text-[10px] text-slate-400 font-bold">Provider Ref: {order.transactions[0].providerRef}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleVerifyPayment(order.transactions[0].providerRef)} className="flex-1 h-9 flex items-center justify-center bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors gap-1.5">
                            <RotateCcw size={14} /> Verify
                          </button>
                          <button onClick={() => handleRefund(order.transactions[0].providerRef, order.totalAmount)} className="flex-1 h-9 flex items-center justify-center bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors gap-1.5">
                            <XCircle size={14} /> Refund
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="h-11 flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-xs font-bold"
                  >
                    <Eye size={14} /> {isExpanded ? 'Hide Details' : 'View Details'}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === order.id ? null : order.id)}
                      className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {activeMenuId === order.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                        <div className="absolute right-0 bottom-12 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                          <button
                            onClick={() => { handleStatusChange(order.id, 'SHIPPED'); setActiveMenuId(null); }}
                            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-800 transition-colors flex items-center gap-2"
                          >
                            <Truck size={14} /> Mark Shipped
                          </button>
                          <button
                            onClick={() => { handleStatusChange(order.id, 'DELIVERED'); setActiveMenuId(null); }}
                            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle2 size={14} /> Mark Delivered
                          </button>
                          <button
                            onClick={() => { handleStatusChange(order.id, 'CANCELLED'); setActiveMenuId(null); }}
                            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-800 transition-colors flex items-center gap-2"
                          >
                            <XCircle size={14} /> Cancel Order
                          </button>
                          <button
                            onClick={() => { handleDelete(order.id); setActiveMenuId(null); }}
                            className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <Trash2 size={14} /> Purge Order
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredOrders.length === 0 && (
            <div className="px-6 py-20 text-center">
              <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                  <FileText size={20} />
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">No transaction logs found</h4>
                <p className="text-[10px] text-slate-400 font-bold">
                  We couldn't locate any records matching your search queries.
                </p>
              </div>
            </div>
          )}
        </div>
        <AdminPagination
          currentPage={currentPage}
          totalPages={calculatedTotalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
