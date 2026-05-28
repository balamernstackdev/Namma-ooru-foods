'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Video as VideoIcon, Plus, Trash2, Edit2, Play, Pause, 
  Loader2, Link2, Search, Sparkles, Calendar, Tag, User, 
  Layers, Upload, X, Check, RefreshCw, AlertCircle
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
  product?: { name: string };
  vendor?: { name: string };
  category?: { name: string };
  relatedProducts?: { id: number; name: string }[];
}

interface DropdownItem {
  id: number;
  name: string;
}

export default function AdminVideoCommercePage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [products, setProducts] = useState<DropdownItem[]>([]);
  const [vendors, setVendors] = useState<DropdownItem[]>([]);
  const [categories, setCategories] = useState<DropdownItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

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
          ? productsData.map((p: any) => ({ id: p.id, name: p.name }))
          : (Array.isArray(productsData.products) ? productsData.products.map((p: any) => ({ id: p.id, name: p.name })) : []);
        setProducts(mappedProducts);

        // Handle vendors list mapping
        const mappedVendors = Array.isArray(vendorsData)
          ? vendorsData.map((v: any) => ({ id: v.id, name: v.name }))
          : [];
        setVendors(mappedVendors);

        // Handle categories list mapping
        const mappedCategories = Array.isArray(categoriesData)
          ? categoriesData.map((c: any) => ({ id: c.id, name: c.name }))
          : [];
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
    <div className="space-y-8 animate-in fade-in duration-75">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
            <VideoIcon className="h-9 w-9 text-emerald-600 animate-pulse" /> 
            Shop By Video <span className="text-emerald-600 font-serif font-normal lowercase tracking-normal">commerce</span>
          </h2>
          <p className="text-slate-400 font-semibold text-sm mt-2">
            AI-powered Shoppable Videos, Instagram Reels & Social Commerce engine.
          </p>
        </div>
        <button
          onClick={() => { showForm ? resetForm() : setShowForm(true); }}
          className={`h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2.5 transition-all shadow-lg active:scale-95 ${
            showForm 
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
              type="button"
              onClick={handleAIGenerate}
              disabled={generatingAI}
              className="h-10 px-5 bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-widest rounded-full shadow-md shadow-amber-500/25 flex items-center gap-2 hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50"
            >
              {generatingAI ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              AI Autofill
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* Left Column: Media Uploaders */}
              <div className="space-y-6">
                {/* Video Upload Field */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">1. Video Source *</label>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-3 border-dashed rounded-[2rem] p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden group ${
                      videoFile || videoUrl
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
                </div>

                {/* Primary Tagged Product */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Primary Product ID</label>
                    <select 
                      value={productId} 
                      onChange={e => setProductId(e.target.value)}
                      className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 text-xs font-bold outline-none focus:border-emerald-600"
                    >
                      <option value="">-- None Selected --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>ID {p.id}: {p.name}</option>
                      ))}
                    </select>
                  </div>

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
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Linked Brand / Vendor</label>
                    <select 
                      value={vendorId} 
                      onChange={e => setVendorId(e.target.value)}
                      className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 text-xs font-bold outline-none focus:border-emerald-600"
                    >
                      <option value="">-- Select Vendor --</option>
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Marketplace Category</label>
                    <select 
                      value={categoryId} 
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 text-xs font-bold outline-none focus:border-emerald-600"
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">
                    AI Tags (comma-separated)
                  </label>
                  <input 
                    value={tagsInput} 
                    onChange={e => setTagsInput(e.target.value)} 
                    placeholder="organic, cold-pressed, health, oil"
                    className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-emerald-600" 
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
                          className={`flex items-center justify-between p-2 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                            isSelected 
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

            {/* AI Rich Fields & SEO Overrides Accordion */}
            <div className="border border-slate-100 p-6 rounded-[2rem] bg-slate-50/20 space-y-4">
              <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-800 flex items-center gap-2">
                <Sparkles size={14} className="text-amber-500 animate-pulse" /> AI Rich Metadata & SEO Optimization (Optional)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Auto Generated Subtitles */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">AI Generated Video Subtitles / Captions</label>
                  <textarea
                    value={aiSubtitles}
                    onChange={e => setAiSubtitles(e.target.value)}
                    placeholder="Automatic captions generated for screen reader accessibility..."
                    rows={2}
                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs font-bold outline-none focus:border-emerald-600 resize-none"
                  />
                </div>

                {/* SEO Meta Title */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">AI SEO Meta Title</label>
                  <input
                    type="text"
                    value={aiSeoTitle}
                    onChange={e => setAiSeoTitle(e.target.value)}
                    placeholder="Shop Traditional Groundnut Oil Online | Namma Ooru Foods"
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-emerald-600"
                  />
                </div>

                {/* SEO Meta Keywords */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">AI SEO Meta Keywords</label>
                  <input
                    type="text"
                    value={aiSeoKeywords}
                    onChange={e => setAiSeoKeywords(e.target.value)}
                    placeholder="organic flours, traditional food, order local..."
                    className="w-full h-11 bg-white border border-slate-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-emerald-600"
                  />
                </div>

                {/* SEO Meta Description */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">AI SEO Meta Description</label>
                  <textarea
                    value={aiSeoDescription}
                    onChange={e => setAiSeoDescription(e.target.value)}
                    placeholder="Detailed page description for search engine ranking indexes..."
                    rows={2}
                    className="w-full bg-white border border-slate-200 rounded-xl p-4 text-xs font-bold outline-none focus:border-emerald-600 resize-none"
                  />
                </div>
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
                {editId ? 'Update Shoppable Video' : 'Publish & Sync Live Feed'}
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

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-32 text-center flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Video Commerce Engine...</span>
          </div>
        ) : videos.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-white border border-slate-100 rounded-[2.5rem] p-10 flex flex-col items-center">
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
        ) : videos.map(video => (
          <div 
            key={video.id} 
            className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group flex flex-col relative"
          >
            {/* Visual Media Container */}
            <div className="relative aspect-[9/16] bg-slate-900 overflow-hidden shrink-0">
              {video.thumbnail ? (
                <img 
                  src={video.thumbnail} 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" 
                  alt={video.title} 
                />
              ) : (
                <video 
                  src={video.videoUrl} 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" 
                />
              )}

              {/* Views & Likes Badges */}
              <div className="absolute top-4 left-4 flex gap-1.5 z-10">
                <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full text-[8px] font-black text-white uppercase tracking-wider">
                  👁 {video.viewCount || 0}
                </span>
                <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full text-[8px] font-black text-white uppercase tracking-wider">
                  ♥ {video.likes || 0}
                </span>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${
                  video.publishStatus === 'PUBLISHED' 
                    ? 'bg-emerald-600 text-white' 
                    : video.publishStatus === 'SCHEDULED' 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'bg-slate-500 text-white'
                }`}>
                  {video.publishStatus}
                </span>
              </div>

              {/* Title & Desc Layer */}
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end">
                {video.vendor?.name && (
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1 leading-none">
                    Brand: {video.vendor.name}
                  </span>
                )}
                <h4 className="text-white font-black text-lg tracking-tight leading-tight group-hover:text-amber-400 transition-colors">
                  {video.title}
                </h4>
                {video.price && <div className="text-white font-bold mt-2 text-sm">₹{video.price}+</div>}
              </div>

              {/* Overlay Hover Actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                <button 
                  onClick={() => handleEdit(video)} 
                  className="h-11 w-11 bg-white rounded-xl flex items-center justify-center text-slate-800 hover:bg-emerald-600 hover:text-white transition-all transform scale-90 group-hover:scale-100 shadow-lg active:scale-95"
                  title="Edit details"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => deleteVideo(video.id)} 
                  className="h-11 w-11 bg-white rounded-xl flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition-all transform scale-90 group-hover:scale-100 shadow-lg active:scale-95"
                  title="Delete Video"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Bottom Panel */}
            <div className="p-4 flex flex-col flex-1 bg-white gap-3 justify-between border-t border-slate-50">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => toggleStatus(video)} 
                  className={`flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${
                    video.isActive 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-slate-50 text-slate-400 border-slate-100'
                  }`}
                >
                  {video.isActive ? <Play size={8} fill="currentColor" /> : <Pause size={8} fill="currentColor" />}
                  {video.isActive ? 'Active Feed' : 'Hidden Feed'}
                </button>

                {video.categoryId && video.category?.name && (
                  <span className="flex items-center gap-1 text-[8px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                    <Layers size={8} /> {video.category.name}
                  </span>
                )}
              </div>

              {/* Linked Product Info */}
              {video.productId && video.product && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[10px] text-slate-400">
                  <span className="font-bold flex items-center gap-1 truncate max-w-[120px]">
                    <Link2 size={10} /> {video.product.name}
                  </span>
                  <span className="shrink-0 bg-slate-100 px-1.5 py-0.5 rounded text-[8px] font-black">
                    ID: {video.productId}
                  </span>
                </div>
              )}

              {/* Multiple Tagged Products Display */}
              {video.relatedProductIds && video.relatedProductIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1 border-t border-slate-50 pt-2">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide mr-1 mt-0.5">
                    Tagged:
                  </span>
                  {video.relatedProductIds.map(pid => {
                    const matchedP = products.find(p => p.id === pid);
                    return (
                      <span 
                        key={pid} 
                        className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-1.5 py-0.5 rounded-md border border-emerald-100"
                        title={matchedP?.name}
                      >
                        #{pid}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
