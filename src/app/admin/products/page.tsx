import React from 'react';
import { Plus, Edit, Trash2, Search, MoreHorizontal } from 'lucide-react';
import { PRODUCTS } from '@/lib/staticData';

const ProductManagementPage = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-[var(--muted-foreground)]">Manage your product catalog, pricing, and variants.</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:bg-[var(--primary-dark)] active:scale-95">
          <Plus className="h-5 w-5" /> Add New Product
        </button>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input 
            type="text" 
            placeholder="Search products by name or SKU..." 
            className="h-11 w-full rounded-xl bg-[var(--muted)] pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>
        <select className="h-11 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 text-sm outline-none">
          <option>All Categories</option>
          <option>Grains</option>
          <option>Oils</option>
        </select>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[var(--muted)]/50 text-sm font-semibold text-[var(--muted-foreground)] border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {PRODUCTS.map((p, i) => (
              <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={p.image} className="h-10 w-10 rounded-lg object-cover" alt="" />
                    <span className="font-bold">{p.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-[var(--muted-foreground)]">{p.category}</td>
                <td className="px-6 py-4 font-bold">₹{p.price}</td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${60 > 50 ? 'text-orange-600' : 'text-green-600'}`}>
                    {p.id * 10} units
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-[var(--muted-foreground)] hover:text-red-500 transition-colors">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagementPage;
