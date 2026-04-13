import React from 'react';
import { Plus, Edit, Trash2, Layers } from 'lucide-react';
import { CATEGORIES } from '@/lib/staticData';

const CategoryManagementPage = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-[var(--muted-foreground)]">Organize your products into structured and hierarchical categories.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[var(--secondary)] px-6 py-3 font-bold text-white shadow-lg shadow-[var(--secondary)]/20 transition-all hover:bg-[var(--secondary)]/90 active:scale-95">
          <Plus className="h-5 w-5" /> Add New Category
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat, i) => (
          <div key={i} className="group relative flex flex-col p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:shadow-xl transition-all">
             <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-[var(--secondary)]/10 p-3 text-[var(--secondary)]">
                   <Layers className="h-6 w-6" />
                </div>
                <div className="flex gap-1 text-[var(--muted-foreground)]">
                   <button className="p-2 hover:text-[var(--primary)] transition-colors"><Edit className="h-5 w-5" /></button>
                   <button className="p-2 hover:text-red-500 transition-colors"><Trash2 className="h-5 w-5" /></button>
                </div>
             </div>
             <h3 className="text-xl font-bold">{cat.name}</h3>
             <p className="mt-2 text-sm text-[var(--muted-foreground)]">{cat.description}</p>
             <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">{cat.count} Products</span>
                <button className="text-sm font-bold text-[var(--primary)] hover:underline">View Products</button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManagementPage;
