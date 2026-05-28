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
      ? `${API_URL}/api/categories?subVendorId=${brandId}&all=true&limit=1000` 
      : `${API_URL}/api/categories?all=true&limit=1000`;
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-3xl font-black text-emerald-950 tracking-tighter uppercase">Category Tree</h2>
           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">
             {brandId ? 'Your private store taxonomy' : 'Organizing the platform taxonomy'}
           </p>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat: any) => (
          <div key={cat.id} className="group bg-white rounded-[2rem] border border-slate-100 p-8 hover:border-amber-400 transition-all shadow-sm hover:shadow-xl hover:shadow-amber-900/5">
            <div className="flex items-start justify-between mb-6">
              <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-emerald-950 overflow-hidden">
                {(cat.image && cat.image.trim() !== '') ? <img src={cat.image || undefined} className="h-full w-full object-cover" /> : <Folder size={24} />}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => router.push(`/vendor/categories/edit/${cat.id}`)}
                  className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-emerald-950 hover:text-white transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(cat.id)}
                  className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-50 text-red-300 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div>
              <h4 className="text-xl font-black text-emerald-950 tracking-tight">{cat.name}</h4>
              <p className="text-slate-400 text-xs font-medium mt-2 line-clamp-2">{cat.description || 'No description provided.'}</p>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                {cat._count?.products || 0} Products
              </span>
              <ChevronRight size={16} className="text-slate-200 group-hover:text-amber-400 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
