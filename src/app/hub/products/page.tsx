'use client';

import React, { useState } from 'react';
import { 
   Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Package, 
   LayoutGrid, List, MoreHorizontal, Square, CheckSquare, Eye, 
   Check, X, ShieldAlert, ChevronDown, ArrowUpDown, Download, Filter,
   AlertTriangle, Store
} from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePlatformSettings } from '@/context/PlatformSettingsContext';
import { useToast } from '@/context/ToastContext';
import AdminPagination from '@/components/admin/AdminPagination';
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
   slug?: string;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
   APPROVED: { label: 'Published', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
   PENDING: { label: 'Pending', dot: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
   REJECTED: { label: 'Rejected', dot: 'bg-red-400', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
   DRAFT: { label: 'Draft', dot: 'bg-slate-300', bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200' },
};

interface DropdownProps {
   label: string;
   value: string;
   options: { label: string; value: string }[];
   onChange: (val: string) => void;
   icon?: React.ReactNode;
}

function CustomFilterDropdown({ label, value, options, onChange, icon }: DropdownProps) {
   const [open, setOpen] = useState(false);
   const selectedOption = options.find(o => String(o.value) === String(value));
   return (
      <div className="relative w-full sm:w-auto">
         <button
            onClick={() => setOpen(!open)}
            className={`h-11 px-4 rounded-2xl border text-xs font-bold flex items-center justify-between sm:justify-start gap-2 transition-all w-full sm:w-auto ${
               value !== 'all' && value !== ''
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
         >
            <span className="flex items-center gap-2">
               {icon}
               <span>
                  {label}: {selectedOption?.label || 'All'}
               </span>
            </span>
            <ChevronDown size={12} className="ml-auto sm:ml-0" />
         </button>
         {open && (
            <>
               <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
               <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-56 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                  {options.map(o => (
                     <button
                        key={o.value}
                        onClick={() => {
                           onChange(o.value);
                           setOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                           String(value) === String(o.value)
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'text-slate-600 hover:bg-slate-50'
                        }`}
                     >
                        {o.label}
                     </button>
                  ))}
               </div>
            </>
         )}
      </div>
   );
}

export default function HubProducts() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const pathname = usePathname();
   const { user } = useAuth();
   const { settings } = usePlatformSettings();
   const { addToast } = useToast();

   // URL state synchronization
   const urlSearch = searchParams.get('search') || '';
   const statusFilter = searchParams.get('status') || 'all';
   const brandFilter = searchParams.get('brandId') || 'all';
   const categoryFilter = searchParams.get('category') || 'all';
   const sortOrder = searchParams.get('sort') || 'latest';
   const currentPage = parseInt(searchParams.get('page') || '1');

   const [searchTerm, setSearchTerm] = useState(urlSearch);
   const [showExportMenu, setShowExportMenu] = useState(false);


   const itemsPerPage = 12;

   // Sync local search term with URL changes (e.g. if cleared from chip)
   React.useEffect(() => {
      setSearchTerm(urlSearch);
   }, [urlSearch]);

   // Helper to update query parameters in URL
   const updateQueryParams = (newParams: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(newParams).forEach(([key, value]) => {
         if (value === null || value === undefined || value === 'all' || value === '') {
            params.delete(key);
         } else {
            params.set(key, String(value));
         }
      });
      // Reset page to 1 when changing filters
      if (!newParams.hasOwnProperty('page')) {
         params.delete('page');
      }
      router.push(`${pathname}?${params.toString()}`);
   };

   // Debounce search term and write to URL query
   React.useEffect(() => {
      const handler = setTimeout(() => {
         if (searchTerm !== urlSearch) {
            updateQueryParams({ search: searchTerm });
         }
      }, 300);
      return () => clearTimeout(handler);
   }, [searchTerm]);

   // Fetch options data
   const fetcherAuth = (url: string) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
      return fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(r => r.json());
   };

   const { data: categoriesData } = useSWR(`${API_URL}/api/categories?all=true&limit=1000`, fetcherAuth);
   const { data: brandsData } = useSWR(`${API_URL}/api/vendor-hub/sub-vendors?limit=1000`, fetcherAuth);
   const { data: statsData } = useSWR(`${API_URL}/api/vendor-hub/dashboard`, fetcherAuth);

   // Build API fetch URL with server-side pagination, search, status, brand, category, sorting
   const fetchUrl = `${API_URL}/api/vendor-hub/products?page=${currentPage}&limit=${itemsPerPage}` +
      (statusFilter !== 'all' ? `&status=${statusFilter}` : '') +
      (brandFilter !== 'all' ? `&subVendorId=${brandFilter}` : '') +
      (categoryFilter !== 'all' ? `&category=${categoryFilter}` : '') +
      (urlSearch ? `&search=${encodeURIComponent(urlSearch)}` : '') +
      `&sort=${sortOrder}`;

   const { data, error, mutate } = useSWR(user ? fetchUrl : null, fetcherAuth);
   const isLoading = !data && !error && !!user;

   const products: Product[] = data?.products || [];
   const calculatedTotalPages = data?.totalPages || 1;

   const getStock = (p: Product) => {
      if (p.variants && p.variants.length > 0) {
         return p.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
      }
      return p.stock ?? 65;
   };


   const handleExport = async (format: 'CSV' | 'EXCEL' | 'PDF') => {
      addToast('Info', `Preparing product export as ${format}...`);
      try {
         const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
         const exportUrl = `${API_URL}/api/vendor-hub/products?limit=10000` +
            (statusFilter !== 'all' ? `&status=${statusFilter}` : '') +
            (brandFilter !== 'all' ? `&subVendorId=${brandFilter}` : '') +
            (categoryFilter !== 'all' ? `&category=${categoryFilter}` : '') +
            (urlSearch ? `&search=${encodeURIComponent(urlSearch)}` : '') +
            `&sort=${sortOrder}`;

         const res = await fetch(exportUrl, { headers: { Authorization: `Bearer ${token}` } });
         const expData = await res.json();
         const allMatching: Product[] = expData?.products || [];

         if (allMatching.length === 0) {
            addToast('Error', 'No products available to export');
            return;
         }

         setTimeout(() => {
            const headers = ["S.No", "Product ID", "Product Name", "Category", "Vendor / Brand", "Price (INR)", "Original Price (INR)", "Stock Count", "Stock Status", "Approval Status"];

            const rows = allMatching.map((p, index) => {
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
            downloadAnchor.setAttribute("download", `hub_products_export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            URL.revokeObjectURL(url);

            addToast('Success', 'Products exported successfully');
         }, 500);
      } catch (err) {
         console.error(err);
         addToast('Error', 'Failed to generate product export');
      }
   };


   const statusOptions = [
      { label: 'All Statuses', value: 'all' },
      { label: 'Published', value: 'APPROVED' },
      { label: 'Pending Review', value: 'PENDING' },
      { label: 'Rejected', value: 'REJECTED' },
      { label: 'Drafts', value: 'DRAFT' },
   ];

   const sortOptions = [
      { label: 'Latest First', value: 'latest' },
      { label: 'Oldest First', value: 'oldest' },
      { label: 'Alphabetical', value: 'alphabetical' },
      { label: 'Price: Low to High', value: 'price-low' },
      { label: 'Price: High to Low', value: 'price-high' },
      { label: 'Stock: Low to High', value: 'stock-low' },
      { label: 'Stock: High to Low', value: 'stock-high' }
   ];

   const brandOptions = [
      { label: 'All Vendors', value: 'all' },
      ...(brandsData?.subVendors?.map((b: any) => ({ label: b.name, value: String(b.id) })) || [])
   ];

   const categoryOptions = [
      { label: 'All Categories', value: 'all' },
      ...(categoriesData?.categories?.map((c: any) => ({ label: c.name, value: String(c.id) })) || [])
   ];

   // Lookup display names for filter chips
   const selectedBrandName = brandsData?.subVendors?.find((b: any) => String(b.id) === String(brandFilter))?.name || `Vendor ID ${brandFilter}`;
   const selectedCategoryName = categoriesData?.categories?.find((c: any) => String(c.id) === String(categoryFilter))?.name || `Category ID ${categoryFilter}`;

   return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-12">
         {/* Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
               <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">
                  Hub Product <span className="text-emerald-600">Management</span>
               </h1>
               <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Manage and monitor all products uploaded by vendors assigned to your regional hub.</p>
            </div>
         </div>

         {/* Stats Cards */}
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
               { label: 'Total Products', value: statsData?.totalProducts || 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
               { label: 'Pending Approval', value: statsData?.pendingProducts || 0, icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50' },
               { label: 'Approved Products', value: statsData?.approvedProducts || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
               { label: 'Rejected Products', value: statsData?.rejectedProducts || 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
               { label: 'Out of Stock', value: statsData?.outOfStockProducts || 0, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
               { label: 'Active Vendors', value: statsData?.activeVendors || 0, icon: Store, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            ].map((stat, i) => {
               const Icon = stat.icon;
               return (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                           <Icon size={16} />
                        </div>
                        <div>
                           <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">{stat.label}</div>
                           <div className="text-lg font-black text-slate-900 leading-none mt-1">{stat.value}</div>
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>

         {/* Bespoke Advanced Filter Toolbar */}
         <div className="sticky top-2 z-30 bg-white/80 backdrop-blur-md border border-slate-100 rounded-[2rem] p-3 shadow-md shadow-slate-900/5 flex flex-col gap-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
               
               {/* Search Box */}
               <div className="relative w-full lg:w-[40%]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                     type="text"
                     placeholder="Search by Product Name, SKU, Product ID, Vendor Name, Vendor ID, Category..."
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                     className="w-full h-11 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-10 text-xs font-bold outline-none focus:bg-white focus:border-emerald-600 transition-all"
                  />
                  {searchTerm && (
                     <button 
                        onClick={() => { setSearchTerm(''); updateQueryParams({ search: '' }); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-red-500 text-slate-400 transition-colors"
                     >
                        <X size={14} />
                     </button>
                  )}
               </div>

               {/* Right Filter Dropdowns Menu */}
               <div className="flex flex-wrap items-center gap-2 justify-end w-full lg:w-auto">
                  
                  {/* Category Filter */}
                  <CustomFilterDropdown
                     label="Category"
                     value={categoryFilter}
                     options={categoryOptions}
                     onChange={(val) => updateQueryParams({ category: val })}
                     icon={<LayoutGrid size={14} />}
                  />

                  {/* Vendor Filter */}
                  <CustomFilterDropdown
                     label="Vendor"
                     value={brandFilter}
                     options={brandOptions}
                     onChange={(val) => updateQueryParams({ brandId: val })}
                     icon={<Package size={14} />}
                  />

                  {/* Status Filter */}
                  <CustomFilterDropdown
                     label="Status"
                     value={statusFilter}
                     options={statusOptions}
                     onChange={(val) => updateQueryParams({ status: val })}
                     icon={<Filter size={14} />}
                  />

                  {/* Sort Filter */}
                  <CustomFilterDropdown
                     label="Sort"
                     value={sortOrder}
                     options={sortOptions}
                     onChange={(val) => updateQueryParams({ sort: val })}
                     icon={<ArrowUpDown size={14} />}
                  />

                  {/* Export Options */}
                  <div className="relative w-full sm:w-auto">
                     <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="h-11 px-4 rounded-2xl border border-slate-200 bg-white text-xs font-bold text-slate-600 flex items-center justify-between sm:justify-start gap-2 hover:bg-slate-50 transition-all w-full sm:w-auto"
                     >
                        <span className="flex items-center gap-2">
                           <Download size={14} />
                           <span>Export</span>
                        </span>
                        <ChevronDown size={12} className="ml-auto sm:ml-0" />
                     </button>

                     {showExportMenu && (
                        <>
                           <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                           <div className="absolute right-0 mt-2 w-full sm:w-40 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                              {(['CSV', 'EXCEL', 'PDF'] as const).map(format => (
                                 <button
                                    key={format}
                                    onClick={() => {
                                       handleExport(format);
                                       setShowExportMenu(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                 >
                                    Export as {format}
                                 </button>
                              ))}
                           </div>
                        </>
                     )}
                  </div>
               </div>
            </div>


         </div>

         {/* Active Filter Chips */}
         {(urlSearch || statusFilter !== 'all' || brandFilter !== 'all' || categoryFilter !== 'all') && (
            <div className="flex flex-wrap items-center gap-2 py-1 animate-in fade-in duration-300">
               <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Active Filters:</span>
               
               {urlSearch && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 shadow-sm">
                     Search: "{urlSearch}"
                     <button onClick={() => updateQueryParams({ search: '' })} className="hover:text-red-500 transition-colors cursor-pointer">
                        <X size={11} />
                     </button>
                  </span>
               )}

               {statusFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 shadow-sm">
                     Status: {STATUS_CONFIG[statusFilter]?.label || statusFilter}
                     <button onClick={() => updateQueryParams({ status: 'all' })} className="hover:text-red-500 transition-colors cursor-pointer">
                        <X size={11} />
                     </button>
                  </span>
               )}

               {brandFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 shadow-sm">
                     Vendor: {selectedBrandName}
                     <button onClick={() => updateQueryParams({ brandId: 'all' })} className="hover:text-red-500 transition-colors cursor-pointer">
                        <X size={11} />
                     </button>
                  </span>
               )}

               {categoryFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200 shadow-sm">
                     Category: {selectedCategoryName}
                     <button onClick={() => updateQueryParams({ category: 'all' })} className="hover:text-red-500 transition-colors cursor-pointer">
                        <X size={11} />
                     </button>
                  </span>
               )}

               <button
                  onClick={() => updateQueryParams({ search: '', status: 'all', brandId: 'all', category: 'all' })}
                  className="text-[9px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-800 transition-colors underline cursor-pointer"
               >
                  Clear All
               </button>
            </div>
         )}

         {/* Listing table */}
         <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mt-4">
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto min-h-[280px]">
               <table className="w-full text-left border-collapse min-w-[1000px] admin-data-table">
                  <thead>
                     <tr className="bg-slate-50/50">
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
                     ) : products.length === 0 ? (
                        <tr>
                           <td colSpan={6} className="py-20 text-center">
                              <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                                 <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                                    <Package size={20} />
                                 </div>
                                 <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">No products found</h4>
                                 <p className="text-[10px] text-slate-400 font-bold">
                                    No products matched your search or filters. Try adjusting your filter parameters or search term.
                                 </p>
                              </div>
                           </td>
                        </tr>
                     ) : (
                        products.map(product => {
                           const stock = getStock(product);
                           const stockPct = Math.min(100, (stock / 100) * 100);
                           const isLow = stock < 20;

                           return (
                              <tr key={product.id} className="group hover:bg-slate-50/40 transition-colors">

                                 <td className="px-6 py-4 border-b border-slate-50">
                                    <div className="flex items-center gap-3">
                                       <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 shadow-sm">
                                          <img
                                             src={product.image || settings?.logo || '/logo.webp'}
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
                                                <button
                                                   onClick={(e) => {
                                                      e.stopPropagation();
                                                      updateQueryParams({ brandId: product.subVendor ? String(product.subVendor.id) : null });
                                                   }}
                                                   className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 hover:text-indigo-800 transition-colors cursor-pointer"
                                                >
                                                   {product.subVendor.name}
                                                </button>
                                             )}
                                             <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">
                                                ID: NM-00{product.id}
                                             </span>
                                          </div>
                                       </div>
                                    </div>
                                 </td>

                                 <td className="px-6 py-4 border-b border-slate-50">
                                    <button
                                       onClick={() => updateQueryParams({ category: product.category?.id })}
                                       className="inline-block text-[10px] font-black uppercase tracking-wider text-slate-600 px-3 py-1.5 bg-slate-50 rounded-xl whitespace-nowrap max-w-[160px] truncate hover:bg-slate-100 transition-colors cursor-pointer text-left border-0"
                                    >
                                       {product.category?.name || 'Heritage Foods'}
                                    </button>
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

                                 <td className={`px-6 py-4 text-right border-b border-slate-50 relative`}>
                                    <div className="flex items-center justify-end gap-1">
                                       <Link
                                          href={`/product/${product.slug || product.id}`}
                                          target="_blank"
                                          className="h-9 px-3 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-xs transition-all no-underline"
                                       >
                                          <Eye size={13} /> View
                                       </Link>
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
               ) : products.length === 0 ? (
                  <div className="py-20 text-center">
                     <div className="max-w-md mx-auto flex flex-col items-center gap-3 px-6">
                        <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                           <Package size={20} />
                        </div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">No products found</h4>
                        <p className="text-[10px] text-slate-400 font-bold">
                           No products matched your search or filters. Try adjusting your filter parameters or search term.
                        </p>
                     </div>
                  </div>
               ) : (
                  products.map(product => {
                     const stock = getStock(product);
                     const stockPct = Math.min(100, (stock / 100) * 100);
                     const isLow = stock < 20;

                     return (
                        <div key={product.id} className="p-6 space-y-4">
                           <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 shadow-sm">
                                 <img
                                    src={product.image || settings?.logo || '/logo.webp'}
                                    className="h-full w-full object-cover"
                                    alt={product.name}
                                 />
                              </div>
                              <div className="min-w-0 flex-1">
                                 <div className="flex items-center justify-between gap-2">
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                       ID: NM-00{product.id}
                                    </span>

                                 </div>
                                 <p className="text-[13px] font-extrabold text-slate-900 leading-tight truncate mt-0.5">
                                    {product.name}
                                 </p>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-3 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 text-xs">
                              <div className="space-y-1">
                                 <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Category</span>
                                 <button
                                    onClick={() => updateQueryParams({ category: product.category?.id })}
                                    className="font-extrabold text-slate-800 text-left block truncate hover:underline border-0 bg-transparent p-0 cursor-pointer"
                                 >
                                    {product.category?.name || 'Heritage Foods'}
                                 </button>
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
                                     <button
                                        onClick={() => updateQueryParams({ brandId: product.subVendor ? String(product.subVendor.id) : null })}
                                       className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 hover:text-indigo-800 transition-colors cursor-pointer"
                                    >
                                       {product.subVendor.name}
                                    </button>
                                 )}
                              </div>
                           </div>

                           <div className="flex items-center gap-2 pt-1">
                              <Link
                                 href={`/product/${product.slug || product.id}`}
                                 target="_blank"
                                 className="h-11 flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-xs font-bold no-underline"
                              >
                                 <Eye size={14} /> View
                              </Link>
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
                     onPageChange={(page) => updateQueryParams({ page })}
                  />
               </div>
            )}
         </div>
      </div>
   );
}
