'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Folder, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  parentId?: string;
  _count?: {
    products: number;
  };
}

export default function CategoryManager({ brandId }: { brandId?: number }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, [brandId]);

  const fetchCategories = async () => {
    const url = brandId 
      ? `${API_URL}/api/categories?subVendorId=${brandId}&all=true&limit=1000&parentOnly=true` 
      : `${API_URL}/api/categories?all=true&limit=1000&parentOnly=true`;
    const res = await fetch(url);
    const data = await res.json();
    const categoriesArray = Array.isArray(data) ? data : (data?.categories || []);
    setCategories(categoriesArray);
  };


  const handleDelete = async (id: number) => {
    if (confirm('Delete this category?')) {
      await fetch(`${API_URL}/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
         <h2 className="text-xl font-black text-[#111827] tracking-tight">Category Tree</h2>
         <p className="text-[#6B7280] font-bold text-[10px] uppercase tracking-widest mt-1">
           {brandId ? 'Your private store taxonomy' : 'Organizing the platform taxonomy'}
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat: any) => (
          <div key={cat.id} className="group bg-white rounded-[20px] border border-[#E5E7EB] p-6 hover:border-[#0F7A4D] transition-all shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-md">
            <div className="flex items-start justify-between mb-6">
              <div className="h-14 w-14 rounded-xl bg-[#F8FAF7] border border-[#E5E7EB] flex items-center justify-center text-[#0F7A4D] overflow-hidden">
                {(cat.image && cat.image.trim() !== '') ? <img src={cat.image || undefined} className="h-full w-full object-cover" /> : <Folder size={20} />}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => router.push(`/vendor/categories/edit/${cat.id}`)}
                  className="h-9 w-9 flex items-center justify-center rounded-lg bg-[#F8FAF7] border border-[#E5E7EB] text-[#6B7280] hover:bg-[#0F7A4D] hover:text-white hover:border-[#0F7A4D] transition-colors"
                  title="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(cat.id)}
                  className="h-9 w-9 flex items-center justify-center rounded-lg bg-[#F8FAF7] border border-[#E5E7EB] text-red-450 hover:bg-red-50 hover:text-red-650 hover:border-red-200 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-base font-bold text-[#111827] tracking-tight">{cat.name}</h4>
              <p className="text-[#6B7280] text-xs mt-1.5 line-clamp-2">{cat.description || 'No description provided.'}</p>
            </div>
            <div className="mt-5 pt-5 border-t border-[#E5E7EB] flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#15803D] bg-[#DCFCE7] border border-green-200 px-2.5 py-1 rounded">
                {cat._count?.products || 0} Products
              </span>
              <ChevronRight size={14} className="text-[#6B7280] group-hover:text-[#0F7A4D] transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
