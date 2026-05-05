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
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function VendorProducts() {
   const { user } = useAuth();
   const router = useRouter();
   const [searchTerm, setSearchTerm] = useState('');

   const { data: products, error, mutate, isLoading } = useSWR<Product[]>(
      user?.brandId ? `${API_URL}/api/products?brandId=${user.brandId}&status=all` : null,
      fetcher
   );

   const loading = user?.brandId ? isLoading : false;

   const handleDelete = async (id: number) => {
      if (confirm('Permanently remove this harvest from your store?')) {
         try {
            const response = await fetch(`${API_URL}/api/products/${id}`, {
               method: 'DELETE'
            });
            if (response.ok) {
               mutate(products?.filter(p => p.id !== id), false);
            }
         } catch (error) {
            console.error('Error deleting harvest:', error);
         }
      }
   };

   const exportToCSV = () => {
      if (!filteredProducts) return;
      const headers = ['ID', 'Name', 'Category', 'Price', 'Stock'];
      const rows = filteredProducts.map(p => [
         p.id,
         `"${p.name}"`,
         `"${p.category?.name || 'N/A'}"`,
         p.price,
         p.stock || 0
      ]);

      const csvContent = "data:text/csv;charset=utf-8,"
         + headers.join(",") + "\n"
         + rows.map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   const filteredProducts = products?.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
   ) || [];

   // loading is defined above

   return (
      <div className="space-y-10">
         {/* Internal Page Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-1">
               <h2 className="text-4xl font-black text-emerald-950 dark:text-white tracking-tighter uppercase">My Harvests</h2>
               <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest leading-relaxed">
                  Managing the inventory of <span className="text-emerald-900 dark:text-emerald-400">Namma Reseller Store</span>
               </p>
            </div>
            <div className="flex items-center gap-4">
               <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportToCSV}
                  className="h-16 px-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-emerald-950 dark:text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
               >
                  <Download size={20} className="text-emerald-600" />
                  Export Ledger
               </motion.button>
               <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/vendor/products/new')}

                  className="h-16 px-10 rounded-2xl bg-emerald-950 dark:bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20"
               >
                  <Plus size={24} className="text-amber-400" />
                  New Product
               </motion.button>
            </div>
         </div>

         {/* Search & Filter Bar */}
         <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
               <input
                  type="text"
                  placeholder="Search your inventory by name or category..."
                  className="w-full h-16 pl-16 pr-6 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 focus:border-emerald-100 focus:ring-4 focus:ring-emerald-50 dark:focus:ring-emerald-900/10 transition-all outline-none font-bold text-emerald-950 dark:text-white placeholder:text-slate-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <button className="h-16 px-8 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-emerald-950 dark:text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
               <Filter size={18} />
               Filter View
            </button>
         </div>

         {/* Master Inventory Ledger */}
         <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-500">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                     <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Product Detail</th>
                     <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                     <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                     <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Price</th>
                     <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {loading ? (
                     [1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)
                  ) : (
                     <AnimatePresence>
                        {filteredProducts.map((product) => (
                           <motion.tr
                              key={product.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-300"
                           >
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-800 shrink-0">
                                       <OptimizedImage
                                          src={product.image || '/placeholder-harvest.jpg'}
                                          alt={product.name}
                                          width={64}
                                          height={64}
                                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                       />
                                    </div>
                                    <div>
                                       <h4 className="text-[15px] font-black text-emerald-950 dark:text-white leading-tight">{product.name}</h4>
                                       <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">ID-VND-20{product.id}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8">
                                 <span className="px-5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
                                    {product.category?.name}
                                 </span>
                              </td>
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-2.5">
                                    <div className={`h-2 w-2 rounded-full ${
                                       product.status === 'APPROVED' ? 'bg-emerald-500' : 
                                       product.status === 'PENDING' ? 'bg-amber-500' : 
                                       product.status === 'REJECTED' ? 'bg-red-500' : 'bg-slate-400'
                                    } animate-pulse`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                       product.status === 'APPROVED' ? 'text-emerald-950 dark:text-emerald-100' :
                                       product.status === 'PENDING' ? 'text-amber-700 dark:text-amber-400' :
                                       product.status === 'REJECTED' ? 'text-red-700 dark:text-red-400' : 'text-slate-500'
                                    }`}>
                                       {product.status || 'DRAFT'}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-10 py-8 text-[16px] font-black text-emerald-950 dark:text-white tracking-tighter">
                                 ₹{product.price}
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <div className="flex items-center justify-end gap-3 transition-all">
                                    <motion.button
                                       whileHover={{ scale: 1.1, backgroundColor: '#064e3b', color: '#fff' }}
                                       onClick={() => router.push(`/vendor/products/edit?id=${product.id}`)}
                                       className="h-12 w-12 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-400 transition-all shadow-sm"
                                    >
                                       <Edit2 size={18} />
                                    </motion.button>
                                    <motion.button
                                       whileHover={{ scale: 1.1, backgroundColor: '#ef4444', color: '#fff' }}
                                       onClick={() => handleDelete(product.id)}
                                       className="h-12 w-12 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-red-300 transition-all shadow-sm"
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
      </div>
   );
}
