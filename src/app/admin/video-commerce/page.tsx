'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Video as VideoIcon, Plus, Trash2, Edit2, Play, Pause,
  Loader2, Link2, Search, Sparkles, Calendar, Tag, User,
  Layers, Upload, X, Check, RefreshCw, AlertCircle,
  LayoutGrid, List, Eye, Heart
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import Image from 'next/image';

interface VideoItem {
  id: number;
  title: string;
  slug?: string;
  description?: string;
  videoUrl: string;
  thumbnail?: string;
  productId?: number;
  price?: number;
  sortOrder: number;
  isActive: boolean;
  vendorId?: number;
  categoryId?: number;
  relatedProductIds: number[];
  tags: string[];
  publishStatus: string;
  scheduledAt?: string;
  aiMetadata?: {
    captions?: string;
    seoTitle?: string;
    seoKeywords?: string;
    seoDescription?: string;
  };
  viewCount: number;
  likes: number;
  createdAt: string;
  product?: { name: string; price?: number | string };
  vendor?: { name: string };
  category?: { name: string };
  relatedProducts?: { id: number; name: string }[];
}

interface DropdownItem {
  id: number;
  name: string;
  categoryId?: number;
  subVendorId?: number;
  price?: string | number;
}

interface SearchableSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { id: number | string; name: string }[];
  placeholder: string;
  emptyLabel: string;
}

function SearchableSelect({ label, value, onChange, options, placeholder, emptyLabel }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedItem = options.find(opt => String(opt.id) === String(value));
  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(search.toLowerCase()) ||
    String(opt.id).includes(search)
  );

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">{label}</label>

      <div
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 flex items-center justify-between cursor-pointer focus-within:border-emerald-600 transition-all select-none hover:bg-slate-100/50"
      >
        <span className={`text-xs font-bold ${selectedItem ? 'text-slate-800' : 'text-slate-450'}`}>
          {selectedItem ? selectedItem.name : placeholder}
        </span>
        <Search size={14} className="text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-150 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent border-none outline-none text-xs font-bold text-slate-800 placeholder-slate-450"
              autoFocus
            />
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
            <div
              onClick={() => { onChange(''); setIsOpen(false); }}
              className="px-4 py-3 text-xs font-bold text-slate-400 hover:bg-slate-50 cursor-pointer transition-all"
            >
              {emptyLabel}
            </div>
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-4 text-xs font-medium text-slate-400 text-center">
                No matching results found
              </div>
            ) : (
              filteredOptions.map(opt => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(String(opt.id));
                    setIsOpen(false);
                  }}
                  className={`px-4 py-3 text-xs font-bold cursor-pointer transition-all hover:bg-slate-50 flex items-center justify-between ${String(opt.id) === String(value)
                    ? 'text-emerald-700 bg-emerald-50/50'
                    : 'text-slate-700'
                    }`}
                >
                  <span>{opt.name}</span>
                  {String(opt.id) === String(value) && <Check size={14} className="text-emerald-600 animate-in zoom-in-50 duration-150" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminVideoCommercePage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [products, setProducts] = useState<DropdownItem[]>([]);
  const [vendors, setVendors] = useState<DropdownItem[]>([]);
  const [categories, setCategories] = useState<DropdownItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // View Mode: grid or list
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // Video Preview Modal
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [productId, setProductId] = useState('');
  const [price, setPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [publishStatus, setPublishStatus] = useState('PUBLISHED');
  const [scheduledAt, setScheduledAt] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Statistics Calculations
  const totalVideos = videos.length;
  const publishedVideos = videos.filter(v => v.publishStatus === 'PUBLISHED').length;
  const draftVideos = videos.filter(v => v.publishStatus === 'DRAFT').length;
  const totalViews = videos.reduce((acc, v) => acc + (v.viewCount || 0), 0);
  const totalClicks = videos.reduce((acc, v) => acc + (v.likes || 0), 0);

  // Tagged / Related Products state
  const [selectedRelatedIds, setSelectedRelatedIds] = useState<number[]>([]);
  const [productSearch, setProductSearch] = useState('');

  // AI states
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiSubtitles, setAiSubtitles] = useState('');
  const [aiSeoTitle, setAiSeoTitle] = useState('');
  const [aiSeoKeywords, setAiSeoKeywords] = useState('');
  const [aiSeoDescription, setAiSeoDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [durationError, setDurationError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // Auto-populate Category, Vendor, and Price when a Primary Product is selected
  const handleProductChange = (prodId: string) => {
    setProductId(prodId);
    if (prodId) {
      const selectedProduct = products.find(p => p.id === Number(prodId));
      if (selectedProduct) {
        if (selectedProduct.subVendorId) {
          setVendorId(String(selectedProduct.subVendorId));
        }
        if (selectedProduct.categoryId) {
          setCategoryId(String(selectedProduct.categoryId));
        }
        if (selectedProduct.price) {
          setPrice(String(selectedProduct.price));
        }
      }
    } else {
      setVendorId('');
      setCategoryId('');
      setPrice('');
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videosRes, productsRes, vendorsRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/api/videos`),
          fetch(`${API_URL}/api/products`),
          fetch(`${API_URL}/api/brands`), // Brands mapping
          fetch(`${API_URL}/api/categories`)
        ]);

        const [videosData, productsData, vendorsData, categoriesData] = await Promise.all([
          videosRes.json(),
          productsRes.json(),
          vendorsRes.json(),
          categoriesRes.json()
        ]);

        setVideos(Array.isArray(videosData) ? videosData : []);

        // Handle products list mapping
        const mappedProducts = Array.isArray(productsData)
          ? productsData.map((p: any) => ({
            id: p.id,
            name: p.name,
            categoryId: p.categoryId,
            subVendorId: p.subVendorId,
            price: p.price
          }))
          : (Array.isArray(productsData.products)
            ? productsData.products.map((p: any) => ({
              id: p.id,
              name: p.name,
              categoryId: p.categoryId,
              subVendorId: p.subVendorId,
              price: p.price
            }))
            : []);
        setProducts(mappedProducts);

        // Handle vendors list mapping
        const mappedVendors = Array.isArray(vendorsData)
          ? vendorsData.map((v: any) => ({ id: v.id, name: v.name }))
          : (Array.isArray(vendorsData.subVendors) ? vendorsData.subVendors.map((v: any) => ({ id: v.id, name: v.name })) : []);
        setVendors(mappedVendors);

        // Handle categories list mapping
        const mappedCategories = Array.isArray(categoriesData)
          ? categoriesData.map((c: any) => ({ id: c.id, name: c.name }))
          : (Array.isArray(categoriesData.categories) ? categoriesData.categories.map((c: any) => ({ id: c.id, name: c.name })) : []);
        setCategories(mappedCategories);

      } catch (err) {
        console.error('Failed to load video commerce admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Validate video file & extract duration and auto-thumbnail
  const handleVideoFileChange = async (file: File | null) => {
    if (!file) {
      setVideoFile(null);
      setVideoDuration(null);
      setDurationError('');
      return;
    }

    // Check mime type
    if (!file.type.startsWith('video/')) {
      setDurationError('Please upload a valid MP4 or WebM video file');
      return;
    }

    setVideoFile(file);
    setDurationError('');

    // Create virtual video element to read metadata
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = async () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      setVideoDuration(duration);

      if (duration < 15 || duration > 90) {
        setDurationError(`Warning: Video duration is ${Math.round(duration)}s. Recommended: 15s to 90s.`);
      } else {
        setDurationError('');
      }

      // Automatically generate a premium thumbnail locally using Canvas
      try {
        const generatedThumb = await extractVideoFrame(file);
        setThumbnailFile(generatedThumb);
      } catch (err) {
        console.error('Failed to auto-generate thumbnail', err);
      }
    };
  };

  // Canvas frame extraction helper
  const extractVideoFrame = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        // Seek to 1.5 seconds
        video.currentTime = Math.min(1.5, video.duration / 2);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              if (blob) {
                const thumbnailFile = new File([blob], 'ai-thumbnail.jpg', { type: 'image/jpeg' });
                resolve(thumbnailFile);
              } else {
                reject(new Error('Failed to get canvas blob'));
              }
            }, 'image/jpeg', 0.90);
          } else {
            reject(new Error('Failed to create canvas 2d context'));
          }
          window.URL.revokeObjectURL(video.src);
        } catch (err) {
          reject(err);
        }
      };

      video.onerror = (e) => reject(e);
    });
  };

  // Generate AI Metadata via backend endpoint
  const handleAIGenerate = async () => {
    if (!title && !productId) {
      alert('Please enter a title or select a linked product to generate AI suggestions');
      return;
    }
    setGeneratingAI(true);
    try {
      const res = await fetch(`${API_URL}/api/videos/ai-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, productId: productId ? Number(productId) : null })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'AI generation failed');

      // Autofill fields
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);
      if (data.tags) setTagsInput(data.tags.join(', '));
      if (data.categoryId) setCategoryId(data.categoryId.toString());
      if (data.recommendedProducts && data.recommendedProducts.length > 0) {
        const recIds = data.recommendedProducts.map((p: any) => p.id);
        setSelectedRelatedIds(prev => [...new Set([...prev, ...recIds])]);
      }
      if (data.captions) setAiSubtitles(data.captions);
      if (data.seoTitle) setAiSeoTitle(data.seoTitle);
      if (data.seoKeywords) setAiSeoKeywords(data.seoKeywords);
      if (data.seoDescription) setAiSeoDescription(data.seoDescription);

    } catch (err: any) {
      alert('Error calling AI service: ' + err.message);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleEdit = (v: VideoItem) => {
    setEditId(v.id);
    setTitle(v.title);
    setDescription(v.description || '');
    setProductId(v.productId?.toString() || '');
    setPrice(v.price?.toString() || '');
    setSortOrder(v.sortOrder.toString());
    setIsActive(v.isActive);
    setVideoFile(null);
    setThumbnailFile(null);
    setVideoUrl(v.videoUrl || '');
    setThumbnailUrl(v.thumbnail || '');
    setVendorId(v.vendorId?.toString() || '');
    setCategoryId(v.categoryId?.toString() || '');
    setPublishStatus(v.publishStatus || 'PUBLISHED');
    setScheduledAt(v.scheduledAt ? new Date(v.scheduledAt).toISOString().slice(0, 16) : '');
    setTagsInput(v.tags ? v.tags.join(', ') : '');
    setSelectedRelatedIds(v.relatedProductIds || []);

    // AI Metadata
    setAiSubtitles(v.aiMetadata?.captions || '');
    setAiSeoTitle(v.aiMetadata?.seoTitle || '');
    setAiSeoKeywords(v.aiMetadata?.seoKeywords || '');
    setAiSeoDescription(v.aiMetadata?.seoDescription || '');

    setShowForm(true);
    setDurationError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setProductId('');
    setPrice('');
    setSortOrder('0');
    setIsActive(true);
    setVideoFile(null);
    setThumbnailFile(null);
    setVideoUrl('');
    setThumbnailUrl('');
    setVendorId('');
    setCategoryId('');
    setPublishStatus('PUBLISHED');
    setScheduledAt('');
    setTagsInput('');
    setSelectedRelatedIds([]);
    setProductSearch('');
    setAiSubtitles('');
    setAiSeoTitle('');
    setAiSeoKeywords('');
    setAiSeoDescription('');
    setDurationError('');
    setVideoDuration(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editId
        ? `${API_URL}/api/videos/${editId}`
        : `${API_URL}/api/videos`;
      const method = editId ? 'PUT' : 'POST';

      const tagsArray = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const aiMetadataPayload = {
        captions: aiSubtitles,
        seoTitle: aiSeoTitle,
        seoKeywords: aiSeoKeywords,
        seoDescription: aiSeoDescription
      };

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (productId) formData.append('productId', productId);
      if (price) formData.append('price', price);
      formData.append('sortOrder', sortOrder);
      formData.append('isActive', isActive.toString());
      if (vendorId) formData.append('vendorId', vendorId);
      if (categoryId) formData.append('categoryId', categoryId);
      formData.append('publishStatus', publishStatus);
      if (scheduledAt) formData.append('scheduledAt', new Date(scheduledAt).toISOString());
      formData.append('tags', JSON.stringify(tagsArray));
      formData.append('relatedProductIds', JSON.stringify(selectedRelatedIds));
      formData.append('aiMetadata', JSON.stringify(aiMetadataPayload));

      if (videoUrl) formData.append('videoUrl', videoUrl);
      if (videoFile) formData.append('video', videoFile);

      if (thumbnailUrl) formData.append('thumbnailUrl', thumbnailUrl);
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to submit form');

      // Update videos list
      if (editId) {
        setVideos(prev => prev.map(v => v.id === editId ? data : v));
      } else {
        setVideos(prev => [data, ...prev].sort((a, b) => a.sortOrder - b.sortOrder));
      }
      resetForm();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteVideo = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this video?')) return;
    try {
      const res = await fetch(`${API_URL}/api/videos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setVideos(prev => prev.filter(v => v.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleStatus = async (v: VideoItem) => {
    try {
      const formData = new FormData();
      formData.append('isActive', (!v.isActive).toString());

      const res = await fetch(`${API_URL}/api/videos/${v.id}`, {
        method: 'PUT',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setVideos(prev => prev.map(bv => bv.id === v.id ? data : bv));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Related products filtering
  const filteredProductsList = productSearch
    ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
    : products.slice(0, 10);

  const toggleRelatedProduct = (id: number) => {
    setSelectedRelatedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-75 w-full max-w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
            <VideoIcon className="h-9 w-9 text-emerald-600 animate-pulse" />
            Shop By Video <span className="text-emerald-600 font-serif font-normal lowercase tracking-normal">commerce</span>
          </h1>
          <p className="text-slate-400 font-semibold text-sm mt-2">
            AI-powered Shoppable Videos, Instagram Reels & Social Commerce engine.
          </p>
        </div>
        <button
          onClick={() => { showForm ? resetForm() : setShowForm(true); }}
          className={`h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2.5 transition-all shadow-lg active:scale-95 ${showForm
            ? 'bg-slate-100 text-slate-600 border border-slate-200'
            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/10'
            }`}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Close Editor' : 'Upload Video Reel'}
        </button>
      </div>

      {/* Upload & Form Section */}
      {showForm && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 md:p-12 animate-in slide-in-from-top-6 duration-300">
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="text-amber-500 h-5 w-5 animate-spin-slow" />
              {editId ? 'Edit Shoppable Story' : 'Configure New Video Story'}
            </h3>
            <button
              type="submit"
              form="video-commerce-form"
              disabled={submitting}
              className="h-10 px-6 bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest rounded-full shadow-md shadow-emerald-600/10 flex items-center gap-2 hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {editId ? 'Save Changes' : 'Publish Story'}
            </button>
          </div>

          <form id="video-commerce-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

              {/* Left Column: Media Uploaders */}
              <div className="space-y-6">
                {/* Video Upload Field */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">1. Video Source *</label>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-3 border-dashed rounded-[2rem] p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden group ${videoFile || videoUrl
                      ? 'border-emerald-500 bg-emerald-50/10'
                      : 'border-slate-200 hover:border-emerald-500 bg-slate-50/50'
                      }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={e => handleVideoFileChange(e.target.files?.[0] || null)}
                    />

                    {videoFile ? (
                      <div className="space-y-2 z-10">
                        <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                          <Check size={24} />
                        </div>
                        <p className="text-xs font-black text-slate-700 truncate max-w-[200px]">{videoFile.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          Size: {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                        {videoDuration && (
                          <span className="inline-block text-[9px] font-black uppercase bg-slate-900 text-white px-2 py-0.5 rounded-full">
                            Duration: {Math.round(videoDuration)}s
                          </span>
                        )}
                      </div>
                    ) : videoUrl ? (
                      <div className="space-y-2 z-10">
                        <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                          <Link2 size={20} />
                        </div>
                        <p className="text-xs font-black text-slate-700 truncate max-w-[200px]">{videoUrl}</p>
                        <span className="inline-block text-[9px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                          Cloud URL Link
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="h-14 w-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                          <Upload size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-700">Drag & Drop Video here</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">MP4, WebM (15s – 90s)</p>
                        </div>
                      </div>
                    )}

                    {(videoFile || videoUrl) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoFile(null);
                          setVideoUrl('');
                          setVideoDuration(null);
                          setDurationError('');
                        }}
                        className="absolute top-4 right-4 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-90"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {durationError && (
                    <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase mt-2">
                      <AlertCircle size={12} /> {durationError}
                    </div>
                  )}
                </div>

                {/* External Video Url fallbacks */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Or Link External Video URL</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://cloudfront.net/video.mp4"
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Thumbnail Selector */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">
                    2. AI Thumbnail Cover *
                  </label>
                  <div
                    onClick={() => thumbInputRef.current?.click()}
                    className="relative aspect-[9/16] max-w-[140px] rounded-[1.5rem] bg-slate-100 overflow-hidden border-2 border-dashed border-slate-200 hover:border-emerald-500 cursor-pointer flex flex-col items-center justify-center mx-auto transition-all"
                  >
                    <input
                      type="file"
                      ref={thumbInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={e => setThumbnailFile(e.target.files?.[0] || null)}
                    />

                    {thumbnailFile ? (
                      <img
                        src={URL.createObjectURL(thumbnailFile)}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    ) : thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Sparkles size={18} className="text-amber-500 mx-auto animate-pulse mb-1" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Auto-extracted or Upload</span>
                      </div>
                    )}

                    {(thumbnailFile || thumbnailUrl) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setThumbnailFile(null);
                          setThumbnailUrl('');
                        }}
                        className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-95"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Column: Core Information */}
              <div className="space-y-6">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Title *</label>
                  <input
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Traditional Wooden Groundnut Oil Extraction"
                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Provide a cinematic description of the video..."
                    rows={3}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:border-emerald-600 resize-none"
                  />
                </div>                {/* Primary Tagged Product */}
                <div className="grid grid-cols-2 gap-4">
                  <SearchableSelect
                    label="Primary Product ID"
                    value={productId}
                    onChange={handleProductChange}
                    options={products.map(p => ({ id: p.id, name: `ID ${p.id}: ${p.name}` }))}
                    placeholder="-- None Selected --"
                    emptyLabel="-- None Selected --"
                  />

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Display Price Override</label>
                    <input
                      type="number"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="e.g. 299"
                      className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Vendor and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <SearchableSelect
                    label="Linked Brand / Vendor"
                    value={vendorId}
                    onChange={setVendorId}
                    options={vendors}
                    placeholder="-- Select Vendor --"
                    emptyLabel="-- Select Vendor --"
                  />

                  <SearchableSelect
                    label="Marketplace Category"
                    value={categoryId}
                    onChange={setCategoryId}
                    options={categories}
                    placeholder="-- Select Category --"
                    emptyLabel="-- Select Category --"
                  />
                </div>
              </div>

              {/* Right Column: Publishing, Scheduling, Tagged Products */}
              <div className="space-y-6">
                {/* Publish status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Publish Status</label>
                    <select
                      value={publishStatus}
                      onChange={e => setPublishStatus(e.target.value)}
                      className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 text-xs font-bold outline-none focus:border-emerald-600"
                    >
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                      <option value="SCHEDULED">Scheduled</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Priority Order</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={e => setSortOrder(e.target.value)}
                      className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Scheduled time */}
                {publishStatus === 'SCHEDULED' && (
                  <div className="space-y-1 animate-in fade-in duration-300">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block flex items-center gap-1.5">
                      <Calendar size={12} className="text-emerald-600" /> Scheduled Launch Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={e => setScheduledAt(e.target.value)}
                      className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-emerald-600"
                    />
                  </div>
                )}

                {/* Related / Tagged Products Selection */}
                <div className="space-y-2 border border-slate-100 p-5 bg-slate-50/40 rounded-3xl">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">
                    Tag Multiple Products
                  </label>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Search and tag products..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-slate-200 text-xs font-semibold outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* Dropdown check items */}
                  <div className="max-h-[140px] overflow-y-auto mt-2 space-y-1.5 pr-2">
                    {filteredProductsList.map(p => {
                      const isSelected = selectedRelatedIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleRelatedProduct(p.id)}
                          className={`flex items-center justify-between p-2 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${isSelected
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                          <span>{p.name}</span>
                          {isSelected && <Check size={12} className="text-emerald-600" />}
                        </div>
                      );
                    })}
                  </div>

                  {selectedRelatedIds.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                        Tagged Products: {selectedRelatedIds.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Feed Toggle */}
                <label className="flex items-center gap-3 cursor-pointer pt-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="h-5 w-5 rounded-lg accent-emerald-600"
                  />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Enable Live Feed</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Toggle to hide or display card</span>
                  </div>
                </label>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 border-t border-slate-100 pt-6">
              <button
                disabled={submitting}
                type="submit"
                className="h-14 px-10 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-3 shadow-lg shadow-emerald-600/10 active:scale-95"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editId ? 'Update' : 'Publish Video'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="h-14 px-8 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List/Grid View Mode & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <h3 className="text-xs uppercase font-black tracking-widest text-slate-400">
          Video Stories Catalog ({videos.length})
        </h3>
        {!loading && videos.length > 0 && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-32 text-center flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Video Commerce Engine...</span>
        </div>
      ) : videos.length === 0 ? (
        <div className="py-32 text-center bg-white border border-slate-100 rounded-[2.5rem] p-10 flex flex-col items-center">
          <VideoIcon size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-black text-slate-700 uppercase tracking-tight mb-1">No Video Stories Active</h3>
          <p className="text-slate-400 font-medium text-xs max-w-xs mx-auto leading-relaxed mb-6">
            There are no videos registered on the marketplace yet. Upload your first short shoppable video!
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="h-12 px-6 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 shadow-lg"
          >
            Add Video
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Video Cards Grid */
        <div
          className="grid gap-6 w-full max-w-none animate-in fade-in duration-200"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
        >
          {videos.map(video => (
            <div
              key={video.id}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col h-[400px] w-full justify-between"
            >
              {/* Thumbnail Container */}
              <div className="relative h-[220px] bg-slate-950 overflow-hidden shrink-0">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 animate-in fade-in duration-300"
                    alt={video.title}
                  />
                ) : (
                  <video
                    src={video.videoUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    muted
                    playsInline
                  />
                )}

                {/* Overlays */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                  <span className="px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-full text-[9px] font-bold text-white flex items-center gap-1">
                    👁 {video.viewCount || 0}
                  </span>
                  <span className="px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-full text-[9px] font-bold text-white flex items-center gap-1">
                    ❤️ {video.likes || 0}
                  </span>
                </div>

                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${video.publishStatus === 'PUBLISHED'
                    ? 'bg-emerald-600 text-white'
                    : video.publishStatus === 'SCHEDULED'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-500 text-white'
                    }`}>
                    {video.publishStatus.toLowerCase()}
                  </span>
                </div>

                {/* Play overlay on hover */}
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => setPreviewVideo(video)}
                    className="h-10 w-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-800 hover:bg-emerald-600 hover:text-white transition-all transform scale-90 group-hover:scale-100 shadow-md"
                    title="Preview Video"
                  >
                    <Play size={16} fill="currentColor" className="ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Bottom Details */}
              <div className="p-3.5 flex flex-col flex-1 justify-between bg-white min-h-0">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-xs text-slate-800 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors" title={video.title}>
                    {video.title}
                  </h4>

                  {video.product ? (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium truncate max-w-[140px]" title={video.product.name}>
                        {video.product.name}
                      </span>
                      <span className="font-extrabold text-slate-800 shrink-0">
                        ₹{video.price || video.product.price || 0}+
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 italic">No linked product</div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar size={10} />
                    {video.createdAt ? new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' }) : 'N/A'}
                  </span>

                  <span className={`font-bold flex items-center gap-1 uppercase tracking-widest text-[8px] ${video.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${video.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    {video.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>

                {/* Quick actions footer */}
                <div className="grid grid-cols-3 gap-1 pt-2.5 border-t border-slate-100">
                  <button
                    onClick={() => handleEdit(video)}
                    className="h-8 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 border border-slate-100 hover:border-emerald-100"
                  >
                    <Edit2 size={10} /> Edit
                  </button>
                  <button
                    onClick={() => setPreviewVideo(video)}
                    className="h-8 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 border border-slate-100 hover:border-amber-100"
                  >
                    <Eye size={10} /> Preview
                  </button>
                  <button
                    onClick={() => deleteVideo(video.id)}
                    className="h-8 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 border border-slate-100 hover:border-rose-100"
                  >
                    <Trash2 size={10} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Video List View Table */
        <div className="w-full bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm animate-in fade-in duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px] admin-data-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <th className="py-4 px-6 w-20">Thumbnail</th>
                  <th className="py-4 px-6">Title</th>
                  <th className="py-4 px-6">Linked Product</th>
                  <th className="py-4 px-6 w-28">Views</th>
                  <th className="py-4 px-6 w-32">Status</th>
                  <th className="py-4 px-6 w-36">Created Date</th>
                  <th className="py-4 px-6 text-right w-44">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {videos.map(video => (
                  <tr key={video.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="relative w-10 h-16 rounded-lg bg-slate-900 overflow-hidden border border-slate-200 cursor-pointer" onClick={() => setPreviewVideo(video)}>
                        {video.thumbnail ? (
                          <img src={video.thumbnail} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <video src={video.videoUrl} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors">
                          <Play size={10} className="text-white" fill="currentColor" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-xs text-slate-800">{video.title}</div>
                      {video.vendor?.name && (
                        <div className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mt-0.5">Brand: {video.vendor.name}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {video.product ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{video.product.name}</span>
                          <span className="text-[10px] font-extrabold text-emerald-600 mt-0.5">₹{video.price || video.product.price || 0}+</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5 text-xs text-slate-700 font-bold">
                        <span className="flex items-center gap-1">👁 {video.viewCount || 0}</span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">❤️ {video.likes || 0}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider inline-block w-fit ${video.publishStatus === 'PUBLISHED'
                          ? 'bg-emerald-600 text-white'
                          : video.publishStatus === 'SCHEDULED'
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-500 text-white'
                          }`}>
                          {video.publishStatus.toLowerCase()}
                        </span>
                        <button
                          onClick={() => toggleStatus(video)}
                          className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border w-fit text-left ${video.isActive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-slate-50 text-slate-400 border-slate-100'
                            }`}
                        >
                          {video.isActive ? 'Live' : 'Hidden'}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                      {video.createdAt ? new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(video)}
                          className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-all flex items-center justify-center border border-slate-100 hover:border-emerald-100"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => setPreviewVideo(video)}
                          className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition-all flex items-center justify-center border border-slate-100 hover:border-amber-100"
                          title="Preview"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => deleteVideo(video.id)}
                          className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition-all flex items-center justify-center border border-slate-100 hover:border-rose-100"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-250">
            {/* Top Close Bar */}
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setPreviewVideo(null)}
                className="h-10 w-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-[9/16] bg-black">
              <video
                key={previewVideo.videoUrl}
                controls
                preload="auto"
                autoPlay
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain"
                }}
              >
                <source src={previewVideo.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Video Info Panel */}
            <div className="p-6 bg-slate-950 text-white space-y-3">
              <h3 className="font-extrabold text-base tracking-tight">{previewVideo.title}</h3>
              {previewVideo.product && (
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span className="font-medium truncate max-w-[200px]">{previewVideo.product.name}</span>
                  <span className="font-extrabold text-emerald-400">₹{previewVideo.price || previewVideo.product.price || 0}+</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
