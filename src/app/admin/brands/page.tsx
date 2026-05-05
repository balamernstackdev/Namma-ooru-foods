'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, ImageIcon, Globe, Loader2, User } from 'lucide-react';
import { API_URL } from '@/lib/api';
import AdminPagination from '@/components/admin/AdminPagination';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

interface Brand {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  userId?: number;
  _count?: { products: number };
}

export default function AdminBrandsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBrands, setTotalBrands] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBrands(currentPage);
  }, [currentPage]);

  const fetchBrands = (page: number) => {
    setLoading(true);
    fetch(`${API_URL}/api/admin-ops/brands?page=${page}&limit=${itemsPerPage}`)
      .then(r => r.json())
      .then(data => {
        setBrands(data.brands || []);
        setTotalBrands(data.total || 0);
        setTotalPages(data.totalPages || 0);
      })
      .finally(() => setLoading(false));
  };

  const deleteBrand = async (id: number) => {
    if (!confirm('Delete this brand partner? This will decouple all linked products from this heritage narrative.')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin-ops/brands/${id}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Success', 'Brand partner removed from registry');
        fetchBrands(currentPage);
      }
    } catch (err) {
      addToast('Error', 'Failed to remove brand');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Brand Registry</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Manage {totalBrands} heritage brands and their vendor associations.</p>
        </div>
        <button 
          onClick={() => router.push('/admin/brands/new')}
          className="h-14 px-8 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
        >
          <Plus size={18} /> Register New Brand
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Partner Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Brand Narrative</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">E-Commerce Pulse</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-8 py-6">
                      <div className="h-12 bg-slate-100 rounded-xl w-full"></div>
                    </td>
                  </tr>
                ))
              ) : brands.map(brand => (
                <tr key={brand.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-2 shadow-inner">
                        {brand.logo ? (
                          <img src={brand.logo} className="w-full h-full object-contain" alt={brand.name} />
                        ) : (
                          <ImageIcon className="text-slate-200" size={24} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900">{brand.name}</span>
                          {brand.userId && (
                             <User size={12} className="text-emerald-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Globe size={10} className="text-slate-300" />
                          <span className="text-[10px] font-bold text-slate-400 lowercase">
                            {brand.website || 'No digital footprint'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 max-w-md">
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2 italic">
                      {brand.description || 'No heritage narrative provided.'}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                        {brand._count?.products || 0} Products
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => router.push(`/admin/brands/edit/${brand.id}`)} 
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteBrand(brand.id)} 
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-red-300 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && brands.length === 0 && (
            <div className="py-20 text-center">
              <Tag size={40} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No Brands Registered</h3>
            </div>
          )}
        </div>
      </div>

      <AdminPagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
