'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, GripVertical, CheckCircle, XCircle, Loader2, Image as ImageIcon, Eye } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import SearchableSelect from '@/components/admin/SearchableSelect';
import SearchableMultiSelect from '@/components/admin/SearchableMultiSelect';

export interface QuickPick {
  id: number;
  type: 'PRODUCT' | 'CATEGORY' | 'BRAND' | 'COLLECTION';
  productId: number | null;
  categoryId: number | null;
  brandId: string | null;
  customImageUrl: string | null;
  title: string | null;
  badge: string | null;
  isFreeDelivery: boolean;
  displayOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  product?: { id: number; name: string; image: string; slug: string } | null;
  category?: { id: number; name: string; image: string; slug: string } | null;
}

export default function QuickPicksAdminPage() {
  const { addToast } = useToast();
  const [picks, setPicks] = useState<QuickPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPick, setEditingPick] = useState<QuickPick | null>(null);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSavingReorder, setIsSavingReorder] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchPicks = async (page = currentPage) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/quick-picks/admin?page=${page}&limit=${itemsPerPage}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      
      // Handle both paginated and non-paginated responses in case backend hasn't updated yet
      if (json.data && json.meta) {
        setPicks(json.data);
        setTotalPages(json.meta.totalPages);
        setCurrentPage(json.meta.page);
      } else {
        setPicks(json);
        setTotalPages(1);
      }
    } catch (e) {
      console.error(e);
      addToast('Error', 'Failed to fetch Quick Picks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPicks();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this Quick Pick?')) return;
    try {
      const res = await fetch(`${API_URL}/api/quick-picks/admin/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setPicks(prev => prev.filter(p => p.id !== id));
      addToast('Success', 'Quick Pick deleted', 'success');
    } catch (e) {
      addToast('Error', 'Failed to delete Quick Pick', 'error');
    }
  };

  const toggleStatus = async (pick: QuickPick) => {
    try {
      const res = await fetch(`${API_URL}/api/quick-picks/admin/${pick.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !pick.isActive })
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      setPicks(prev => prev.map(p => p.id === pick.id ? { ...p, isActive: updated.isActive } : p));
      addToast('Success', `Status updated`, 'success');
    } catch (e) {
      addToast('Error', 'Failed to update status', 'error');
    }
  };

  const saveReorder = async (newPicks: QuickPick[]) => {
    try {
      setIsSavingReorder(true);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const res = await fetch(`${API_URL}/api/quick-picks/admin/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderedIds: newPicks.map(p => p.id),
          startIndex 
        })
      });
      if (!res.ok) throw new Error('Failed to save order');
      addToast('Success', 'Order saved successfully', 'success');
    } catch (error) {
      addToast('Error', 'Failed to save order', 'error');
      fetchPicks(); // Revert on failure
    } finally {
      setIsSavingReorder(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newItems = [...picks];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setPicks(newItems);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    saveReorder(picks);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quick Picks</h1>
          <p className="text-sm text-slate-500">Manage the horizontal scrolling promotional strip under the navigation bar.</p>
        </div>
        <button
          onClick={() => { setEditingPick(null); setIsFormOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          <span>Add Quick Pick</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading Quick Picks...</div>
        ) : picks.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No quick picks found. Click "Add Quick Pick" to create one.
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {picks.map((pick, index) => {
                const imageUrl = pick.customImageUrl || pick.product?.image || pick.category?.image || '/placeholder.png';
                const title = pick.title || pick.product?.name || pick.category?.name || pick.brandId || 'Unknown';
                
                return (
                  <tr 
                    key={pick.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className={`border-b border-slate-100 transition-colors ${draggedIndex === index ? 'opacity-50 bg-slate-50' : 'hover:bg-slate-50/50'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1">
                        <GripVertical size={16} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-10 w-10 rounded-full border border-slate-200 overflow-hidden relative bg-slate-100 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{title}</div>
                      {pick.badge && (
                        <div className="text-[10px] font-bold text-orange-600 uppercase mt-0.5">{pick.badge}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                        {pick.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => toggleStatus(pick)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${pick.isActive ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        {pick.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {pick.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a 
                          href={pick.type === 'PRODUCT' ? `/products/${pick.product?.slug || pick.productId}${pick.isFreeDelivery ? '?freeDelivery=true' : ''}` : pick.type === 'CATEGORY' ? `/categories/${pick.category?.slug || pick.categoryId}` : pick.type === 'BRAND' ? `/search?q=${encodeURIComponent(pick.brandId || '')}` : pick.type === 'COLLECTION' ? `/collection/${pick.id}` : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </a>
                        <button 
                          onClick={() => { setEditingPick(pick); setIsFormOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(pick.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-slate-200 rounded-xl shadow-sm sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-700">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => {
                    const newPage = Math.max(1, currentPage - 1);
                    setCurrentPage(newPage);
                    fetchPicks(newPage);
                  }}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => {
                    const newPage = Math.min(totalPages, currentPage + 1);
                    setCurrentPage(newPage);
                    fetchPicks(newPage);
                  }}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <QuickPickFormModal 
          initialData={editingPick}
          onClose={() => { setIsFormOpen(false); setEditingPick(null); }}
          onSaved={() => { setIsFormOpen(false); setEditingPick(null); fetchPicks(); }}
        />
      )}
    </div>
  );
}

// Minimal form modal inline for simplicity
function QuickPickFormModal({ initialData, onClose, onSaved }: { initialData: QuickPick | null, onClose: () => void, onSaved: () => void }) {
  const { addToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    type: initialData?.type || 'PRODUCT',
    productId: initialData?.productId || '',
    categoryId: initialData?.categoryId || '',
    brandId: initialData?.brandId || '',
    collectionProductIds: initialData?.collectionProductIds || '',
    title: initialData?.title || '',
    customImageUrl: initialData?.customImageUrl || '',
    badge: initialData?.badge || '',
    isFreeDelivery: initialData?.isFreeDelivery || false,
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const url = initialData 
        ? `${API_URL}/api/quick-picks/admin/${initialData.id}` 
        : `${API_URL}/api/quick-picks/admin`;
      
      const method = initialData ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      addToast('Success', `Quick Pick ${initialData ? 'updated' : 'created'}`, 'success');
      onSaved();
    } catch (e) {
      addToast('Error', 'Failed to save Quick Pick', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast('Error', 'File size must be less than 10MB', 'error');
      return;
    }

    try {
      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.append('image', file);
      
      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        body: uploadData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setFormData(prev => ({ ...prev, customImageUrl: data.url }));
      addToast('Success', 'Image uploaded successfully', 'success');
    } catch (error) {
      addToast('Error', 'Failed to upload image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{initialData ? 'Edit Quick Pick' : 'Add Quick Pick'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <XCircle size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="qp-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Type</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any, productId: '', categoryId: '', brandId: '' })}
              >
                <option value="PRODUCT">Product</option>
                <option value="CATEGORY">Category</option>
                <option value="BRAND">Brand</option>
                <option value="COLLECTION">Collection (Multiple Products)</option>
              </select>
            </div>

            {formData.type === 'COLLECTION' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Products</label>
                <SearchableMultiSelect
                  type="product"
                  value={formData.collectionProductIds ? formData.collectionProductIds.split(',') : []}
                  onChange={(vals) => setFormData({ ...formData, collectionProductIds: vals.join(',') })}
                  placeholder="Search and select multiple products..."
                />
                <p className="text-xs text-slate-500 mt-1">These products will be shown when the user clicks this Quick Pick.</p>
              </div>
            )}

            {formData.type === 'PRODUCT' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
                <SearchableSelect
                  type="product"
                  value={String(formData.productId || '')}
                  initialName={initialData?.product?.name}
                  onChange={(val) => setFormData({ ...formData, productId: val })}
                  placeholder="Search products..."
                />
              </div>
            )}

            {formData.type === 'CATEGORY' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <SearchableSelect
                  type="category"
                  value={String(formData.categoryId || '')}
                  initialName={initialData?.category?.name}
                  onChange={(val) => setFormData({ ...formData, categoryId: val })}
                  placeholder="Search categories..."
                />
              </div>
            )}

            {formData.type === 'BRAND' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand (Seller)</label>
                <SearchableSelect
                  type="brand"
                  value={formData.brandId || ''}
                  initialName={initialData?.brandId || undefined}
                  onChange={(val, name) => setFormData({ ...formData, brandId: name })}
                  placeholder="Search brands/sellers..."
                />
                <p className="text-xs text-slate-500 mt-1">Select a brand to show its seller page.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title Override (Optional)</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Leave blank to use default name"
                maxLength={20}
              />
              <p className="text-xs text-slate-500 mt-1">Keep it short (max 20 chars). e.g. "Fresh Veggies"</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Custom Image (Optional)</label>
              
              <div className="flex flex-col gap-4">
                <div 
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 relative overflow-hidden group cursor-pointer hover:border-emerald-500 transition-colors flex-shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : formData.customImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formData.customImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-400 group-hover:text-emerald-500">
                      <ImageIcon size={24} className="mx-auto mb-1" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Upload</span>
                    </div>
                  )}
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
                
                <div>
                  <p className="text-xs text-slate-500 mb-2">
                    Upload a custom image to override the default product/category image.
                  </p>
                  <p className="text-[11px] font-medium text-slate-600 mb-2 bg-slate-100 p-2 rounded inline-block">
                    Recommended: 100x100px (1:1 ratio) • Max size: 10MB
                  </p>
                  
                  {formData.customImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, customImageUrl: '' })}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                    >
                      Remove Custom Image
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Badge Text (Optional)</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  value={formData.badge}
                  onChange={e => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. FREE DELIVERY"
                />
              </div>
              <div className="flex items-center mt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    checked={formData.isFreeDelivery}
                    onChange={e => setFormData({ ...formData, isFreeDelivery: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-slate-700">Has Free Delivery?</span>
                </label>
              </div>
            </div>

            <div className="flex items-center pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span className="text-sm font-medium text-slate-700">Active (Visible)</span>
              </label>
            </div>
          </form>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            form="qp-form"
            type="submit" 
            disabled={saving}
            className="px-4 py-2 font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Quick Pick'}
          </button>
        </div>
      </div>
    </div>
  );
}
