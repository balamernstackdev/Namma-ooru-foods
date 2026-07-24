'use client';

import React, { useState } from 'react';
import {
   Plus,
   Search,
   Edit2,
   Trash2,
   Filter,
   Package,
   Download
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import { TableRowSkeleton } from '@/components/ui/Skeletons';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { API_URL } from '@/lib/api';

interface Product {
   id: number;
   name: string;
   price: number;
   category?: { name: string };
   image?: string;
   stock?: number;
   status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DRAFT';
   ingredientsInfo?: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const CardSkeleton = () => (
   <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
         <div className="h-16 w-16 rounded-2xl bg-slate-100 shrink-0" />
         <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-100 rounded w-2/3" />
            <div className="h-3 bg-slate-100 rounded w-1/3" />
         </div>
      </div>
      <div className="flex items-center justify-between border-t border-b border-[#E5E7EB] py-3">
         <div className="h-6 bg-slate-100 rounded w-1/5" />
         <div className="h-6 bg-slate-100 rounded w-1/5" />
         <div className="h-6 bg-slate-100 rounded w-1/5" />
      </div>
      <div className="flex justify-end gap-3">
         <div className="h-10 w-20 bg-slate-100 rounded-xl" />
         <div className="h-10 w-20 bg-slate-100 rounded-xl" />
      </div>
   </div>
);

export default function VendorProducts() {
   const { user } = useAuth();
   const router = useRouter();
   const [searchTerm, setSearchTerm] = useState('');
   const [currentPage, setCurrentPage] = useState(1);
   const ITEMS_PER_PAGE = 8;

   React.useEffect(() => {
      setCurrentPage(1);
   }, [searchTerm]);

   const isAdmin = user?.role?.toLowerCase() === 'admin';
   const fetchUrl = isAdmin
      ? `${API_URL}/api/products?status=all&limit=1000`
      : user?.brandId
         ? `${API_URL}/api/products?subVendorId=${user.brandId}&status=all&limit=1000`
         : null;

   const { data: productsData, error, mutate, isLoading } = useSWR<any>(
      fetchUrl,
      fetcher
   );

   const products = productsData?.products || [];
   const loading = (isAdmin || user?.brandId) ? isLoading : false;

   const handleDelete = async (id: number) => {
      if (confirm('Permanently remove this Product from your store?')) {
         try {
            const response = await fetch(`${API_URL}/api/products/${id}`, {
               method: 'DELETE'
            });
            if (response.ok) {
               const { mutate: globalMutate } = await import('swr');
               globalMutate(() => true);
               mutate();
               router.refresh();
            }
         } catch (error) {
            console.error('Error deleting Product:', error);
         }
      }
   };

   const exportToCSV = () => {
      if (!filteredProducts) return;
      const headers = ['ID', 'Name', 'Category', 'Price', 'Stock'];
      const rows = filteredProducts.map((p: any) => [
         p.id,
         `"${p.name}"`,
         `"${p.category?.name || 'N/A'}"`,
         p.price,
         p.stock || 0
      ]);

      const csvContent = "data:text/csv;charset=utf-8,"
         + headers.join(",") + "\n"
         + rows.map((e: any) => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   const filteredProducts = products?.filter((p: any) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
   ) || [];

   const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
   const paginatedProducts = React.useMemo(() => {
      return filteredProducts.slice(
         (currentPage - 1) * ITEMS_PER_PAGE,
         currentPage * ITEMS_PER_PAGE
      );
   }, [filteredProducts, currentPage]);

   return (
      <div className="space-y-10">
         {/* Internal Page Header */}
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
               <h2 className="text-3xl sm:text-4xl font-black text-[#0F7A4D] tracking-tighter uppercase">My Products</h2>
               <p className="text-[#6B7280] font-bold text-[10px] uppercase tracking-widest leading-relaxed">
                  Managing the inventory of <span className="text-[#0F7A4D]">{isAdmin ? "All Vendor Partners" : "Namma Reseller Store"}</span>
               </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
               <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={exportToCSV}
                  className="h-14 px-6 rounded-[20px] bg-white border border-[#E5E7EB] text-[#111827] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-slate-50 w-full sm:w-auto"
               >
                  <Download size={20} className="text-[#0F7A4D]" />
                  Export Ledger
               </motion.button>
               <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/vendor/products/new')}
                  className="h-14 px-8 rounded-[20px] bg-[#0F7A4D] text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#0c623d] transition-all shadow-[0_4px_12px_rgba(15,122,77,0.2)] w-full sm:w-auto"
               >
                  <Plus size={24} className="text-[#F59E0B]" />
                  New Product
               </motion.button>
            </div>
         </div>
 
         {/* Search & Filter Bar */}
         <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="flex-1 relative w-full">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
               <input
                  type="text"
                  placeholder="Search your inventory by name or category..."
                  className="w-full h-14 pl-16 pr-6 rounded-[20px] bg-white border border-[#E5E7EB] focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/5 transition-all outline-none font-bold text-[#111827] placeholder:text-slate-400 shadow-[0_4px_12px_rgba(0,0,0,0.02)] text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <button className="h-14 px-8 rounded-[20px] bg-white border border-[#E5E7EB] text-[#111827] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.02)] w-full sm:w-auto">
               <Filter size={18} />
               Filter View
            </button>
         </div>

         {/* Master Inventory Ledger */}
         <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden transition-colors duration-500 p-6 md:p-0">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto min-h-[280px]">
               <table className="w-full text-left border-collapse min-w-[1000px] admin-data-table">
                  <thead>
                     <tr className="bg-[#F8FAF7] border-b border-[#E5E7EB]">
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280]">Product Detail</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280]">Category</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280]">Status</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280]">Price</th>
                        <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-[#6B7280]">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                     {loading ? (
                        [1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)
                     ) : (
                        <AnimatePresence>
                           {paginatedProducts.map((product: any) => (
                              <motion.tr
                                 key={product.id}
                                 initial={{ opacity: 0, x: -10 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 exit={{ opacity: 0, scale: 0.95 }}
                                 className="group hover:bg-[#F8FAF7]/50 transition-all duration-300"
                              >
                                 <td className="px-10 py-8">
                                    <div className="flex items-center gap-6">
                                       <div className="h-16 w-16 rounded-[12px] bg-slate-50 overflow-hidden border border-[#E5E7EB] shrink-0 flex items-center justify-center">
                                          {product.image ? (
                                             <OptimizedImage
                                                src={product.image}
                                                alt={product.name}
                                                width={64}
                                                height={64}
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                             />
                                          ) : (
                                             <div className="h-full w-full bg-slate-100 flex flex-col items-center justify-center text-center p-1">
                                                <span className="text-[8px] leading-tight font-black uppercase text-slate-400">No Image</span>
                                             </div>
                                          )}
                                       </div>
                                       <div>
                                          <h4 className="text-[15px] font-black text-[#111827] leading-tight">{product.name}</h4>
                                          <p className="text-[10px] font-bold text-[#6B7280] mt-2 uppercase tracking-widest">ID-VND-20{product.id}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-10 py-8">
                                    <span className="px-4 py-2 rounded-full bg-[#DCFCE7] text-[#15803D] text-[10px] font-black uppercase tracking-widest">
                                       {product.category?.name || 'Uncategorized'}
                                    </span>
                                 </td>
                                 <td className="px-10 py-8">
                                    <div className="flex items-center gap-2">
                                       <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                          product.status === 'APPROVED' ? 'bg-[#DCFCE7] border-[#DCFCE7] text-[#15803D]' :
                                          product.status === 'PENDING' ? 'bg-[#FEF3C7] border-[#FEF3C7] text-[#B45309]' :
                                          product.status === 'REJECTED' ? 'bg-[#FEE2E2] border-[#FEE2E2] text-[#DC2626]' :
                                          'bg-[#F3F4F6] border-[#F3F4F6] text-[#4B5563]'
                                       }`}>
                                          {product.status || 'DRAFT'}
                                       </span>
                                    </div>
                                 </td>
                                 <td className="px-10 py-8 text-[16px] font-black text-[#111827] tracking-tighter">
                                    ₹{product.price}
                                 </td>
                                 <td className="px-10 py-8 text-right">
                                    <div className="flex items-center justify-end gap-3 transition-all">
                                       <motion.button
                                          whileHover={{ scale: 1.05, backgroundColor: '#0F7A4D', color: '#fff', borderColor: '#0F7A4D' }}
                                          onClick={() => router.push(`/vendor/products/edit?id=${product.id}`)}
                                          className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-[#E5E7EB] text-[#6B7280] transition-all shadow-sm"
                                       >
                                          <Edit2 size={18} />
                                       </motion.button>
                                       <motion.button
                                          whileHover={{ scale: 1.05, backgroundColor: '#DC2626', color: '#fff', borderColor: '#DC2626' }}
                                          onClick={() => handleDelete(product.id)}
                                          className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-[#E5E7EB] text-red-500 transition-all shadow-sm"
                                       >
                                          <Trash2 size={18} />
                                       </motion.button>
                                    </div>
                                 </td>
                              </motion.tr>
                           ))}
                        </AnimatePresence>
                     )}
                  </tbody>
               </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
               {loading ? (
                  [1, 2, 3].map(i => <CardSkeleton key={i} />)
               ) : paginatedProducts.length === 0 ? (
                  <div className="py-12 text-center text-[10px] font-black uppercase tracking-widest text-[#6B7280]">No products found</div>
               ) : (
                  <AnimatePresence>
                     {paginatedProducts.map((product: any) => (
                        <motion.div
                           key={product.id}
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, scale: 0.95 }}
                           className="bg-white border border-[#E5E7EB] rounded-[20px] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] space-y-4"
                        >
                           <div className="flex items-center gap-4">
                              <div className="h-16 w-16 rounded-[12px] bg-slate-50 overflow-hidden border border-[#E5E7EB] shrink-0 flex items-center justify-center">
                                 {product.image ? (
                                    <OptimizedImage
                                       src={product.image}
                                       alt={product.name}
                                       width={64}
                                       height={64}
                                       className="h-full w-full object-cover"
                                    />
                                 ) : (
                                    <div className="h-full w-full bg-slate-100 flex flex-col items-center justify-center text-center p-1">
                                       <span className="text-[8px] leading-tight font-black uppercase text-slate-400">No Image</span>
                                    </div>
                                 )}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="text-[14px] font-black text-[#111827] leading-tight truncate">{product.name}</h4>
                                 <p className="text-[9px] font-bold text-[#6B7280] mt-1 uppercase tracking-widest">ID-VND-20{product.id}</p>
                              </div>
                           </div>
                           <div className="grid grid-cols-3 gap-2 border-t border-b border-[#E5E7EB] py-3 text-left">
                              <div>
                                 <span className="text-[8px] font-black uppercase tracking-widest text-[#6B7280] block mb-1">Category</span>
                                 <span className="px-2 py-1 rounded-lg bg-[#DCFCE7] text-[#15803D] text-[8px] font-black uppercase tracking-widest block text-center truncate">
                                    {product.category?.name || 'N/A'}
                                 </span>
                              </div>
                              <div>
                                 <span className="text-[8px] font-black uppercase tracking-widest text-[#6B7280] block mb-1">Price</span>
                                 <span className="text-[13px] font-black text-[#111827] block mt-1">₹{product.price}</span>
                              </div>
                              <div>
                                 <span className="text-[8px] font-black uppercase tracking-widest text-[#6B7280] block mb-1">Status</span>
                                 <div className="flex items-center gap-1 mt-1">
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                       product.status === 'APPROVED' ? 'bg-[#DCFCE7] text-[#15803D]' :
                                       product.status === 'PENDING' ? 'bg-[#FEF3C7] text-[#B45309]' :
                                       product.status === 'REJECTED' ? 'bg-[#FEE2E2] text-[#DC2626]' :
                                       'bg-[#F3F4F6] text-[#4B5563]'
                                    }`}>
                                       {product.status || 'DRAFT'}
                                    </span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center justify-end gap-3 pt-1">
                              <button
                                 onClick={() => router.push(`/vendor/products/edit?id=${product.id}`)}
                                 className="h-10 px-4 rounded-xl bg-white border border-[#E5E7EB] text-[10px] font-black uppercase tracking-widest text-[#6B7280] hover:text-[#0F7A4D] hover:border-[#0F7A4D] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                              >
                                 <Edit2 size={13} />
                                 Edit
                              </button>
                              <button
                                 onClick={() => handleDelete(product.id)}
                                 className="h-10 px-4 rounded-xl bg-white border border-[#E5E7EB] text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                              >
                                 <Trash2 size={13} />
                                 Delete
                              </button>
                           </div>
                        </motion.div>
                     ))}
                  </AnimatePresence>
               )}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
               <div className="flex items-center justify-between border-t border-[#E5E7EB] px-10 py-8 animate-in fade-in duration-500">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">
                     Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex items-center gap-1.5">
                     <button
                        disabled={currentPage === 1}
                        onClick={() => { setCurrentPage(currentPage - 1); }}
                        className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:pointer-events-none active:scale-95 flex items-center gap-1"
                     >
                        Prev
                     </button>
                     {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                        if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                           return (
                              <button
                                 key={page}
                                 onClick={() => { setCurrentPage(page); }}
                                 className={`h-9 w-9 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center justify-center border ${currentPage === page
                                    ? 'bg-[#0F7A4D] text-white shadow-md border-[#0F7A4D]'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                              >
                                 {page}
                              </button>
                           );
                        }
                        if (page === 2 || page === totalPages - 1) {
                           return <span key={page} className="text-slate-300 text-xs px-1 select-none font-bold">...</span>;
                        }
                        return null;
                     })}
                     <button
                        disabled={currentPage === totalPages}
                        onClick={() => { setCurrentPage(currentPage + 1); }}
                        className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:pointer-events-none active:scale-95 flex items-center gap-1"
                     >
                        Next
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
