'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Tag, AlignLeft, Search, Edit2, ArrowRight, MoreHorizontal, ChevronRight, Database, Trash2, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import PremiumLoader from '@/components/ui/PremiumLoader';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminListToolbar from '@/components/admin/AdminListToolbar';
import { ActionGroup, ViewButton, EditButton, DeleteButton } from '@/components/ui/ActionButtons';
import { mutate } from 'swr';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchCategories = () => {
    setLoading(true);
    // parentOnly=true ensures backend returns only top-level categories (parentId IS NULL)
    fetch(`${API_URL}/api/admin-ops/categories?limit=1000&all=true&parentOnly=true`)
      .then(r => r.json())
      .then(data => {
        setCategories(data.categories || []);
      })
      .finally(() => setLoading(false));
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const res = await fetch(`${API_URL}/api/admin-ops/categories/${categoryToDelete}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        addToast('Success', 'Category deleted successfully');
        mutate(() => true);
        router.refresh();
        setCategories(categories.filter(c => c.id !== categoryToDelete));
      } else {
        const data = await res.json();
        addToast('Error', data.error || data.message || 'Failed to delete category');
      }
    } catch (err) {
      addToast('Error', 'Error deleting category');
    } finally {
      setCategoryToDelete(null);
    }
  };

  const handleExport = (format: 'CSV' | 'EXCEL' | 'PDF') => {
    if (filteredCategories.length === 0) {
      addToast('Error', 'No categories available to export');
      return;
    }
    addToast('Info', `Generating and downloading categories export as ${format}...`);
    
    setTimeout(() => {
      const headers = ["S.No", "Category ID", "Category Name", "Parent Category", "Description", "Products Count"];
      
      const rows = filteredCategories.map((c: any, index: number) => {
        return [
          index + 1,
          c.id,
          `"${(c.name || '').replace(/"/g, '""')}"`,
          `"${(c.parent?.name || 'Main').replace(/"/g, '""')}"`,
          `"${(c.description || '').replace(/"/g, '""')}"`,
          c._count?.products || 0
        ];
      });
      
      const csvContent = headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
      
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", `categories_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
      
      addToast('Success', 'Categories exported successfully');
    }, 1000);
  };

  const filteredCategories = categories
    .filter(c => {
      // All fetched categories are parent-only; just apply search
      return c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    })
    .sort((a, b) => {
      if (sortOrder === 'latest') return b.id - a.id;
      if (sortOrder === 'oldest') return a.id - b.id;
      if (sortOrder === 'alphabetical') return a.name.localeCompare(b.name);
      return 0;
    });

  // Quick stats — all categories here are top-level only
  const statTotal = categories.length;
  const statWithProducts = categories.filter(c => (c._count?.products || 0) > 0).length;
  const statWithChildren = categories.filter(c => (c.children?.length || 0) > 0).length;

  const quickStats = [
    { label: 'Total Categories', value: statTotal, gradient: 'from-slate-800 to-slate-900', icon: <Tag size={24} /> },
    { label: 'Has Products', value: statWithProducts, gradient: 'from-emerald-600 to-emerald-700', icon: <Database size={24} /> },
    { label: 'Has Sub-Categories', value: statWithChildren, gradient: 'from-blue-600 to-blue-700', icon: <AlignLeft size={24} /> },
  ];

  const calculatedTotalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">Category <span className="text-emerald-600">Management</span></h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Configure organic marketplace sections, setup classification mapping, and configure taxonomy tags.</p>
      </div>

      {/* Advanced filter toolbar */}
      <AdminListToolbar
        searchPlaceholder="Search top-level categories..."
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        sortOptions={[
          { label: 'Latest First', value: 'latest' },
          { label: 'Oldest First', value: 'oldest' },
          { label: 'Alphabetical', value: 'alphabetical' },
        ]}
        selectedSort={sortOrder}
        onSortChange={setSortOrder}
        quickStats={quickStats}
        onAddNewClick={() => router.push('/admin/categories/new')}
        addNewLabel="New Category"
        onExportClick={handleExport}
      />

      {/* CATEGORY LIST (LIST WISE VIEW) */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-24">
            <PremiumLoader fullScreen={false} />
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px] admin-data-table">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Category Identity</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Description</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Products Pulse</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-bold text-sm">
                  {paginatedCategories.map(cat => (
                    <tr key={cat.id} className="group hover:bg-slate-50/40 transition-colors">
                      <td className={`px-6 py-4 border-b border-slate-50 relative`}>
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                            {cat.image ? (
                              <img src={cat.image} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <Tag className="text-slate-300" size={20} />
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-extrabold text-slate-900 leading-none">{cat.name}</span>
                            {(cat.children?.length || 0) > 0 && (
                              <div className="flex items-center gap-1.5 mt-2">
                                <AlignLeft size={11} className="text-emerald-500" />
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">
                                  {cat.children.length} sub-categor{cat.children.length === 1 ? 'y' : 'ies'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 border-b border-slate-50 max-w-sm">
                        <p className="text-xs text-slate-500 font-bold leading-relaxed line-clamp-2">
                          {cat.description || 'No operational metadata provided for this catalog section.'}
                        </p>
                      </td>

                      <td className="px-6 py-4 border-b border-slate-50">
                        <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-700 px-3 py-1.5 bg-emerald-50 border border-emerald-100/50 rounded-xl whitespace-nowrap">
                          {cat._count?.products || 0} Products
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right border-b border-slate-50 relative">
                        <ActionGroup>
                          <ViewButton tooltip="View on Site" onClick={() => window.open(`/categories/${cat.id}`, '_blank')} />
                          <EditButton onClick={() => router.push(`/admin/categories/edit/${cat.id}`)} />
                          <DeleteButton onClick={() => setCategoryToDelete(cat.id)} />
                        </ActionGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
            <Tag size={36} className="mx-auto text-slate-200 mb-4 animate-bounce" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">No matching results</h3>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Adjust your search filters to find what you're looking for</p>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {calculatedTotalPages > 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <AdminPagination
            currentPage={currentPage}
            totalPages={calculatedTotalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* CUSTOM DELETE MODAL */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4 border border-red-100">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Delete Category?</h3>
            <p className="text-xs font-bold text-slate-400 mb-6 max-w-[250px] leading-relaxed">
              This action cannot be undone. All associated products might lose their primary categorization.
            </p>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 h-12 rounded-xl bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 h-12 rounded-xl bg-red-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
