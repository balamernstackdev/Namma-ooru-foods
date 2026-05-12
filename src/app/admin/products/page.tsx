'use client'
import React, { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
   rating: number;
   reviews: number;
   tags: string[];
   description: string;
   variants: { id: number; name: string; price: number }[];
   highlights: string[];
   status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DRAFT';
}

export default function AdminProducts() {
   const router = useRouter();
   const { user } = useAuth();
   const [searchTerm, setSearchTerm] = useState('');
   const [statusFilter, setStatusFilter] = useState('all');
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 10;

   const isVendor = user?.role?.toLowerCase() === 'vendor';
   const fetchUrl = isVendor && user?.brandId
      ? `${API_URL}/api/products?brandId=${user?.brandId}&page=${currentPage}&limit=${itemsPerPage}&status=all`
      : `${API_URL}/api/products?page=${currentPage}&limit=${itemsPerPage}&status=${statusFilter}`;

   const { data, error, mutate } = useSWR(user ? fetchUrl : null, (url: string) => fetch(url).then(res => res.json()));
   const isLoading = !data && !error && !!user;

   const products: Product[] = data?.products || [];
   const totalPages = data?.totalPages || 1;

   const filteredProducts = products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const handleDelete = async (id: number) => {
      if (confirm('Are you sure you want to delete this product?')) {
         try {
            const response = await fetch(`${API_URL}/api/products/${id}`, {
               method: 'DELETE'
            });
            if (response.ok) {
               mutate();
            }
         } catch (error) {
            console.error('Error deleting product:', error);
         }
      }
   };

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
               <h2 className="text-4xl font-black text-[var(--admin-sidebar)] tracking-tighter uppercase">
                  {isVendor ? 'VENDOR PRODUCT REGISTRY' : 'PRODUCT REGISTRY'}
               </h2>

            </div>
            <Link
               href="/admin/products/create"
               className="h-14 px-8 rounded-2xl bg-emerald-600 !text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 no-underline"
            >
               <Plus size={18} className="!text-white" />
               Add New Product
            </Link>
         </div>

         {/* Command Bar */}
         <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-5">
            <div className="flex-1 flex items-center gap-5 bg-slate-50 border border-slate-100 px-8 py-4 rounded-2xl">
               <Search size={22} className="text-slate-300" />
               <input
                  type="text"
                  placeholder="Global search by SKU, name or metadata..."
                  className="bg-transparent border-none outline-none text-base font-bold text-[var(--admin-sidebar)] placeholder:text-slate-300 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <select
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="h-14 px-8 rounded-2xl border border-slate-100 text-[var(--admin-sidebar)] text-[11px] font-black uppercase tracking-widest bg-white outline-none focus:ring-2 focus:ring-[var(--admin-accent)] transition-all"
            >
               <option value="all">All Products</option>
               <option value="PENDING">Pending Review</option>
               <option value="APPROVED">Published</option>
               <option value="REJECTED">Rejected</option>
               <option value="DRAFT">Drafts</option>
            </select>
         </div>

         {/* Live Ledger Table */}
         <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50">
                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-100">Products</th>
                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-100">Category</th>
                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-100">Stock</th>
                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-100">Price</th>
                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 text-right border-b border-slate-100">Operations</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {isLoading ? (
                        <tr>
                           <td colSpan={5} className="px-10 py-32 text-center">
                              <div className="flex flex-col items-center gap-6">
                                 <div className="h-16 w-16 border-[6px] border-slate-100 border-t-[var(--admin-accent)] rounded-full animate-spin" />
                                 <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse">Synchronizing Global Ledger...</span>
                              </div>
                           </td>
                        </tr>
                     ) : (
                        filteredProducts.map((product) => (
                           <tr key={product.id} className="group hover:bg-slate-50/50 transition-all border-l-4 border-transparent hover:border-l-[var(--admin-accent)]">
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-all">
                                       <img src={product.image || '/ai_images/organic_grains_1776231059575.png'} className="h-full w-full object-cover" alt="" />
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-base font-black text-[var(--admin-sidebar)] tracking-tight">{product.name}</span>
                                       <div className="flex items-center gap-3 mt-1.5">
                                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${product.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                             product.status === 'PENDING' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                                product.status === 'REJECTED' ? 'bg-red-50 border-red-100 text-red-600' :
                                                   'bg-slate-50 border-slate-100 text-slate-400'
                                             }`}>
                                             {product.status || 'APPROVED'}
                                          </span>
                                          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">ID-NM-{1000 + product.id}</span>
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8">
                                 <span className="inline-block text-[11px] font-black uppercase tracking-widest text-[var(--admin-sidebar)] px-5 py-2 bg-slate-100 rounded-xl border border-slate-100/50">
                                    {product.category?.name || 'Traditional'}
                                 </span>
                              </td>
                              <td className="px-10 py-8">
                                 <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between w-36">
                                       <span className="text-xs font-black text-slate-600">65 Units</span>
                                       <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Stock OK</span>
                                    </div>
                                    <div className="h-2 w-36 bg-slate-100 rounded-full overflow-hidden">
                                       <div className="h-full bg-emerald-500 w-[75%]" />
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8">
                                 <span className="text-xl font-black text-[var(--admin-sidebar)] tracking-tighter group-hover:text-[var(--admin-accent)] transition-colors">₹{Number(product.price).toLocaleString()}</span>
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <div className="flex items-center justify-end gap-3 transition-all duration-300">
                                    {product.status === 'PENDING' && !isVendor && (
                                       <>
                                          <button
                                             onClick={() => handleStatusChange(product.id, 'APPROVED')}
                                             className="h-12 px-4 flex items-center justify-center rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                                             title="Approve"
                                          >
                                             Approve
                                          </button>
                                          <button
                                             onClick={() => {
                                                const note = prompt('Reason for rejection?');
                                                if (note) handleStatusChange(product.id, 'REJECTED');
                                             }}
                                             className="h-12 px-4 flex items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-100 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all"
                                             title="Reject"
                                          >
                                             Reject
                                          </button>
                                       </>
                                    )}
                                    <Link
                                       href={`/admin/products/edit/${product.id}`}
                                       className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-[var(--admin-sidebar)] hover:text-white hover:border-[var(--admin-sidebar)] transition-all shadow-sm"
                                       title="Edit Product"
                                    >
                                       <Edit2 size={18} />
                                    </Link>
                                    <button
                                       onClick={() => handleDelete(product.id)}
                                       className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-red-300 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                                       title="Delete Product"
                                    >
                                       <Trash2 size={18} />
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
