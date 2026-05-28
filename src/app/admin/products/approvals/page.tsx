'use client'
import React, { useState } from 'react';
import { Search, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminPagination from '@/components/admin/AdminPagination';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

interface Product {
   id: number;
   name: string;
   category: any;
   brand: any;
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
      p.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
               <h2 className="text-4xl font-black text-[var(--admin-sidebar)] tracking-tighter">
                  Vendor Products Approvals
               </h2>
               <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Review and approve products submitted by vendors</p>
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
         <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
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
                                 <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">All caught up! No pending approvals.</span>
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
                                       <span className="text-[10px] text-amber-600 font-black uppercase tracking-widest mt-1">Vendor: {product.brand?.name || 'Local Producer'}</span>
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
                              <td className="px-10 py-8 text-right">
                                 <div className="flex items-center justify-end gap-3">
                                    <button
                                       onClick={() => handleStatusChange(product.id, 'APPROVED')}
                                       className="h-12 px-6 flex items-center justify-center rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 gap-2"
                                    >
                                       <CheckCircle size={14} />
                                       Approve
                                    </button>
                                    <button
                                       onClick={() => {
                                          const note = prompt('Reason for rejection?');
                                          if (note) handleStatusChange(product.id, 'REJECTED');
                                       }}
                                       className="h-12 px-6 flex items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all gap-2"
                                    >
                                       <XCircle size={14} />
                                       Reject
                                    </button>
                                    <button
                                       onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                                       className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
                                       title="Review Details"
                                    >
                                       <Edit2 size={16} />
                                    </button>
                                 </div>
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
      </div>
   );
}
