'use client';

import { useState, useEffect, useMemo } from 'react';
import { ImageIcon, Plus, Trash2, Edit2, Search, Play, Pause, Loader2, Filter, GripVertical, ArrowUp, ArrowDown, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import Link from 'next/link';
import { Banner } from './BannerForm';
import { useToast } from '@/context/ToastContext';

// Safe date formatter helper
function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '—';
  }
}

const TYPE_TAB_LABELS: Record<string, string> = {
  hero: 'Hero Slider',
  best_sellers: 'Best Sellers',
  organic_collection: 'Organic Collection',
  farmer_collection: 'Farmers Collection',
  category: 'Category Banners',
};

const POSITION_BADGE_COLORS = [
  'bg-amber-500 text-white',    // #1 — gold
  'bg-slate-400 text-white',    // #2 — silver
  'bg-orange-400 text-white',   // #3 — bronze
];

function PositionBadge({ position }: { position: number }) {
  const color = position <= 3 ? POSITION_BADGE_COLORS[position - 1] : 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center gap-0.5 px-2.5 py-1 rounded-lg text-[10px] font-black tabular-nums ${color}`}>
      <Hash size={8} />
      {position}
    </span>
  );
}

function normalizeType(type?: string | null): string {
  if (!type) return 'hero';
  const lower = type.toLowerCase().trim();
  const map: Record<string, string> = {
    'hero banner': 'hero',
    'best sellers banner': 'best_sellers',
    'best sellers': 'best_sellers',
    'organic collection banner': 'organic_collection',
    'organic collection': 'organic_collection',
    'farmer collection banner': 'farmer_collection',
    'farmer collection': 'farmer_collection',
    'category banner': 'category',
    'category': 'category',
  };
  return map[lower] || lower;
}

export default function AdminBannersPage() {
  const { addToast } = useToast();
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Tabs
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'hero' | 'best_sellers' | 'organic_collection' | 'farmer_collection' | 'category'>('hero');

  // Local ordered list state for drag-and-drop
  const [typeBanners, setTypeBanners] = useState<Banner[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchBanners = () => {
    setLoading(true);
    fetch(`${API_URL}/api/admin-ops/banners`)
      .then(r => r.json())
      .then(data => {
        const mapped = (Array.isArray(data) ? data : []).map((b: any) => ({
          ...b,
          banner_image: b.banner_image || b.desktopImage || b.image || '',
          // Normalize display_order — fallback to sortOrder for old records
          display_order: b.display_order ?? b.sortOrder ?? 0,
        }));
        setBanners(mapped);
      })
      .catch(err => console.error('Fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const deleteBanner = async (id: number) => {
    if (!confirm('Delete this banner campaign? Display order will be recalculated automatically.')) return;
    try {
      await fetch(`${API_URL}/api/admin-ops/banners/${id}`, { method: 'DELETE' });
      setBanners(prev => prev.filter(b => b.id !== id));
      addToast('Success', 'Banner deleted and positions recalculated', 'success');
      // Refresh to get updated display_order from server
      setTimeout(() => fetchBanners(), 500);
    } catch (e) {
      addToast('Error', 'Failed to delete banner', 'error');
    }
  };

  const toggleStatus = async (banner: Banner) => {
    try {
      const res = await fetch(`${API_URL}/api/admin-ops/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...banner, isActive: !banner.isActive })
      });
      const data = await res.json();
      const mappedData = {
        ...data,
        banner_image: data.banner_image || data.desktopImage || data.image || '',
        display_order: data.display_order ?? data.sortOrder ?? 0,
      };
      setBanners(prev => prev.map(b => b.id === banner.id ? mappedData : b));
      addToast('Success', `Banner set to ${!banner.isActive ? 'Live' : 'Draft'}`, 'success');
    } catch (e) {
      addToast('Error', 'Failed to toggle status', 'error');
    }
  };

  // Filter + sort by display_order ASC for current tab
  const filteredBanners = useMemo(() => {
    let result = banners.filter(b => {
      const normalizedType = normalizeType(b.type);
      return normalizedType === activeTab;
    });

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => b.title?.toLowerCase().includes(q));
    }

    if (statusFilter !== 'All') {
      if (statusFilter === 'Live') result = result.filter(b => b.isActive);
      if (statusFilter === 'Draft') result = result.filter(b => !b.isActive);
    }

    // Sort by display_order ASC, then by id ASC as fallback
    result.sort((a, b) => {
      const orderA = a.display_order ?? 0;
      const orderB = b.display_order ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return a.id - b.id;
    });

    return result;
  }, [banners, activeTab, searchQuery, statusFilter]);

  // Keep local reorder state in sync with filtered list
  useEffect(() => {
    setTypeBanners(filteredBanners);
  }, [filteredBanners]);

  // ── Drag and Drop ──────────────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    const img = window.document.createElement('img');
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const updated = [...typeBanners];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setTypeBanners(updated);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    await saveOrder(typeBanners);
  };

  const saveOrder = async (ordered: Banner[]) => {
    setIsSaving(true);
    try {
      const bannerIds = ordered.map(b => b.id);
      const res = await fetch(`${API_URL}/api/admin-ops/banners/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeTab, bannerIds })
      });
      if (res.ok) {
        addToast('Success', 'Display order saved', 'success');
        fetchBanners();
      } else {
        addToast('Error', 'Failed to save display order', 'error');
      }
    } catch (err) {
      addToast('Error', 'Network error reordering', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Mobile manual reordering
  const handleMoveMobile = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= typeBanners.length) return;
    const updated = [...typeBanners];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setTypeBanners(updated);
    await saveOrder(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Banner <span className="text-emerald-600">Management</span></h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Configure promotional sections & sliding carousels</p>
        </div>
        <Link
          href="/admin/banners/create"
          className="admin-primary-btn shrink-0"
        >
          <Plus size={18} /> Create Banner
        </Link>
      </div>

      {/* Type Selector Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-100/50 p-2 rounded-2xl border border-slate-200/50">
        {(['hero', 'best_sellers', 'organic_collection', 'farmer_collection', 'category'] as const).map(tab => {
          const count = banners.filter(b => normalizeType(b.type) === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-200/50 hover:text-slate-800'
              }`}
            >
              {TYPE_TAB_LABELS[tab]}
              {count > 0 && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search banners by title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-white border border-slate-200 rounded-xl pl-12 pr-4 text-xs font-bold outline-none focus:border-amber-400 transition-colors shadow-sm"
          />
        </div>
        <div className="relative w-full sm:w-48 shrink-0">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none h-12 bg-white border border-slate-200 rounded-xl pl-10 pr-10 text-[10px] font-black uppercase tracking-widest outline-none focus:border-amber-400 transition-colors cursor-pointer w-full shadow-sm"
          >
            <option value="All">All Statuses</option>
            <option value="Live">Live</option>
            <option value="Draft">Draft</option>
          </select>
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
          <GripVertical size={14} className="text-emerald-600" />
        </div>
        <div>
          <h4 className="font-black text-[10px] text-emerald-900 uppercase tracking-widest mb-0.5">Drag-and-Drop Display Order</h4>
          <p className="text-emerald-850/80 text-xs font-semibold">
            Drag rows to reorder banners. Position (#1, #2, #3…) controls slider display order on the storefront. Each banner type maintains its own independent order sequence.
            {isSaving && <span className="ml-2 text-amber-600">Saving…</span>}
          </p>
        </div>
      </div>

      {/* ── Desktop Table View ───────────────────────────────────────────── */}
      <div className="hidden md:block bg-white rounded-[2rem] border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto border-separate border-spacing-0 min-w-[1000px] admin-data-table">
            <thead>
              <tr className="bg-slate-50/60">
                <th className="w-12 px-4 py-4" title="Drag to reorder"></th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 w-16 text-center">Position</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 w-24">Thumbnail</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Banner Name</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Banner Type</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-center">Status</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Created</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-4 block">Loading campaigns...</span>
                  </td>
                </tr>
              ) : typeBanners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-slate-200 mb-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">No campaigns in this category</span>
                    <Link href="/admin/banners/create" className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 underline underline-offset-2">
                      <Plus size={12} /> Create First Banner
                    </Link>
                  </td>
                </tr>
              ) : (
                typeBanners.map((banner, idx) => (
                  <tr
                    key={banner.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`hover:bg-slate-50/50 transition-colors group cursor-grab active:cursor-grabbing ${
                      draggedIndex === idx ? 'opacity-40 bg-slate-50 border-2 border-dashed border-amber-300' : ''
                    }`}
                  >
                    {/* Drag handle */}
                    <td className="px-4 py-4 text-slate-300 group-hover:text-slate-500 transition-colors">
                      <GripVertical size={16} />
                    </td>

                    {/* Position Badge */}
                    <td className="px-4 py-4 text-center">
                      <PositionBadge position={idx + 1} />
                    </td>

                    {/* Thumbnail */}
                    <td className="px-4 py-4">
                      <div className="h-12 w-24 rounded-lg bg-slate-100 overflow-hidden border border-slate-100 relative shadow-sm">
                        {(banner.banner_image && banner.banner_image.trim() !== '') ? (
                          <img src={banner.banner_image} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <ImageIcon className="absolute inset-0 m-auto h-5 w-5 text-slate-300" />
                        )}
                      </div>
                    </td>

                    {/* Banner Name */}
                    <td className="px-4 py-4">
                      <span className="text-xs font-black text-slate-900 block truncate max-w-xs">{banner.title || 'Untitled Banner'}</span>
                      {banner.subtitle && (
                        <span className="text-[10px] text-slate-400 font-bold block truncate max-w-xs mt-0.5">{banner.subtitle}</span>
                      )}
                    </td>

                    {/* Banner Type */}
                    <td className="px-4 py-4">
                      <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-slate-100 text-slate-600">
                        {TYPE_TAB_LABELS[normalizeType(banner.type)] || banner.type}
                      </span>
                    </td>

                    {/* Status toggle */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleStatus(banner)}
                        className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md transition-all border ${
                          banner.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        {banner.isActive ? <Play size={8} fill="currentColor" /> : <Pause size={8} fill="currentColor" />}
                        {banner.isActive ? 'Live' : 'Draft'}
                      </button>
                    </td>

                    {/* Created date */}
                    <td className="px-4 py-4">
                      <span className="text-[10px] font-bold text-slate-500">{formatDate(banner.createdAt)}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/admin/banners/${banner.id}/edit`)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-colors"
                          title="Edit Banner"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteBanner(banner.id)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-red-300 hover:bg-red-500 hover:text-white transition-colors"
                          title="Delete Banner"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile Cards View ───────────────────────────────────────────────── */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" />
          </div>
        ) : typeBanners.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <ImageIcon className="h-12 w-12 mx-auto text-slate-200 mb-3" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">No campaigns found</span>
          </div>
        ) : (
          typeBanners.map((banner, idx) => (
            <div key={banner.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex gap-3 items-start">
                {/* Position badge */}
                <div className="shrink-0 mt-0.5">
                  <PositionBadge position={idx + 1} />
                </div>
                {/* Thumbnail */}
                <div className="h-14 w-24 rounded-lg bg-slate-100 overflow-hidden border border-slate-100 relative shrink-0">
                  {(banner.banner_image && banner.banner_image.trim() !== '') ? (
                    <img src={banner.banner_image} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <ImageIcon className="absolute inset-0 m-auto h-5 w-5 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-black text-slate-900 block truncate">{banner.title || 'Untitled Banner'}</span>
                  <span className="text-[9px] font-bold text-slate-400 block mt-0.5">{TYPE_TAB_LABELS[normalizeType(banner.type)]}</span>
                  <span className="text-[9px] font-bold text-slate-400 block">{formatDate(banner.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => toggleStatus(banner)}
                  className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                    banner.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}
                >
                  {banner.isActive ? 'Live' : 'Draft'}
                </button>

                {/* Mobile reordering arrows */}
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveMobile(idx, -1)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-500 disabled:opacity-30"
                    title="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    disabled={idx === typeBanners.length - 1}
                    onClick={() => handleMoveMobile(idx, 1)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-500 disabled:opacity-30"
                    title="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/banners/${banner.id}/edit`}
                    className="h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 no-underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteBanner(banner.id)}
                    className="h-8 w-8 rounded-lg bg-red-50 border border-red-100 text-red-600 flex items-center justify-center"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
