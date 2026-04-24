'use client'
import React, { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
}

export default function AdminProducts() {
   const router = useRouter();
   const { user } = useAuth();
   const [products, setProducts] = useState<Product[]>([]);
   const [searchTerm, setSearchTerm] = useState('');

   const isVendor = user?.role?.toLowerCase() === 'vendor';
   const fetchUrl = isVendor && user?.brandId 
      ? `${API_URL}/api/products?brandId=${user?.brandId}` 
      : `${API_URL}/api/products`;

   const { data: swrProducts, error, mutate } = useSWR(user ? fetchUrl : null, (url: string) => fetch(url).then(res => res.json()));
   const isLoading = !swrProducts && !error && !!user;

   // Manage local state for immediate deletion optimistics, initialize from SWR when available
   React.useEffect(() => {
      if (swrProducts) setProducts(swrProducts);
   }, [swrProducts]);
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
               setProducts(products.filter(p => p.id !== id));
            }
         } catch (error) {
            console.error('Error deleting product:', error);
         }
      }
   };

   return (
      <div className="space-y-8 animate-in fade-in duration-700">
         {/* Page Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
               <h2 className="text-4xl font-black text-[var(--admin-sidebar)] tracking-tighter">
                  {isVendor ? 'Vendor Inventory' : 'Global Inventory'}
               </h2>
               <p className="text-slate-400 font-medium text-sm">
                  {isVendor ? 'Managing your premium brand harvests.' : 'Synchronizing the physical harvest with the digital storefront.'}
               </p>
            </div>
            <button
               onClick={() => router.push('/admin/products/create')}
               className="h-16 px-10 rounded-2xl bg-[var(--admin-sidebar)] text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-2xl shadow-slate-900/20 active:scale-95"
            >
               <Plus size={24} className="text-[var(--admin-accent)]" />
               Onboard New Product
            </button>
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
            <button className="h-14 px-8 rounded-2xl border border-slate-100 text-[var(--admin-sidebar)] text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all">
               <Filter size={18} />
               Filter Stream
            </button>
         </div>

         {/* Live Ledger Table */}
         <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50">
                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-100">Harvest Details</th>
                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-100">Taxonomy</th>
                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-100">Inventory</th>
                        <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-slate-100">Valuation</th>
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
                                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                          ID-NM-{1000 + product.id}
                                       </span>
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
                                    <button
                                       onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                                       className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-[var(--admin-sidebar)] hover:text-white hover:border-[var(--admin-sidebar)] transition-all shadow-sm"
                                       title="Edit Product"
                                    >
                                       <Edit2 size={18} />
                                    </button>
                                    <button
                                       onClick={() => handleDelete(product.id)}
                                       className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-red-300 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
                                       title="Delete Product"
                                    >
                                       <Trash2 size={18} />
                                    </button>
                                    <button 
                                       onClick={() => window.open(`/product/${product.id}`, '_blank')}
                                       className="h-12 w-12 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                       title="View Live"
                                    >
                                       <ExternalLink size={18} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
}
