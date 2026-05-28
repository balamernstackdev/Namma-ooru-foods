'use client';

import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Package, LayoutGrid, List, MoreHorizontal, Square, CheckSquare, Eye, Check, X, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminListToolbar from '@/components/admin/AdminListToolbar';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

interface Product {
   id: number;
   name: string;
   category: any;
   brand: any;
   subVendor?: { id: number; name: string };
   price: number;
   originalPrice: number;
   image: string;
   stock?: number;
   variants?: { id: number; name: string; price: number; stock?: number }[];
   status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DRAFT';
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
   APPROVED: { label: 'Published', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
   PENDING: { label: 'Pending', dot: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
   REJECTED: { label: 'Rejected', dot: 'bg-red-400', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
   DRAFT: { label: 'Draft', dot: 'bg-slate-300', bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' },
};

export default function AdminProducts() {
   const router = useRouter();
   const { user } = useAuth();
   const { addToast } = useToast();

   // State controls
   const [searchTerm, setSearchTerm] = useState('');
   const [statusFilter, setStatusFilter] = useState('all');
   const [sortOrder, setSortOrder] = useState('latest');
   const [selectedIds, setSelectedIds] = useState<number[]>([]);
   const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 12;

   const isVendor = user?.role?.toLowerCase() === 'vendor';
   const fetchUrl = isVendor && user?.brandId
      ? `${API_URL}/api/products?brandId=${user?.brandId}&page=${currentPage}&limit=${itemsPerPage}&status=all`
      : `${API_URL}/api/products?page=${currentPage}&limit=${itemsPerPage}&status=${statusFilter}`;

   const { data, error, mutate } = useSWR(user ? fetchUrl : null, (url: string) => fetch(url).then(r => r.json()));
   const isLoading = !data && !error && !!user;

   const products: Product[] = data?.products || [];
   const totalPages = data?.totalPages || 1;

   const getStock = (p: Product) => {
      if (p.variants && p.variants.length > 0) {
         return p.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
      }
      return p.stock ?? 65;
   };

   // Filtering + Sorting
   const filteredAndSorted = products
      .filter(p =>
         p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
         if (sortOrder === 'latest') return b.id - a.id;
         if (sortOrder === 'oldest') return a.id - b.id;
         if (sortOrder === 'alphabetical') return a.name.localeCompare(b.name);
         return 0;
      });

   const handleDelete = async (id: number) => {
      if (!confirm('Are you sure you want to permanently delete this product?')) return;
      try {
         const res = await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE' });
         if (res.ok) {
            addToast('Success', 'Product deleted successfully');
            mutate();
         }
      } catch (e) {
         console.error(e);
         addToast('Error', 'Failed to delete product');
      }
   };

   const handleStatusChange = async (id: number, status: string) => {
      try {
         const res = await fetch(`${API_URL}/api/products/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
         });
         if (res.ok) {
            addToast('Success', `Product status set to ${status}`);
            mutate();
         }
      } catch (e) {
         console.error(e);
         addToast('Error', 'Failed to update product status');
      }
   };

   const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
      if (selectedIds.length === 0) return;
      if (!confirm(`Are you sure you want to perform bulk action for ${selectedIds.length} items?`)) return;

      let successCount = 0;
      for (const id of selectedIds) {
         try {
            if (action === 'delete') {
               const res = await fetch(`${API_URL}/api/products/${id}`, { method: 'DELETE' });
               if (res.ok) successCount++;
            } else {
               const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
               const res = await fetch(`${API_URL}/api/products/${id}/status`, {
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

      addToast('Success', `Successfully updated ${successCount} products`);
      setSelectedIds([]);
      mutate();
   };

   const handleExport = (format: 'CSV' | 'EXCEL' | 'PDF') => {
      if (filteredAndSorted.length === 0) {
         addToast('Error', 'No products available to export');
         return;
      }
      addToast('Info', `Preparing product export as ${format}...`);

      setTimeout(() => {
         const headers = ["S.No", "Product ID", "Product Name", "Category", "Vendor / Brand", "Price (INR)", "Original Price (INR)", "Stock Count", "Stock Status", "Approval Status"];

         const rows = filteredAndSorted.map((p, index) => {
            const stock = getStock(p);
            const stockStatus = stock < 20 ? 'Low Stock' : 'In Stock';
            const vendorName = p.subVendor?.name || p.brand?.name || 'Namma Ooru Originals';
            const categoryName = p.category?.name || 'Heritage Foods';

            return [
               index + 1,
               `NM-00${p.id}`,
               `"${(p.name || '').replace(/"/g, '""')}"`,
               `"${(categoryName || '').replace(/"/g, '""')}"`,
               `"${(vendorName || '').replace(/"/g, '""')}"`,
               p.price,
               p.originalPrice || '',
               stock,
               stockStatus,
               p.status || 'DRAFT'
            ];
         });

         const csvContent = headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");

         const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
         const url = URL.createObjectURL(blob);
         const downloadAnchor = document.createElement('a');
         downloadAnchor.setAttribute("href", url);
         downloadAnchor.setAttribute("download", `products_export_${new Date().toISOString().slice(0, 10)}.csv`);
         document.body.appendChild(downloadAnchor);
         downloadAnchor.click();
         downloadAnchor.remove();
         URL.revokeObjectURL(url);

         addToast('Success', 'Products exported successfully');
      }, 1000);
   };

   const toggleSelectRow = (id: number) => {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
   };

   const toggleSelectAll = () => {
      if (selectedIds.length === filteredAndSorted.length) {
         setSelectedIds([]);
      } else {
         setSelectedIds(filteredAndSorted.map(p => p.id));
      }
   };

   // Calculate quick stats
   const statTotal = data?.total || products.length;
   const statActive = products.filter(p => p.status === 'APPROVED').length;
   const statPending = products.filter(p => p.status === 'PENDING').length;
   const statLowStock = products.filter(p => getStock(p) < 20).length;

   const quickStats = [
      { label: 'Total Catalog', value: statTotal, gradient: 'from-slate-800 to-slate-900', icon: <Package size={24} /> },
      { label: 'Published Items', value: statActive, gradient: 'from-emerald-600 to-emerald-700', icon: <CheckCircle2 size={24} /> },
      { label: 'Pending Moderation', value: statPending, gradient: 'from-amber-500 to-amber-600', icon: <ShieldAlert size={24} /> },
      { label: 'Low Stock Alert', value: statLowStock, gradient: 'from-rose-500 to-rose-600', icon: <Package size={24} /> },
   ];

   return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-7xl mx-auto p-4 md:p-8">
         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
                  {isVendor ? 'My Products' : 'All Products'}
               </h1>
               <p className="text-slate-400 font-medium text-sm mt-1">Configure organic catalog, manage inventory levels, and configure pricing.</p>
            </div>
         </div>

         {/* Advanced filter toolbar */}
         <AdminListToolbar
            searchPlaceholder="Search catalog by name, category..."
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusOptions={[
               { label: 'All Products', value: 'all' },
               { label: 'Published', value: 'APPROVED' },
               { label: 'Pending Review', value: 'PENDING' },
               { label: 'Rejected', value: 'REJECTED' },
               { label: 'Drafts', value: 'DRAFT' },
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
            onAddNewClick={() => router.push('/admin/products/create')}
            addNewLabel="Add Product"
            onExportClick={handleExport}
            selectedCount={selectedIds.length}
            onBulkAction={handleBulkAction}
         />

         {/* Listing table */}
         <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mt-6">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50">
                        <th className="px-6 py-5 w-12 border-b border-slate-100 text-center">
                           <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600 transition-colors">
                              {selectedIds.length === filteredAndSorted.length && filteredAndSorted.length > 0 ? (
                                 <CheckSquare size={16} className="text-emerald-600" />
                              ) : (
                                 <Square size={16} />
                              )}
                           </button>
                        </th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Product Info</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Category</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Stock Status</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Price</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
                     </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-slate-700 font-bold text-sm">
                     {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                           <tr key={i} className="animate-pulse">
                              <td className="px-6 py-4 border-b border-slate-50" colSpan={6}>
                                 <div className="flex items-center gap-4 py-2">
                                    <div className="h-10 w-10 bg-slate-100 rounded-xl" />
                                    <div className="space-y-1.5 flex-1">
                                       <div className="h-3 bg-slate-100 rounded w-1/3" />
                                       <div className="h-2 bg-slate-100 rounded w-1/4" />
                                    </div>
                                 </div>
                              </td>
                           </tr>
                        ))
                     ) : filteredAndSorted.length === 0 ? (
                        <tr>
                           <td colSpan={6} className="py-20 text-center">
                              <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                                 <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                    <Package size={20} />
                                 </div>
                                 <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">No products found</h4>
                                 <p className="text-[10px] text-slate-400 font-bold">
                                    Start expanding your heritage market presence by adding your first product to our directory.
                                 </p>
                              </div>
                           </td>
                        </tr>
                     ) : (
                        filteredAndSorted.map(product => {
                           const stock = getStock(product);
                           const stockPct = Math.min(100, (stock / 100) * 100);
                           const isLow = stock < 20;

                           return (
                              <tr key={product.id} className="group hover:bg-slate-50/40 transition-colors">
                                 <td className="px-6 py-4 text-center border-b border-slate-50">
                                    <button onClick={() => toggleSelectRow(product.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                       {selectedIds.includes(product.id) ? (
                                          <CheckSquare size={16} className="text-emerald-600" />
                                       ) : (
                                          <Square size={16} />
                                       )}
                                    </button>
                                 </td>
                                 <td className="px-6 py-4 border-b border-slate-50">
                                    <div className="flex items-center gap-3">
                                       <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 shadow-sm">
                                          <img
                                             src={product.image || '/logo.webp'}
                                             className="h-full w-full object-cover"
                                             alt={product.name}
                                          />
                                       </div>
                                       <div className="min-w-0">
                                          <p className="text-[13px] font-extrabold text-slate-900 leading-tight truncate">
                                             {product.name}
                                          </p>
                                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                             <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${product.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                   product.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                      'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}>
                                                {product.status}
                                             </span>
                                             {product.subVendor && (
                                                <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                   {product.subVendor.name}
                                                </span>
                                             )}
                                             <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">
                                                ID: NM-00{product.id}
                                             </span>
                                          </div>
                                       </div>
                                    </div>
                                 </td>

                                 <td className="px-6 py-4 border-b border-slate-50">
                                    <span className="inline-block text-[10px] font-black uppercase tracking-wider text-slate-600 px-3 py-1.5 bg-slate-50 rounded-xl whitespace-nowrap max-w-[160px] truncate">
                                       {product.category?.name || 'Heritage Foods'}
                                    </span>
                                 </td>

                                 <td className="px-6 py-4 border-b border-slate-50">
                                    <div className="space-y-1">
                                       <div className="flex items-center justify-between gap-2 max-w-[120px]">
                                          <span className="text-xs font-bold text-slate-700">{stock} units</span>
                                          <span className={`text-[8px] font-black uppercase tracking-wider ${isLow ? 'text-red-500' : 'text-emerald-500'}`}>
                                             {isLow ? 'Low' : 'OK'}
                                          </span>
                                       </div>
                                       <div className="h-1.5 w-28 bg-slate-50 rounded-full overflow-hidden">
                                          <div
                                             className={`h-full rounded-full transition-all ${isLow ? 'bg-red-400' : 'bg-emerald-500'}`}
                                             style={{ width: `${stockPct}%` }}
                                          />
                                       </div>
                                    </div>
                                 </td>

                                 <td className="px-6 py-4 border-b border-slate-50">
                                    <span className="text-sm font-black text-slate-900">
                                       ₹{Number(product.price).toLocaleString('en-IN')}
                                    </span>
                                 </td>

                                 <td className="px-6 py-4 text-right border-b border-slate-50 relative">
                                    <div className="flex items-center justify-end gap-1">
                                       <Link
                                          href={`/admin/products/edit/${product.id}`}
                                          className="h-9 px-3 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-xs transition-all no-underline"
                                       >
                                          <Edit2 size={13} /> Edit
                                       </Link>

                                       {/* Three dots Action dropdown */}
                                       <div className="relative">
                                          <button
                                             onClick={() => setActiveMenuId(activeMenuId === product.id ? null : product.id)}
                                             className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                          >
                                             <MoreHorizontal size={16} />
                                          </button>

                                          {activeMenuId === product.id && (
                                             <>
                                                <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                                                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                                   <button
                                                      onClick={() => { handleStatusChange(product.id, 'APPROVED'); setActiveMenuId(null); }}
                                                      className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center gap-2"
                                                   >
                                                      <Check size={14} /> Publish Product
                                                   </button>
                                                   <button
                                                      onClick={() => { handleStatusChange(product.id, 'PENDING'); setActiveMenuId(null); }}
                                                      className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-800 transition-colors flex items-center gap-2"
                                                   >
                                                      <ShieldAlert size={14} /> Mark Pending
                                                   </button>
                                                   <button
                                                      onClick={() => { handleDelete(product.id); setActiveMenuId(null); }}
                                                      className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-800 transition-colors flex items-center gap-2"
                                                   >
                                                      <Trash2 size={14} /> Delete Product
                                                   </button>
                                                </div>
                                             </>
                                          )}
                                       </div>
                                    </div>
                                 </td>
                              </tr>
                           );
                        })
                     )}
                  </tbody>
               </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
               <div className="border-t border-slate-50">
                  <AdminPagination
                     currentPage={currentPage}
                     totalPages={totalPages}
                     onPageChange={setCurrentPage}
                  />
               </div>
            )}
         </div>
      </div>
   );
}
