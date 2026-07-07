'use client';

import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Package, LayoutGrid, List, MoreHorizontal, Square, CheckSquare, Eye, Check, X, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePlatformSettings } from '@/context/PlatformSettingsContext';
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
   ingredientsInfo?: string;
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
   const { settings } = usePlatformSettings();
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
      ? `${API_URL}/api/products?brandId=${user?.brandId}&limit=1000&status=all`
      : `${API_URL}/api/products?limit=1000&status=all`;

   const { data, error, mutate } = useSWR(user ? fetchUrl : null, (url: string) => fetch(url).then(r => r.json()));
   const isLoading = !data && !error && !!user;

   const products: Product[] = data?.products || [];

   React.useEffect(() => {
      setCurrentPage(1);
   }, [searchTerm, statusFilter]);

   const getStock = (p: Product) => {
      if (p.variants && p.variants.length > 0) {
         return p.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
      }
      return p.stock ?? 65;
   };

   // Filtering + Sorting
   const filteredAndSorted = products
      .filter(p => {
         const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
         
         const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
         
         return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
         if (sortOrder === 'latest') return b.id - a.id;
         if (sortOrder === 'oldest') return a.id - b.id;
         if (sortOrder === 'alphabetical') return a.name.localeCompare(b.name);
         return 0;
      });

   const calculatedTotalPages = Math.max(1, Math.ceil(filteredAndSorted.length / itemsPerPage));
   const paginatedProducts = filteredAndSorted.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
   );

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

   const statTotal = products.length;
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
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
               <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">
                  {isVendor ? <>My <span className="text-emerald-600">Products</span></> : <>Product <span className="text-emerald-600">Management</span></>}
               </h1>
               <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Configure organic catalog, manage inventory levels, and configure pricing.</p>
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
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto min-h-[280px]">
               <table className="w-full text-left border-collapse min-w-[1000px] admin-data-table">
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
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Ingredients</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Stock Status</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Price</th>
                        <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
                     </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-slate-700 font-bold text-sm">
                     {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                           <tr key={i} className="animate-pulse">
                              <td className="px-6 py-4 border-b border-slate-50" colSpan={7}>
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
                           <td colSpan={7} className="py-20 text-center">
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
                        paginatedProducts.map(product => {
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
                                        <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
                                           {product.image ? (
                                              <img
                                                 src={product.image}
                                                 className="h-full w-full object-cover"
                                                 alt={product.name}
                                              />
                                           ) : (
                                              <div className="h-full w-full bg-slate-100 flex flex-col items-center justify-center text-center p-1">
                                                 <span className="text-[7px] leading-tight font-black uppercase text-slate-400">No Image</span>
                                              </div>
                                           )}
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
                                    <span className="text-xs text-slate-500 font-semibold max-w-[150px] truncate block" title={product.ingredientsInfo ? product.ingredientsInfo.replace(/<[^>]*>/g, '') : '—'}>
                                       {product.ingredientsInfo ? product.ingredientsInfo.replace(/<[^>]*>/g, '') : '—'}
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

                                 <td className={`px-6 py-4 text-right border-b border-slate-50 relative ${activeMenuId === product.id ? '!z-[60]' : ''}`}>
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

            {/* Mobile View - Card Layout */}
            <div className="block md:hidden divide-y divide-slate-100">
               {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                     <div key={i} className="p-6 space-y-4 animate-pulse">
                        <div className="flex items-center gap-3">
                           <div className="h-12 w-12 bg-slate-100 rounded-xl shrink-0" />
                           <div className="space-y-2 flex-1">
                              <div className="h-3 bg-slate-100 rounded w-2/3" />
                              <div className="h-2 bg-slate-100 rounded w-1/3" />
                           </div>
                        </div>
                        <div className="h-16 bg-slate-50/50 rounded-2xl" />
                     </div>
                  ))
               ) : filteredAndSorted.length === 0 ? (
                  <div className="py-20 text-center">
                     <div className="max-w-md mx-auto flex flex-col items-center gap-3 px-6">
                        <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                           <Package size={20} />
                        </div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">No products found</h4>
                        <p className="text-[10px] text-slate-400 font-bold">
                           Start expanding your heritage market presence by adding your first product to our directory.
                        </p>
                     </div>
                  </div>
               ) : (
                  paginatedProducts.map(product => {
                     const stock = getStock(product);
                     const stockPct = Math.min(100, (stock / 100) * 100);
                     const isLow = stock < 20;

                     return (
                        <div key={product.id} className="p-6 space-y-4">
                           <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
                                 {product.image ? (
                                    <img
                                       src={product.image}
                                       className="h-full w-full object-cover"
                                       alt={product.name}
                                    />
                                 ) : (
                                    <div className="h-full w-full bg-slate-100 flex flex-col items-center justify-center text-center p-1">
                                       <span className="text-[7px] leading-tight font-black uppercase text-slate-400">No Image</span>
                                    </div>
                                 )}
                              </div>
                              <div className="min-w-0 flex-1">
                                 <div className="flex items-center justify-between gap-2">
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                       ID: NM-00{product.id}
                                    </span>
                                    <button onClick={() => toggleSelectRow(product.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                       {selectedIds.includes(product.id) ? (
                                          <CheckSquare size={16} className="text-emerald-600" />
                                       ) : (
                                          <Square size={16} />
                                       )}
                                    </button>
                                 </div>
                                 <p className="text-[13px] font-extrabold text-slate-900 leading-tight truncate mt-0.5">
                                    {product.name}
                                 </p>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-3 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 text-xs">
                              <div className="space-y-1">
                                 <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Category</span>
                                 <span className="font-extrabold text-slate-800 block truncate">
                                    {product.category?.name || 'Heritage Foods'}
                                 </span>
                              </div>
                              <div className="space-y-1">
                                 <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Price</span>
                                 <span className="font-extrabold text-slate-900 block">
                                    ₹{Number(product.price).toLocaleString('en-IN')}
                                 </span>
                              </div>
                              <div className="col-span-2 space-y-1.5 pt-2 border-t border-slate-100">
                                 <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Stock Status</span>
                                    <span className={`text-[9px] font-black uppercase tracking-wider ${isLow ? 'text-red-500' : 'text-emerald-500'}`}>
                                       {stock} units ({isLow ? 'Low' : 'OK'})
                                    </span>
                                 </div>
                                 <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                       className={`h-full rounded-full transition-all ${isLow ? 'bg-red-400' : 'bg-emerald-500'}`}
                                       style={{ width: `${stockPct}%` }}
                                    />
                                 </div>
                              </div>
                              <div className="col-span-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                                 <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${product.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                       product.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                          'bg-slate-50 text-slate-500 border-slate-200'
                                    }`}>
                                    Status: {product.status}
                                 </span>
                                 {product.subVendor && (
                                    <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
                                       {product.subVendor.name}
                                    </span>
                                 )}
                              </div>
                           </div>

                           <div className="flex items-center gap-2 pt-1">
                              <Link
                                 href={`/admin/products/edit/${product.id}`}
                                 className="h-11 flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-xs font-bold no-underline"
                              >
                                 <Edit2 size={14} /> Edit
                              </Link>
                              
                              <div className="relative">
                                 <button
                                    onClick={() => setActiveMenuId(activeMenuId === product.id ? null : product.id)}
                                    className="h-11 w-11 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                                 >
                                    <MoreHorizontal size={18} />
                                 </button>

                                 {activeMenuId === product.id && (
                                    <>
                                       <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                                       <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
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
                        </div>
                     );
                  })
               )}
            </div>

            {/* Pagination */}
            {calculatedTotalPages > 1 && (
               <div className="border-t border-slate-50">
                  <AdminPagination
                     currentPage={currentPage}
                     totalPages={calculatedTotalPages}
                     onPageChange={setCurrentPage}
                  />
               </div>
            )}
         </div>
      </div>
   );
}
