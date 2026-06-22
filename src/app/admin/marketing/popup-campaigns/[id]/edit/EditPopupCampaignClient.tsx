'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Loader2, 
  Upload, 
  Gift, 
  X, 
  Mail, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Link2
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import SearchableSelect from '@/components/admin/SearchableSelect';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }).then(res => res.json());
};

// --- Custom Checkbox Component ---
const SmartCheckbox = ({ 
  checked, 
  onChange, 
  label 
}: { 
  checked: boolean; 
  onChange: (val: boolean) => void; 
  label: string 
}) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`h-5 w-5 rounded-lg border-2 flex items-center justify-center transition-all ${
          checked
            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-500/10'
            : 'border-slate-350 bg-white group-hover:border-slate-400'
        }`}
      >
        {checked && <Check size={12} strokeWidth={3} className="animate-in zoom-in-50 duration-150" />}
      </div>
      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide transition-colors group-hover:text-slate-950">
        {label}
      </span>
    </label>
  );
};

// --- Custom Toggle Switch Component ---
const ToggleSwitch = ({
  checked,
  onChange,
  label,
  description
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors">
      <div className="flex flex-col text-left">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{label}</span>
        {description && <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{description}</span>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 outline-none shrink-0 ${checked ? 'bg-emerald-600' : 'bg-slate-200'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
};

// --- Custom Number Stepper Component ---
const NumberStepper = ({ 
  value, 
  onChange, 
  min = 0, 
  label 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  min?: number; 
  label: string 
}) => {
  const numVal = parseInt(value) || 0;
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div className="flex items-center h-12 w-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-emerald-600 transition-colors">
        <button
          type="button"
          onClick={() => onChange(String(Math.max(min, numVal - 1)))}
          className="w-12 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors font-bold text-lg select-none"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          onChange={e => onChange(String(Math.max(min, parseInt(e.target.value) || 0)))}
          className="flex-1 h-full bg-transparent text-center font-bold text-xs text-slate-900 outline-none select-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => onChange(String(numVal + 1))}
          className="w-12 h-full flex items-center justify-center text-slate-500 hover:bg-slate-100 active:bg-slate-200 transition-colors font-bold text-lg select-none"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default function EditPopupCampaignClient({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  
  // Custom states for redesign routing & actions
  const [statusMode, setStatusMode] = useState<'active' | 'scheduled' | 'disabled'>('active');
  const [redirectType, setRedirectType] = useState<string>('none');
  const [externalUrl, setExternalUrl] = useState<string>('');
  const [popupActionType, setPopupActionType] = useState<string>('none');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  
  // Preview view switcher state
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    desktopImage: '',
    mobileImage: '',
    buttonText: 'Claim Offer',
    redirectUrl: '',
    couponCode: '',
    discountPct: '',
    popupType: 'NEWSLETTER',
    displayDelay: '3',
    oncePerSession: true,
    oncePerUser: false,
    onlyGuest: false,
    onlyLoggedIn: false,
    startDate: '',
    endDate: '',
    priority: '0',
    isActive: true
  });

  // Fetch coupons with high limit to populate the Apply Coupon dropdown fully
  const { data: couponsData } = useSWR<any>(`${API_URL}/api/coupons?limit=100`, fetcher);
  const coupons = couponsData?.coupons || [];

  // Fetch campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const token = localStorage.getItem('namma_orru_token');
        const res = await fetch(`${API_URL}/api/popup-campaigns/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.ok) {
          const data = await res.json();
          setFormData({
            title: data.title || '',
            subtitle: data.subtitle || '',
            description: data.description || '',
            desktopImage: data.desktopImage || '',
            mobileImage: data.mobileImage || '',
            buttonText: data.buttonText || 'Claim Offer',
            redirectUrl: data.redirectUrl || '',
            couponCode: data.couponCode || '',
            discountPct: data.discountPct !== null && data.discountPct !== undefined ? String(data.discountPct) : '',
            popupType: data.popupType || 'NEWSLETTER',
            displayDelay: String(data.displayDelay ?? '3'),
            oncePerSession: Boolean(data.oncePerSession ?? true),
            oncePerUser: Boolean(data.oncePerUser ?? false),
            onlyGuest: Boolean(data.onlyGuest ?? false),
            onlyLoggedIn: Boolean(data.onlyLoggedIn ?? false),
            startDate: data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : '',
            endDate: data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : '',
            priority: String(data.priority ?? '0'),
            isActive: Boolean(data.isActive ?? true)
          });

          // Parse the redirectUrl to populate the UI fields
          const url = data.redirectUrl || '';
          let calculatedRedirectType = 'none';
          let calculatedPopupActionType = 'none';
          let calculatedTargetId = '';
          let calculatedExternalUrl = '';

          if (url.startsWith('/products/detail?id=')) {
            calculatedPopupActionType = 'product';
            calculatedTargetId = url.replace('/products/detail?id=', '');
          } else if (url.startsWith('/products?category=')) {
            calculatedPopupActionType = 'category';
            calculatedTargetId = url.replace('/products?category=', '');
          } else if (url.startsWith('/vendors/')) {
            calculatedPopupActionType = 'vendor';
            calculatedTargetId = url.replace('/vendors/', '');
          } else if (url.startsWith('/products?collection=')) {
            calculatedPopupActionType = 'collection';
            calculatedTargetId = url.replace('/products?collection=', '');
          } else if (url === '/promotions' && data.popupType === 'COUPON') {
            calculatedPopupActionType = 'coupon';
          } else if (url === '/') {
            calculatedRedirectType = 'home';
          } else if (url === '/products') {
            calculatedRedirectType = 'shop';
          } else if (url === '/categories') {
            calculatedRedirectType = 'categories';
          } else if (url === '/vendors') {
            calculatedRedirectType = 'vendors';
          } else if (url === '/promotions') {
            calculatedRedirectType = 'offers';
          } else if (url === '/about') {
            calculatedRedirectType = 'about';
          } else if (url.startsWith('http://') || url.startsWith('https://') || url) {
            calculatedRedirectType = 'external';
            calculatedExternalUrl = url;
          }

          setRedirectType(calculatedRedirectType);
          setPopupActionType(calculatedPopupActionType);
          setSelectedTargetId(calculatedTargetId);
          setExternalUrl(calculatedExternalUrl);

          // Calculate initial status mode
          const isCampActive = Boolean(data.isActive ?? true);
          const sDate = data.startDate ? new Date(data.startDate) : null;
          let calculatedStatus: 'active' | 'scheduled' | 'disabled' = 'active';
          if (!isCampActive) {
            calculatedStatus = 'disabled';
          } else if (sDate && sDate > new Date()) {
            calculatedStatus = 'scheduled';
          }
          setStatusMode(calculatedStatus);
        } else {
          toast.error('Failed to load campaign');
        }
      } catch (err) {
        toast.error('Failed to load campaign');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  // Synchronize local redirection states into formData.redirectUrl
  useEffect(() => {
    if (loading) return; // Prevent overwriting fetched values on initial render
    
    let computedUrl = '';
    
    if (popupActionType !== 'none') {
      if (popupActionType === 'product' && selectedTargetId) {
        computedUrl = `/products/detail?id=${selectedTargetId}`;
      } else if (popupActionType === 'category' && selectedTargetId) {
        computedUrl = `/products?category=${selectedTargetId}`;
      } else if (popupActionType === 'vendor' && selectedTargetId) {
        computedUrl = `/vendors/${selectedTargetId}`;
      } else if (popupActionType === 'collection' && selectedTargetId) {
        computedUrl = `/products?collection=${selectedTargetId}`;
      } else if (popupActionType === 'coupon') {
        computedUrl = '/promotions';
      }
    } else {
      if (redirectType === 'home') computedUrl = '/';
      else if (redirectType === 'shop') computedUrl = '/products';
      else if (redirectType === 'categories') computedUrl = '/categories';
      else if (redirectType === 'vendors') computedUrl = '/vendors';
      else if (redirectType === 'products') computedUrl = '/products';
      else if (redirectType === 'offers') computedUrl = '/promotions';
      else if (redirectType === 'coupon') computedUrl = '/promotions';
      else if (redirectType === 'contact') computedUrl = '/about';
      else if (redirectType === 'about') computedUrl = '/about';
      else if (redirectType === 'external') computedUrl = externalUrl;
    }

    setFormData(prev => ({ ...prev, redirectUrl: computedUrl }));
  }, [redirectType, externalUrl, popupActionType, selectedTargetId, loading]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'desktopImage' | 'mobileImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'desktopImage') setUploadingDesktop(true);
    else setUploadingMobile(true);

    try {
      const token = localStorage.getItem('namma_orru_token');
      const body = new FormData();
      body.append('image', file);

      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body
      });
      const data = await res.json();

      if (res.ok && data.url) {
        setFormData(prev => ({ ...prev, [field]: data.url }));
        toast.success('Image uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload image');
      }
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingDesktop(false);
      setUploadingMobile(false);
    }
  };

  const handleStatusChange = (mode: 'active' | 'scheduled' | 'disabled') => {
    setStatusMode(mode);
    setFormData(prev => ({
      ...prev,
      isActive: mode !== 'disabled',
      // If we go active manually, clear future dates that might keep it scheduled
      startDate: mode === 'active' ? '' : prev.startDate
    }));
  };

  const getStatusExplanation = () => {
    const isCampActive = statusMode !== 'disabled';
    const now = new Date();
    const sDate = formData.startDate ? new Date(formData.startDate) : null;
    const eDate = formData.endDate ? new Date(formData.endDate) : null;

    if (!isCampActive) {
      return { text: 'Campaign is manually disabled and will not show to users.', color: 'text-rose-600' };
    }
    if (statusMode === 'scheduled' || (sDate && sDate > now)) {
      return { 
        text: `Campaign is scheduled to automatically go live on ${sDate ? sDate.toLocaleString() : 'the start date'}.`, 
        color: 'text-amber-600 font-bold' 
      };
    }
    if (eDate && eDate < now) {
      return { text: `Campaign has expired on ${eDate.toLocaleString()} and is no longer showing.`, color: 'text-slate-400' };
    }
    return { text: 'Campaign is currently live and active on the homepage.', color: 'text-emerald-600 font-bold' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('namma_orru_token');
      const activeValue = statusMode !== 'disabled';
      
      const payload = {
        ...formData,
        isActive: activeValue,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        displayDelay: parseInt(formData.displayDelay) || 0,
        priority: parseInt(formData.priority) || 0,
        discountPct: formData.discountPct ? parseFloat(formData.discountPct) : null
      };

      const res = await fetch(`${API_URL}/api/popup-campaigns/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success('Campaign updated successfully!');
        router.push('/admin/marketing/popup-campaigns');
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Failed to update campaign');
      }
    } catch (err) {
      toast.error('An error occurred while updating campaign');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Preview elements variables
  const showEmailFormInPreview = formData.popupType === 'NEWSLETTER' || formData.popupType === 'FIRST_ORDER';
  const previewDesktopImage = formData.desktopImage || '';
  const previewMobileImage = formData.mobileImage || formData.desktopImage || '';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/marketing/popup-campaigns"
          className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
            Edit <span className="text-emerald-600">Popup Campaign</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-1">
            Update and customize campaign details & display rules
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Card 1: Campaign Status & General Settings */}
          <div className="bg-white rounded-[25px] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Campaign Status</span>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'active', label: 'Active', color: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', activeBg: 'bg-emerald-50' },
                  { id: 'scheduled', label: 'Scheduled', color: 'bg-amber-400', text: 'text-amber-700', border: 'border-amber-200', activeBg: 'bg-amber-50' },
                  { id: 'disabled', label: 'Disabled', color: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-200', activeBg: 'bg-rose-50' }
                ].map(opt => {
                  const isSelected = statusMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleStatusChange(opt.id as any)}
                      className={`h-14 rounded-2xl border-2 flex items-center justify-center gap-2.5 transition-all ${
                        isSelected
                          ? `${opt.activeBg} ${opt.border} ${opt.text} font-black scale-[1.02] shadow-sm`
                          : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${opt.color}`} />
                      <span className="text-xs uppercase tracking-wider">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Automated explanation */}
              <div className="flex items-start gap-2 pt-2">
                <AlertCircle size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <p className={`text-[11px] font-bold ${getStatusExplanation().color}`}>
                  {getStatusExplanation().text}
                </p>
              </div>
            </div>

            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
              Basic Campaign Information
            </h3>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Popup Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Taste the purity of namma ooru"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Popup Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Limited Time Invitation"
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description / Message</label>
              <textarea
                placeholder="e.g. Join 10,000+ families eating fresh, chemical-free produce direct from local farmers."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="h-24 w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-all resize-none"
              />
            </div>

            {/* Popup Type */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Popup Layout Type</label>
              <select
                value={formData.popupType}
                onChange={e => setFormData({ ...formData, popupType: e.target.value })}
                className="h-12 w-full px-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-xs text-slate-700 focus:bg-white focus:border-emerald-600 transition-colors cursor-pointer"
              >
                <option value="NEWSLETTER">Newsletter Subscription</option>
                <option value="FIRST_ORDER">First Order Offer</option>
                <option value="COUPON">Coupon Highlight</option>
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="FESTIVAL">Festival Offer</option>
              </select>
            </div>
          </div>

          {/* Card 2: Visual Media & Guidelines */}
          <div className="bg-white rounded-[25px] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
              Campaign Images
            </h3>

            {/* Image Guidelines Box */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-3 relative overflow-hidden text-left">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-950">Uploader Guidelines</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] font-bold text-slate-500">
                <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Desktop Size</p>
                  <p className="font-black text-slate-800">700 × 600 px</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Mobile Size</p>
                  <p className="font-black text-slate-800">400 × 600 px</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Format</p>
                  <p className="font-black text-slate-800">PNG / JPG / WEBP</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-2.5">
                  <p className="text-[9px] uppercase tracking-widest text-slate-400 mb-0.5">Max Weight</p>
                  <p className="font-black text-red-600">2 MB</p>
                </div>
              </div>
            </div>

            {/* Upload grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Desktop Image */}
              <div className="space-y-3 text-left">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">
                  Desktop Image <span className="text-slate-350">(700 × 600 px, Aspect 7:6)</span>
                </label>
                
                {formData.desktopImage ? (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="relative aspect-[7/6] w-full rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                      <img
                        src={formData.desktopImage}
                        alt="Desktop Popup Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById('desktop-image-file')?.click()}
                        disabled={uploadingDesktop}
                        className="flex-1 h-11 rounded-xl border-2 border-slate-200 hover:border-slate-350 text-slate-700 bg-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                      >
                        {uploadingDesktop ? <Loader2 size={14} className="animate-spin text-slate-400" /> : 'Replace'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, desktopImage: '' }))}
                        className="h-11 px-4 rounded-xl border-2 border-red-100 hover:border-red-200 text-red-600 bg-white font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !uploadingDesktop && document.getElementById('desktop-image-file')?.click()}
                    className="aspect-[7/6] w-full rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all"
                  >
                    {uploadingDesktop ? (
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    ) : (
                      <>
                        <Upload className="text-slate-400" size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">+ Upload Desktop Image</span>
                      </>
                    )}
                  </div>
                )}
                
                <input
                  id="desktop-image-file"
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageUpload(e, 'desktopImage')}
                  className="hidden"
                />
              </div>

              {/* Mobile Image */}
              <div className="space-y-3 text-left">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">
                  Mobile Image <span className="text-slate-350">(400 × 600 px, Aspect 2:3)</span>
                </label>
                
                {formData.mobileImage ? (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="relative aspect-[2/3] max-h-[190px] mx-auto rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                      <img
                        src={formData.mobileImage}
                        alt="Mobile Popup Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-2 max-w-[190px] mx-auto">
                      <button
                        type="button"
                        onClick={() => document.getElementById('mobile-image-file')?.click()}
                        disabled={uploadingMobile}
                        className="flex-1 h-11 rounded-xl border-2 border-slate-200 hover:border-slate-350 text-slate-700 bg-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                      >
                        {uploadingMobile ? <Loader2 size={14} className="animate-spin text-slate-400" /> : 'Replace'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, mobileImage: '' }))}
                        className="h-11 px-3 rounded-xl border-2 border-red-100 hover:border-red-200 text-red-600 bg-white font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !uploadingMobile && document.getElementById('mobile-image-file')?.click()}
                    className="aspect-[2/3] max-h-[190px] mx-auto w-full rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all"
                  >
                    {uploadingMobile ? (
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    ) : (
                      <>
                        <Upload className="text-slate-400" size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">+ Upload Mobile Image</span>
                      </>
                    )}
                  </div>
                )}
                
                <input
                  id="mobile-image-file"
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageUpload(e, 'mobileImage')}
                  className="hidden"
                />
              </div>

            </div>
          </div>

          {/* Card 3: Action Buttons & Redirections */}
          <div className="bg-white rounded-[25px] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
              Popup Button Actions
            </h3>

            {/* Button text */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Button Text</label>
              <input
                type="text"
                placeholder="e.g. Claim Offer / Shop Now"
                value={formData.buttonText}
                onChange={e => setFormData({ ...formData, buttonText: e.target.value })}
                className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
              />
            </div>

            {/* Redirect To selection */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Redirect To Page</label>
                {redirectType !== 'none' && (
                  <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                    <Check size={10} strokeWidth={3} /> Path: {formData.redirectUrl}
                  </span>
                )}
              </div>
              <select
                value={redirectType}
                onChange={e => {
                  setRedirectType(e.target.value);
                  setPopupActionType('none'); // Clear specific target action to prevent conflicts
                  setSelectedTargetId('');
                }}
                className="h-12 w-full px-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-xs text-slate-700 focus:bg-white focus:border-emerald-600 transition-colors cursor-pointer"
              >
                <option value="none">No Redirect</option>
                <option value="home">Home Page</option>
                <option value="shop">Shop Page</option>
                <option value="categories">Categories Page</option>
                <option value="vendors">Vendors Page</option>
                <option value="offers">Offers Page</option>
                <option value="coupon">Coupon Page</option>
                <option value="contact">Contact Us</option>
                <option value="about">About Us</option>
                <option value="external">External Website</option>
              </select>
            </div>

            {/* Conditional input for External Website URL */}
            {redirectType === 'external' && (
              <div className="space-y-1.5 text-left animate-in slide-in-from-top-2 duration-200">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Website URL *</label>
                <div className="relative">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    required
                    placeholder="https://example.com"
                    value={externalUrl}
                    onChange={e => setExternalUrl(e.target.value)}
                    className="h-12 w-full pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Section 3: Popup Action (Searchable Link targeting) */}
            <div className="border-t border-slate-150 pt-5 space-y-5">
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Link Specific Target (Alternative)</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  Let users open a specific item without writing paths manually
                </span>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Popup Action</label>
                <select
                  value={popupActionType}
                  onChange={e => {
                    const newType = e.target.value;
                    setPopupActionType(newType);
                    setRedirectType('none'); // Clear general redirection to prevent state conflicts
                    setSelectedTargetId('');
                    
                    if (newType === 'coupon') {
                      setSelectedTargetId('coupon');
                    }
                  }}
                  className="h-12 w-full px-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-xs text-slate-700 focus:bg-white focus:border-emerald-600 transition-colors cursor-pointer"
                >
                  <option value="none">None</option>
                  <option value="product">Open Product</option>
                  <option value="category">Open Category</option>
                  <option value="vendor">Open Vendor</option>
                  <option value="coupon">Open Coupon</option>
                  <option value="collection">Open Collection</option>
                </select>
              </div>

              {/* Autocomplete selectors */}
              {popupActionType !== 'none' && popupActionType !== 'coupon' && (
                <div className="space-y-1.5 text-left animate-in slide-in-from-top-2 duration-200">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                    Search & Select {popupActionType} *
                  </label>
                  <SearchableSelect
                    type={popupActionType as any}
                    value={selectedTargetId}
                    onChange={(val, name) => {
                      setSelectedTargetId(val);
                      toast.success(`Target linked: ${name}`);
                    }}
                    placeholder={`Search ${popupActionType}...`}
                  />
                </div>
              )}
            </div>

            {/* Coupons & Discounts (Section 4) */}
            <div className="border-t border-slate-150 pt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="space-y-1.5 text-left md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Apply Coupon (Optional)</label>
                <select
                  value={formData.couponCode}
                  onChange={e => {
                    const code = e.target.value;
                    setFormData(prev => ({ ...prev, couponCode: code }));
                    
                    // Pre-fill percentage value if found in selected coupon
                    const match = coupons.find((c: any) => c.code === code);
                    if (match && match.type === 'PERCENTAGE') {
                      setFormData(prev => ({ ...prev, discountPct: String(match.value) }));
                    }
                  }}
                  className="h-12 w-full px-4 rounded-xl bg-slate-50 border-2 border-slate-100 outline-none font-bold text-xs text-slate-700 focus:bg-white focus:border-emerald-600 transition-colors cursor-pointer"
                >
                  <option value="">Select Coupon</option>
                  {coupons?.map((c: any) => (
                    <option key={c.id} value={c.code}>
                      {c.code} ({c.type === 'PERCENTAGE' ? `${c.value}%` : `₹${c.value}`} Off)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 20"
                  value={formData.discountPct}
                  onChange={e => setFormData({ ...formData, discountPct: e.target.value })}
                  className="h-12 w-full px-4 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:bg-white focus:border-emerald-600 transition-colors"
                />
              </div>

            </div>

          </div>

          {/* Card 4: Display Settings & Timing Rules */}
          <div className="bg-white rounded-[25px] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
              Display Settings
            </h3>

            {/* Smart Steppers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NumberStepper
                label="Display Delay (Seconds)"
                value={formData.displayDelay}
                onChange={val => setFormData(prev => ({ ...prev, displayDelay: val }))}
              />
              <NumberStepper
                label="Display Priority Order"
                value={formData.priority}
                onChange={val => setFormData(prev => ({ ...prev, priority: val }))}
              />
            </div>

            {/* Datepickers (Conditional: highlight if scheduled) */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-2xl border transition-all ${
              statusMode === 'scheduled' 
                ? 'bg-amber-50/40 border-amber-200 shadow-sm shadow-amber-400/5' 
                : 'bg-slate-50/50 border-slate-100'
            }`}>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Campaign Start Date {statusMode === 'scheduled' && '*'}
                </label>
                <input
                  type="datetime-local"
                  required={statusMode === 'scheduled'}
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="h-12 w-full px-4 rounded-xl bg-white border border-slate-200 outline-none font-bold text-xs text-slate-700 focus:bg-white focus:border-emerald-600 transition-colors cursor-pointer"
                />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Campaign End Date</label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="h-12 w-full px-4 rounded-xl bg-white border border-slate-200 outline-none font-bold text-xs text-slate-700 focus:bg-white focus:border-emerald-600 transition-colors cursor-pointer"
                />
              </div>
            </div>

            {/* Behavioral rules toggles */}
            <div className="space-y-3 bg-slate-50/60 p-5 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 text-left">
                Audience Exclusion & Frequency Rules
              </span>
              
              <div className="grid grid-cols-1 gap-3">
                <ToggleSwitch
                  label="Show Once Per Session"
                  description="Do not spam. Display only once until user closes tab/browser"
                  checked={formData.oncePerSession}
                  onChange={val => setFormData(prev => ({ ...prev, oncePerSession: val }))}
                />
                
                <ToggleSwitch
                  label="Show Once Per User"
                  description="Lifetime cap. Display only once per unique visitor"
                  checked={formData.oncePerUser}
                  onChange={val => setFormData(prev => ({ ...prev, oncePerUser: val }))}
                />
                
                <ToggleSwitch
                  label="Guest Users Only"
                  description="Show only to anonymous/non-logged-in sessions"
                  checked={formData.onlyGuest}
                  onChange={val => setFormData(prev => ({ 
                    ...prev, 
                    onlyGuest: val,
                    onlyLoggedIn: val ? false : prev.onlyLoggedIn // Mutually exclusive
                  }))}
                />

                <ToggleSwitch
                  label="Logged-in Users Only"
                  description="Show only to authenticated member sessions"
                  checked={formData.onlyLoggedIn}
                  onChange={val => setFormData(prev => ({ 
                    ...prev, 
                    onlyLoggedIn: val,
                    onlyGuest: val ? false : prev.onlyGuest // Mutually exclusive
                  }))}
                />
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 justify-end pt-4">
            <Link
              href="/admin/marketing/popup-campaigns"
              className="h-12 px-6 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
            </button>
          </div>

        </form>

        {/* Live Preview Column (Sticky) */}
        <div className="bg-slate-900 rounded-[30px] p-6 sm:p-8 border border-slate-800 shadow-2xl sticky top-8 text-white min-h-[520px] flex flex-col justify-between overflow-hidden">
          
          {/* Preview Header / Device Toggle */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Live Visual Preview
            </span>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                  previewMode === 'desktop' ? 'bg-amber-400 text-emerald-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
                  previewMode === 'mobile' ? 'bg-amber-400 text-emerald-950 shadow-md font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Mobile
              </button>
            </div>
          </div>

          {/* Active Preview Deck */}
          <div className="my-8 flex justify-center items-center flex-1">
            {previewMode === 'desktop' ? (
              
              /* Desktop Preview (Horizontal layout) */
              <div className="w-full max-w-[650px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[320px] text-slate-800 animate-in fade-in duration-300">
                {/* Image side */}
                <div className="relative w-full md:w-[45%] h-36 md:h-auto bg-emerald-900 overflow-hidden flex flex-col justify-end p-6 text-white min-h-[160px]">
                  {previewDesktopImage ? (
                    <img
                      src={previewDesktopImage}
                      alt="Upload Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 to-emerald-800 flex items-center justify-center text-slate-500/50">
                      <Gift size={48} strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-emerald-950/70 via-transparent to-transparent z-0" />
                  
                  <div className="relative z-10 text-left">
                    <div className="h-10 w-10 rounded-2xl bg-amber-400 flex items-center justify-center shadow-lg mb-2 rotate-3 shrink-0">
                      <Gift className="h-5 w-5 text-emerald-950" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter leading-none">
                      {formData.discountPct ? `${formData.discountPct}%` : 'DEAL'}<span className="text-amber-400">OFF</span>
                    </h2>
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-85 mt-0.5">
                      {formData.popupType.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {/* Content side */}
                <div className="flex-1 p-6 md:p-8 bg-white relative flex flex-col justify-center text-left">
                  <button type="button" className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-150 transition-all shrink-0">
                    <X size={14} />
                  </button>

                  <div className="space-y-4">
                    <div className="flex items-center gap-1.5">
                      <div className="h-[1px] w-6 bg-amber-400" />
                      <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">
                        {formData.subtitle || 'Invitation Header'}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-emerald-950 tracking-tighter leading-tight">
                      {formData.title || 'Taste the pure goodness'}
                    </h3>

                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      {formData.description || 'Enter description context here.'}
                    </p>

                    {showEmailFormInPreview ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                          <input
                            type="email"
                            disabled
                            placeholder="Your email address"
                            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-400"
                          />
                        </div>
                        <button
                          type="button"
                          className="w-full h-10 bg-emerald-950 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          {formData.buttonText}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="w-full h-10 bg-amber-400 hover:bg-amber-500 text-emerald-950 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        {formData.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              </div>

            ) : (

              /* Mobile Preview (Vertical layout) */
              <div className="w-full max-w-[320px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col min-h-[440px] text-slate-800 animate-in fade-in duration-300">
                {/* Image side */}
                <div className="relative w-full h-44 bg-emerald-900 overflow-hidden flex flex-col justify-end p-5 text-white">
                  {previewMobileImage ? (
                    <img
                      src={previewMobileImage}
                      alt="Upload Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 to-emerald-800 flex items-center justify-center text-slate-500/50">
                      <Gift size={40} strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/75 via-transparent to-transparent z-0" />
                  
                  <div className="relative z-10 text-left">
                    <h2 className="text-xl font-black tracking-tighter leading-none">
                      {formData.discountPct ? `${formData.discountPct}%` : 'DEAL'}<span className="text-amber-400">OFF</span>
                    </h2>
                    <p className="text-[7px] font-black uppercase tracking-widest opacity-85 mt-0.5">
                      {formData.popupType.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                {/* Content side */}
                <div className="flex-1 p-5 bg-white relative flex flex-col justify-center text-left">
                  <button type="button" className="absolute top-4 right-4 h-7 w-7 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-150 transition-all shrink-0">
                    <X size={12} />
                  </button>

                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <div className="h-[1px] w-4 bg-amber-400" />
                      <span className="text-[7.5px] font-black text-amber-500 uppercase tracking-widest">
                        {formData.subtitle || 'Invitation Header'}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-emerald-950 tracking-tighter leading-snug">
                      {formData.title || 'Taste the pure goodness'}
                    </h3>

                    <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-3">
                      {formData.description || 'Enter description context here.'}
                    </p>

                    {showEmailFormInPreview ? (
                      <div className="space-y-1.5 pt-1">
                        <input
                          type="email"
                          disabled
                          placeholder="Your email address"
                          className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-[10px] text-slate-400"
                        />
                        <button
                          type="button"
                          className="w-full h-9 bg-emerald-950 text-white rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                          {formData.buttonText}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="w-full h-9 bg-amber-400 hover:bg-amber-500 text-emerald-950 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                        {formData.buttonText}
                      </button>
                    )}
                  </div>
                </div>
              </div>

            )}
          </div>

          {/* Footer Info */}
          <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-4 font-bold uppercase tracking-wider text-center">
            Delay: {formData.displayDelay}s • Per Session: {formData.oncePerSession ? 'Yes' : 'No'} • Redirect: {formData.redirectUrl || 'None'}
          </div>

        </div>

      </div>
    </div>
  );
}
