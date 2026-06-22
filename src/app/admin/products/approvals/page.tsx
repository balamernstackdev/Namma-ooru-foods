'use client'
import React, { useState } from 'react';
import { Search, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminPagination from '@/components/admin/AdminPagination';
import { ActionGroup, PremiumActionButton, ViewButton } from '@/components/ui/ActionButtons';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

interface Product {
   id: number;
   name: string;
   category: any;
   brand?: any;
   subVendor?: any;
   price: number;
   originalPrice: number;
   image: string;
   status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DRAFT';
}

export default function ProductApprovals() {
   const router = useRouter();
   const { user } = useAuth();
   const [searchTerm, setSearchTerm] = useState('');
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 10;

   const fetchUrl = `${API_URL}/api/products?page=${currentPage}&limit=${itemsPerPage}&status=PENDING`;

   const { data, error, mutate } = useSWR(user ? fetchUrl : null, (url: string) => fetch(url).then(res => res.json()));
   const isLoading = !data && !error && !!user;

   const products: Product[] = data?.products || [];
   const totalPages = data?.totalPages || 1;

   const filteredProducts = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subVendor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const handleStatusChange = async (id: number, status: string) => {
      try {
         const response = await fetch(`${API_URL}/api/products/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
         });
         if (response.ok) {
            mutate();
         }
      } catch (error) {
         console.error('Error updating status:', error);
      }
   };

   return (
      <div className="space-y-8 animate-in fade-in duration-700 pb-20">
         {/* Page Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
               <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">
                  Vendor Products <span className="text-emerald-600">Approvals</span>
               </h1>
               <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Review and approve products submitted by vendors</p>
            </div>
         </div>

         {/* Command Bar */}
         <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-5 bg-slate-50 border border-slate-100 px-8 py-4 rounded-2xl">
               <Search size={22} className="text-slate-300" />
               <input
                  type="text"
                  placeholder="Search by product name or vendor..."
                  className="bg-transparent border-none outline-none text-base font-bold text-[var(--admin-sidebar)] placeholder:text-slate-300 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>

         {/* Approval Table */}
         {/* Desktop View */}
         <div className="hidden md:block bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[1000px] admin-data-table">
                  <thead>
                     <tr className="bg-slate-50/50">
                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-100">Product & Vendor</th>
                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-100">Category</th>
                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-100">Price</th>
                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 text-right border-b border-slate-100">Decisions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {isLoading ? (
                        <tr>
                           <td colSpan={4} className="px-10 py-32 text-center">
                              <div className="flex flex-col items-center gap-6">
                                 <div className="h-16 w-16 border-[6px] border-slate-100 border-t-[var(--admin-accent)] rounded-full animate-spin" />
                                 <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse">Scanning for submissions...</span>
                              </div>
                           </td>
                        </tr>
                     ) : filteredProducts.length === 0 ? (
                        <tr>
                           <td colSpan={4} className="px-10 py-32 text-center">
                              <div className="flex flex-col items-center gap-4">
                                 <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                                    <CheckCircle size={40} />
                                 </div>
                                 <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">No pending approvals.</span>
                              </div>
                           </td>
                        </tr>
                     ) : (
                        filteredProducts.map((product) => (
                           <tr key={product.id} className="group hover:bg-slate-50/50 transition-all border-l-4 border-transparent hover:border-l-amber-400">
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 overflow-hidden shrink-0 shadow-sm">
                                       <img src={product.image || '/ai_images/organic_grains_1776231059575.png'} className="h-full w-full object-cover" alt="" />
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-base font-black text-[var(--admin-sidebar)] tracking-tight">{product.name}</span>
                                       <span className="text-[10px] text-amber-600 font-black uppercase tracking-widest mt-1">Vendor: {product.subVendor?.name || product.brand?.name || 'Local Producer'}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8">
                                 <span className="inline-block text-[11px] font-black uppercase tracking-widest text-[var(--admin-sidebar)] px-5 py-2 bg-slate-100 rounded-xl">
                                    {product.category?.name || 'Traditional'}
                                 </span>
                              </td>
                              <td className="px-10 py-8">
                                 <span className="text-xl font-black text-[var(--admin-sidebar)] tracking-tighter">₹{Number(product.price).toLocaleString()}</span>
                              </td>
                              <td className="px-10 py-8 text-right w-[180px] min-w-[180px]">
                                 <ActionGroup className="flex-nowrap">
                                    {product.status === 'PENDING' && (
                                       <>
                                          <PremiumActionButton 
                                             icon={CheckCircle} 
                                             tooltip="Approve" 
                                             variant="approve" 
                                             onClick={() => handleStatusChange(product.id, 'APPROVED')} 
                                          />
                                          <PremiumActionButton 
                                             icon={XCircle} 
                                             tooltip="Reject" 
                                             variant="suspend" 
                                             onClick={() => {
                                                const note = prompt('Reason for rejection?');
                                                if (note) handleStatusChange(product.id, 'REJECTED');
                                             }}
                                          />
                                       </>
                                    )}
                                    {product.status === 'APPROVED' && (
                                       <PremiumActionButton 
                                          icon={XCircle} 
                                          tooltip="Suspend" 
                                          variant="suspend" 
                                          onClick={() => handleStatusChange(product.id, 'REJECTED')} 
                                       />
                                    )}
                                    {product.status === 'REJECTED' && (
                                       <PremiumActionButton 
                                          icon={CheckCircle} 
                                          tooltip="Re-Approve" 
                                          variant="approve" 
                                          onClick={() => handleStatusChange(product.id, 'APPROVED')} 
                                       />
                                    )}
                                    <ViewButton 
                                       tooltip="Review Details" 
                                       onClick={() => router.push(`/admin/products/edit/${product.id}`)} 
                                    />
                                 </ActionGroup>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
            <AdminPagination
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={setCurrentPage}
            />
         </div>

         {/* Mobile View */}
         <div className="block md:hidden divide-y divide-slate-100 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm space-y-4">
            {isLoading ? (
               <div className="py-20 text-center">
                  <div className="h-12 w-12 border-4 border-slate-100 border-t-[var(--admin-accent)] rounded-full animate-spin mx-auto" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mt-4 block">Scanning submissions...</span>
               </div>
            ) : filteredProducts.length === 0 ? (
               <div className="py-20 text-center">
                  <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mx-auto mb-4">
                     <CheckCircle size={28} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">No pending approvals.</span>
               </div>
            ) : (
               filteredProducts.map((product) => (
                  <div key={product.id} className="py-4 space-y-3">
                     <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-white border border-slate-100 overflow-hidden shrink-0 shadow-sm">
                           <img src={product.image || '/ai_images/organic_grains_1776231059575.png'} className="h-full w-full object-cover" alt="" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                           <span className="text-sm font-black text-[var(--admin-sidebar)] tracking-tight truncate">{product.name}</span>
                           <span className="text-[10px] text-amber-600 font-black uppercase tracking-widest mt-1">Vendor: {product.subVendor?.name || product.brand?.name || 'Local Producer'}</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-2 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 text-xs">
                        <div>
                           <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Category</span>
                           <span className="font-bold text-slate-800">{product.category?.name || 'Traditional'}</span>
                        </div>
                        <div>
                           <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Price</span>
                           <span className="font-black text-slate-900 font-mono text-sm">₹{Number(product.price).toLocaleString()}</span>
                        </div>
                     </div>

                     <div className="flex items-center gap-2 justify-end pt-1">
                        <button
                           onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                           className="h-11 flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all"
                        >
                           Review Details
                        </button>
                        {product.status === 'PENDING' && (
                           <>
                              <button
                                 onClick={() => {
                                    const note = prompt('Reason for rejection?');
                                    if (note) handleStatusChange(product.id, 'REJECTED');
                                 }}
                                 className="h-11 px-4 flex items-center justify-center rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-500 hover:text-white transition-all font-bold text-xs"
                                 title="Reject"
                              >
                                 Reject
                              </button>
                              <button
                                 onClick={() => handleStatusChange(product.id, 'APPROVED')}
                                 className="h-11 px-4 flex items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all font-bold text-xs"
                                 title="Approve"
                              >
                                 Approve
                              </button>
                           </>
                        )}
                        {product.status === 'APPROVED' && (
                           <button
                              onClick={() => handleStatusChange(product.id, 'REJECTED')}
                              className="h-11 px-4 flex items-center justify-center rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-500 hover:text-white transition-all text-xs font-bold"
                           >
                              Suspend
                           </button>
                        )}
                        {product.status === 'REJECTED' && (
                           <button
                              onClick={() => handleStatusChange(product.id, 'APPROVED')}
                              className="h-11 px-4 flex items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-xs font-bold"
                           >
                              Re-Approve
                           </button>
                        )}
                     </div>
                  </div>
               ))
            )}
            <AdminPagination
               currentPage={currentPage}
               totalPages={totalPages}
               onPageChange={setCurrentPage}
            />
         </div>
      </div>
   );
}
