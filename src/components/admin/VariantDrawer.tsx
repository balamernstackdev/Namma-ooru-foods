import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Loader2, RefreshCw } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface VariantDrawerProps {
  productId: number;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export default function VariantDrawer({ productId, productName, isOpen, onClose, onSaveSuccess }: VariantDrawerProps) {
  const { addToast } = useToast();
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && productId) {
      fetchVariants();
    }
  }, [isOpen, productId]);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/variants?productId=${productId}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        setVariants(data.variants || []);
      }
    } catch (err) {
      addToast('Error', 'Failed to fetch variants', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleBulkSave = async () => {
    setSaving(true);
    try {
      const promises = variants.map(v => 
        fetch(`${API_URL}/api/variants/${v.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: v.name,
            sku: v.sku,
            price: Number(v.price),
            originalPrice: Number(v.originalPrice || 0),
            stock: Number(v.stock),
            isActive: v.isActive
          })
        })
      );
      await Promise.all(promises);
      addToast('Success', 'Variants updated successfully', 'success');
      onSaveSuccess();
      onClose();
    } catch (err) {
      addToast('Error', 'Failed to save variants', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-[110] flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-100 animate-in slide-in-from-right">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-black text-slate-900">Manage Variants</h2>
            <p className="text-xs font-bold text-slate-500 mt-1">{productName}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/20">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest">Loading variants...</p>
            </div>
          ) : variants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <p className="text-xs font-bold uppercase tracking-widest mb-4">No variants found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {variants.map((variant, idx) => (
                <div key={variant.id || idx} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <h3 className="text-sm font-black text-slate-800">{variant.name || 'STANDARD'}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                      <select 
                        value={variant.isActive ? 'true' : 'false'}
                        onChange={e => handleUpdate(idx, 'isActive', e.target.value === 'true')}
                        className="text-xs font-bold bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-500"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Variant Name</label>
                      <input 
                        type="text" 
                        value={variant.name || ''} 
                        onChange={e => handleUpdate(idx, 'name', e.target.value)}
                        className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">SKU</label>
                      <input 
                        type="text" 
                        value={variant.sku || ''} 
                        onChange={e => handleUpdate(idx, 'sku', e.target.value)}
                        className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Stock</label>
                      <input 
                        type="number" 
                        value={variant.stock || 0} 
                        onChange={e => handleUpdate(idx, 'stock', e.target.value)}
                        className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Price (Selling)</label>
                      <input 
                        type="number" 
                        value={variant.price || 0} 
                        onChange={e => handleUpdate(idx, 'price', e.target.value)}
                        className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between gap-4">
          <button 
            onClick={fetchVariants}
            className="h-12 px-6 rounded-xl border border-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button 
            onClick={handleBulkSave}
            disabled={saving || variants.length === 0}
            className="h-12 px-8 rounded-xl bg-emerald-600 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save All Changes
          </button>
        </div>
      </div>
    </>
  );
}
