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

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('latest');
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  const fetchCategories = (page: number) => {
    setLoading(true);
    fetch(`${API_URL}/api/admin-ops/categories?page=${page}&limit=${itemsPerPage}&all=true`)
      .then(r => r.json())
      .then(data => {
        setCategories(data.categories || []);
        setTotalPages(data.totalPages || 1);
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
        setCategories(categories.filter(c => c.id !== categoryToDelete));
      } else {
        const data = await res.json();
        addToast('Error', data.error || 'Failed to delete category');
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
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' ||
        (statusFilter === 'MAIN' && !c.parent) ||
        (statusFilter === 'SUB' && c.parent);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === 'latest') return b.id - a.id;
      if (sortOrder === 'oldest') return a.id - b.id;
      if (sortOrder === 'alphabetical') return a.name.localeCompare(b.name);
      return 0;
    });

  // Calculate quick stats
  const statTotal = categories.length;
  const statMain = categories.filter(c => !c.parent).length;
  const statSub = categories.filter(c => c.parent).length;

  const quickStats = [
    { label: 'Total Categories', value: statTotal, gradient: 'from-slate-800 to-slate-900', icon: <Tag size={24} /> },
    { label: 'Main Categories', value: statMain, gradient: 'from-emerald-600 to-emerald-700', icon: <Database size={24} /> },
    { label: 'Sub-Categories', value: statSub, gradient: 'from-blue-600 to-blue-700', icon: <AlignLeft size={24} /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-20 max-w-7xl mx-auto p-4 md:p-8">
      {/* HEADER */}
      <div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Category Management</h2>
        <p className="text-slate-400 font-medium text-sm mt-1">Configure organic marketplace sections, setup classification mapping, and configure taxonomy tags.</p>
      </div>

      {/* Advanced filter toolbar */}
      <AdminListToolbar
        searchPlaceholder="Search catalog taxonomy sections..."
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        statusOptions={[
          { label: 'All Categories', value: 'ALL' },
          { label: 'Main Categories Only', value: 'MAIN' },
          { label: 'Sub-Categories Only', value: 'SUB' },
        ]}
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
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
          <div className="space-y-4">
            {filteredCategories.map(cat => (
              <div
                key={cat.id}
                className="group bg-white rounded-[2rem] border border-slate-200 p-5 flex flex-col sm:flex-row items-center gap-6 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/20 transition-all duration-300"
              >
                {/* Visual Identity */}
                <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                  {cat.image ? (
                    <img src={cat.image} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <Tag className="text-slate-300" size={20} />
                  )}
                </div>

                {/* Info Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-extrabold text-slate-900 truncate">
                      {cat.name}
                    </h3>
                    {cat.parent && (
                      <div className="flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 border border-blue-100/50 rounded-full">
                        <Database size={9} className="text-blue-500" />
                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">
                          {cat.parent.name} Sub-category
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-bold line-clamp-1 max-w-2xl">
                    {cat.description || 'No operational metadata provided for this catalog section.'}
                  </p>
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center gap-6 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex flex-col items-start sm:items-end">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Products</p>
                    <div className="flex items-center gap-1">
                      <AlignLeft size={11} className="text-slate-400" />
                      <span className="text-xs font-black text-slate-800">{cat._count?.products || 0} items</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 relative">
                    <Link
                      href={`/admin/categories/edit/${cat.id}`}
                      className="h-10 px-4 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-xs transition-all no-underline font-bold"
                    >
                      <Edit2 size={13} /> Edit
                    </Link>

                    {/* Action Dropdown Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === cat.id ? null : cat.id)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {activeMenuId === cat.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                          <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                              onClick={() => { window.open(`/categories/${cat.id}`, '_blank'); setActiveMenuId(null); }}
                              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors flex items-center gap-2"
                            >
                              <ChevronRight size={14} /> View on Site
                            </button>
                            <button
                              onClick={() => { setCategoryToDelete(cat.id); setActiveMenuId(null); }}
                              className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                              <Trash2 size={14} /> Delete Category
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
      {totalPages > 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
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
