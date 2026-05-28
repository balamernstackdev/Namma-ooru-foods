'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, ImageIcon, Globe, Loader2, User, MoreHorizontal, Square, CheckSquare } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminPagination from '@/components/admin/AdminPagination';
import AdminListToolbar from '@/components/admin/AdminListToolbar';

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
  
  // State definitions
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('latest');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalBrands, setTotalBrands] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBrands(currentPage);
  }, [currentPage]);

  const fetchBrands = (page: number) => {
    setLoading(true);
    fetch(`${API_URL}/api/admin-ops/brands?page=${page}&limit=${itemsPerPage}&includeEmpty=true`)
      .then(r => r.json())
      .then(data => {
        setBrands(data.subVendors || []);
        setTotalBrands(data.total || 0);
        setTotalPages(data.totalPages || 0);
      })
      .finally(() => setLoading(false));
  };

  const deleteBrand = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this brand partner? This decouples all heritage product links.')) return;
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

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedIds.length === 0) return;
    if (action === 'delete') {
      if (!confirm(`Are you sure you want to permanently delete ${selectedIds.length} brand partners?`)) return;
      let successCount = 0;
      for (const id of selectedIds) {
        try {
          const res = await fetch(`${API_URL}/api/admin-ops/brands/${id}`, { method: 'DELETE' });
          if (res.ok) successCount++;
        } catch (e) {
          console.error(e);
        }
      }
      addToast('Success', `Successfully removed ${successCount} brand partners`);
      setSelectedIds([]);
      fetchBrands(currentPage);
    } else {
      addToast('Info', 'Approval state changes are not supported for heritage brand partners.');
    }
  };

  const handleExport = (format: 'CSV' | 'EXCEL' | 'PDF') => {
    if (filteredBrands.length === 0) {
      addToast('Error', 'No brand records to export');
      return;
    }
    addToast('Info', `Generating and downloading brands export as ${format}...`);
    
    setTimeout(() => {
      const headers = ["S.No", "Brand ID", "Brand Name", "Website / digital footprint", "Heritage Narrative", "Total Products Count"];
      
      const rows = filteredBrands.map((b, index) => {
        return [
          index + 1,
          `BRD-00${b.id}`,
          `"${(b.name || '').replace(/"/g, '""')}"`,
          `"${(b.website || 'No digital footprint').replace(/"/g, '""')}"`,
          `"${(b.description || 'No description').replace(/"/g, '""')}"`,
          b._count?.products || 0
        ];
      });
      
      const csvContent = headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
      
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", `brands_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
      
      addToast('Success', 'Brands registry exported successfully');
    }, 1000);
  };

  const filteredBrands = brands
    .filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && (b._count?.products || 0) > 0) ||
        (statusFilter === 'INACTIVE' && (b._count?.products || 0) === 0);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === 'latest') return b.id - a.id;
      if (sortOrder === 'oldest') return a.id - b.id;
      if (sortOrder === 'alphabetical') return a.name.localeCompare(b.name);
      return 0;
    });

  const toggleSelectRow = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredBrands.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredBrands.map(b => b.id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto p-4 md:p-8">
      {/* HEADER */}
      <div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Brand Management</h2>
        <p className="text-slate-400 font-medium text-sm mt-1">Configure heritage partner catalogs, manage digital footprints, and view operational products count.</p>
      </div>

      {/* Advanced Filter Toolbar */}
      <AdminListToolbar
        searchPlaceholder="Find brands by name or story narrative..."
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        statusOptions={[
          { label: 'All Brands', value: 'ALL' },
          { label: 'With Products', value: 'ACTIVE' },
          { label: 'Empty Brands', value: 'INACTIVE' },
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
        quickStats={[]}
        onAddNewClick={() => router.push('/admin/brands/new')}
        addNewLabel="Register New Brand"
        onExportClick={handleExport}
        selectedCount={selectedIds.length}
        onBulkAction={handleBulkAction}
      />

      {/* Brands List Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-5 w-12 border-b border-slate-100 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600 transition-colors">
                    {selectedIds.length === filteredBrands.length && filteredBrands.length > 0 ? (
                      <CheckSquare size={16} className="text-emerald-600" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Partner Identity</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Brand Narrative</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">E-Commerce Pulse</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-bold text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-5">
                      <div className="h-10 bg-slate-50 rounded-xl w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center gap-3">
                      <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                        <Tag size={20} />
                      </div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">No matching heritage brand partner</h4>
                      <p className="text-[10px] text-slate-400 font-bold">
                        Adjust your search filters to find what you're looking for, or register a new brand.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBrands.map(brand => {
                  const isSelected = selectedIds.includes(brand.id);
                  return (
                    <tr key={brand.id} className={`group hover:bg-slate-50/40 transition-colors ${isSelected ? 'bg-slate-50/30' : ''}`}>
                      <td className="px-6 py-4 text-center border-b border-slate-50">
                        <button onClick={() => toggleSelectRow(brand.id)} className="text-slate-400 hover:text-slate-600 transition-colors">
                          {isSelected ? (
                            <CheckSquare size={16} className="text-emerald-600" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      
                      <td className="px-6 py-4 border-b border-slate-50">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden p-1.5 shrink-0 shadow-inner">
                            {brand.logo ? (
                              <img src={brand.logo} className="w-full h-full object-contain" alt={brand.name} />
                            ) : (
                              <ImageIcon className="text-slate-300" size={18} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-extrabold text-slate-900 leading-none">{brand.name}</span>
                              {brand.userId && (
                                <User size={12} className="text-emerald-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Globe size={11} className="text-slate-300" />
                              <span className="text-[10px] font-bold text-slate-400 lowercase leading-none">
                                {brand.website || 'No digital footprint'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 border-b border-slate-50 max-w-sm">
                        <p className="text-xs text-slate-500 font-bold leading-relaxed line-clamp-2 italic">
                          {brand.description || 'No heritage narrative provided.'}
                        </p>
                      </td>

                      <td className="px-6 py-4 border-b border-slate-50">
                        <span className="inline-block text-[10px] font-black uppercase tracking-wider text-blue-700 px-3 py-1.5 bg-blue-50 border border-blue-100/50 rounded-xl whitespace-nowrap">
                          {brand._count?.products || 0} Products
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right border-b border-slate-50 relative">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/brands/edit/${brand.id}`}
                            className="h-9 px-3 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-50 flex items-center gap-1.5 text-xs transition-all no-underline font-bold"
                          >
                            <Edit2 size={13} /> Edit
                          </Link>

                          {/* 3-Dots Action overlay */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === brand.id ? null : brand.id)}
                              className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <MoreHorizontal size={16} />
                            </button>

                            {activeMenuId === brand.id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                  {brand.website && (
                                    <button
                                      onClick={() => { window.open(brand.website, '_blank'); setActiveMenuId(null); }}
                                      className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
                                    >
                                      <Globe size={14} /> Visit Website
                                    </button>
                                  )}
                                  <button
                                    onClick={() => { deleteBrand(brand.id); setActiveMenuId(null); }}
                                    className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                  >
                                    <Trash2 size={14} /> Delete Brand
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-slate-50">
            <AdminPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
