'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Save, 
  Plus, 
  Trash2, 
  LayoutGrid, 
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import useSWR, { mutate } from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface PromotionSection {
  id: number;
  title: string;
  sectionType: string;
  displayOrder: number;
  isActive: boolean;
}

export default function PromotionLayoutBuilder() {
  const { data: sections, error, isLoading } = useSWR<PromotionSection[]>(`${API_URL}/api/promotion-sections`, fetcher);
  const [localSections, setLocalSections] = useState<PromotionSection[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form state for new section
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('FLASH_DEALS');
  const [adding, setAdding] = useState(false);

  // Sync state from API
  useEffect(() => {
    if (sections) {
      // Sort locally just in case
      const sorted = [...sections].sort((a, b) => a.displayOrder - b.displayOrder);
      setLocalSections(sorted);
    }
  }, [sections]);

  // Clear messages after time
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newArr = [...localSections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newArr.length) return;

    // Swap
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    // Recalculate displayOrder
    const reordered = newArr.map((item, idx) => ({
      ...item,
      displayOrder: idx
    }));

    setLocalSections(reordered);
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      // Optimistic update local state
      setLocalSections(prev => prev.map(item => 
        item.id === id ? { ...item, isActive: !currentStatus } : item
      ));

      const res = await fetch(`${API_URL}/api/promotion-sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!res.ok) throw new Error('Update status failed');
      mutate(`${API_URL}/api/promotion-sections`);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to toggle section visibility.' });
      // Revert local state on failure
      if (sections) setLocalSections(sections);
    }
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const items = localSections.map((item, index) => ({
        id: item.id,
        displayOrder: index
      }));

      const res = await fetch(`${API_URL}/api/promotion-sections/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });

      if (!res.ok) throw new Error('Reordering action failed');

      setMessage({ type: 'success', text: 'Homepage structural arrangement saved!' });
      mutate(`${API_URL}/api/promotion-sections`);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save section configuration.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);

    try {
      const res = await fetch(`${API_URL}/api/promotion-sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          sectionType: newType,
          isActive: true
        })
      });

      if (!res.ok) throw new Error('Creation failed');

      setNewTitle('');
      setNewType('FLASH_DEALS');
      setMessage({ type: 'success', text: 'New homepage module registered successfully.' });
      mutate(`${API_URL}/api/promotion-sections`);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to build campaign section.' });
    } finally {
      setAdding(false);
    }
  };

  const deleteSection = async (id: number) => {
    if (!confirm('Warning: Deleting a structural component will remove it from customer screens immediately. Proceed?')) return;

    try {
      const res = await fetch(`${API_URL}/api/promotion-sections/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Deletion failure');

      setMessage({ type: 'success', text: 'Container deleted successfully.' });
      mutate(`${API_URL}/api/promotion-sections`);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to decommission module.' });
    }
  };

  const getSectionTypeColor = (type: string) => {
    switch(type) {
      case 'HERO_CAROUSEL':
      case 'HERO_SLIDER': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'FLASH_DEALS': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'COMBOS':
      case 'COMBO_OFFERS': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'VOUCHER_LIST':
      case 'VOUCHERS': return 'bg-teal-50 text-teal-600 border-teal-100';
      case 'QUICK_STRIPS': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'WALLET_OFFERS': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'BANNER_GRIDS': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'REFERRAL': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="flex flex-col gap-12 animate-in fade-in duration-700 pb-20 max-w-5xl mx-auto">
      
      {/* Breadcrumb Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <Link href="/admin/promotions" className="flex items-center gap-1 text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest mb-4 transition-colors">
            <ChevronLeft size={14} /> Back to Campaigns
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Home Flow <span className="text-emerald-600">Builder</span></h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Configure client-side container injection order and component structures.</p>
        </div>
        
        <button 
          onClick={saveOrder}
          disabled={saving || isLoading}
          className={`h-14 px-8 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl active:scale-95 ${
            saving ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
          }`}
        >
          {saving ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {saving ? 'Saving Flow...' : 'Save Flow Order'}
        </button>
      </div>

      {/* Floating Success/Error Banner */}
      {message && (
        <div className={`flex items-center gap-4 p-6 rounded-2xl border animate-in slide-in-from-top-4 duration-300 ${
          message.type === 'success' ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' : 'bg-rose-50/60 border-rose-200 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="shrink-0 h-6 w-6 text-emerald-600" /> : <AlertTriangle className="shrink-0 h-6 w-6 text-rose-600" />}
          <span className="text-xs font-black uppercase tracking-wider">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left: Interactive Rearranging Deck */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between bg-slate-50 p-5 rounded-2xl">
             <div className="flex items-center gap-3">
                <LayoutGrid size={18} className="text-slate-400" />
                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Live Stacking Pipeline</span>
             </div>
             <span className="text-[10px] font-black text-slate-400 bg-slate-200/50 rounded-lg px-2.5 py-1">
               {localSections.length} MOUNTED
             </span>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-32 bg-white border border-dashed border-slate-200 rounded-3xl">
              <RefreshCw size={32} className="animate-spin text-emerald-700" />
            </div>
          )}

          {!isLoading && localSections.length === 0 && (
             <div className="flex flex-col items-center justify-center py-24 bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                <Sparkles size={36} className="text-slate-200 mb-4" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No layout tracks deployed yet.</p>
             </div>
          )}

          <div className="flex flex-col gap-3">
            {localSections.map((section, index) => (
              <div 
                key={section.id} 
                className={`group flex items-center justify-between p-6 bg-white border-2 rounded-[2rem] transition-all shadow-sm hover:shadow-md ${
                  section.isActive ? 'border-slate-100 hover:border-emerald-100' : 'border-slate-50 opacity-60 bg-slate-50/50'
                }`}
              >
                {/* Stack Index / Order */}
                <div className="flex items-center gap-6 flex-1">
                  <div className="h-12 w-12 rounded-2xl bg-slate-950 text-white font-black text-sm flex items-center justify-center shrink-0 font-mono shadow-xl">
                     0{index + 1}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <h4 className="font-black text-slate-900 text-base tracking-tight">{section.title}</h4>
                    <div className="flex flex-wrap gap-2 items-center">
                       <span className={`px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${getSectionTypeColor(section.sectionType)}`}>
                         {section.sectionType.replace('_', ' ')}
                       </span>
                       {!section.isActive && (
                          <span className="px-3 py-1 rounded-lg bg-slate-200 text-slate-500 text-[8px] font-black uppercase tracking-widest">
                             INACTIVE
                          </span>
                       )}
                    </div>
                  </div>
                </div>

                {/* Controls / Actions */}
                <div className="flex items-center gap-2">
                  {/* Reordering Arrows */}
                  <div className="flex gap-1 bg-slate-50 rounded-xl p-1 border border-slate-100">
                    <button 
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Section Up"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button 
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === localSections.length - 1}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Section Down"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>

                  {/* Toggle Live Status */}
                  <button 
                    onClick={() => toggleStatus(section.id, section.isActive)}
                    className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all shadow-sm border ${
                      section.isActive 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100' 
                        : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100'
                    }`}
                    title={section.isActive ? 'Deactivate Section' : 'Activate Section'}
                  >
                    {section.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>

                  {/* Delete Button */}
                  <button 
                    onClick={() => deleteSection(section.id)}
                    className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 text-red-300 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center shadow-sm"
                    title="Permanently Delete Layout Container"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Informational Footnote */}
          <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-3xl flex gap-4 items-start mt-4">
             <Sparkles className="shrink-0 text-blue-600 mt-1" size={18} />
             <div className="text-xs font-medium text-blue-900 leading-relaxed">
               <strong>Dynamic Rendering Protocol:</strong> Reordering items alters how containers sequence themselves inside `app/promotions/page.tsx`. Changes become immediate on customer storefronts after saving. Ensure there's at least one "Live Now" campaign mapped to a section, or that track will omit itself automatically!
             </div>
          </div>
        </div>

        {/* Right: New Container Registry Deck */}
        <div className="flex flex-col gap-6">
           <div className="bg-slate-950 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden border border-slate-800">
              <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-emerald-500/20 blur-3xl" />
              
              <div className="relative z-10 flex flex-col gap-6">
                 <div className="h-14 w-14 rounded-3xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Plus size={24} />
                 </div>
                 <div>
                   <h3 className="text-2xl font-black tracking-tight leading-none">Inject Track</h3>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Mount new container</p>
                 </div>

                 <form onSubmit={handleAddSection} className="flex flex-col gap-5 mt-4">
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Section Display Title</label>
                       <input 
                         type="text"
                         value={newTitle}
                         onChange={e => setNewTitle(e.target.value)}
                         placeholder="e.g. Midnight Craving Banners"
                         className="h-12 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white font-semibold text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all w-full"
                       />
                    </div>

                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Render Component Type</label>
                       <select 
                         value={newType}
                         onChange={e => setNewType(e.target.value)}
                         className="h-12 px-4 rounded-xl bg-slate-900 border border-slate-800 text-white font-semibold text-xs focus:outline-none focus:border-emerald-500 transition-all w-full appearance-none"
                       >
                          <option value="HERO_CAROUSEL">Hero Slider / Main Banners</option>
                          <option value="QUICK_STRIPS">Quick Promo Strip</option>
                          <option value="FLASH_DEALS">Flash Deals Cards Grid</option>
                          <option value="BANNER_GRIDS">Banner Showcase Grids</option>
                          <option value="COMBOS">Multi-Save Combo Deals</option>
                          <option value="VOUCHER_LIST">Claimable Coupons Tray</option>
                          <option value="WALLET_OFFERS">Partner Wallet Offers</option>
                          <option value="REFERRAL">Community Referral Module</option>
                       </select>
                    </div>

                    <button 
                      type="submit"
                      disabled={adding || !newTitle.trim()}
                      className="h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all mt-4 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {adding ? <RefreshCw className="animate-spin size-5" /> : <Sparkles size={16} />}
                      {adding ? 'Provisioning...' : 'Mount Component'}
                    </button>
                 </form>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
