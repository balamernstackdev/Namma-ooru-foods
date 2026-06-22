'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Package,
  Search,
  ChevronDown,
  Award,
  Store,
  Star,
  MapPin,
  Mail,
  Phone,
  Globe,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OptimizedImage from '@/components/ui/OptimizedImage';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';

const formatBrandName = (name: string) => {
  if (!name) return '';
  return name
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .map(w => {
      let cleaned = w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      if (cleaned === 'Prod' || cleaned === 'Prods') return 'Products';
      return cleaned;
    })
    .join(' ');
};

// ==========================================
// 1. VendorInformationView (For Hub Users)
// ==========================================
function VendorInformationView({ vendor, averageRating, totalProducts }: { vendor: any, averageRating: number, totalProducts: number }) {
  // Safe extraction of address components
  const address = vendor.address || {};
  const hasAddress = address.street || address.city || address.district || address.state || address.country || address.pincode;

  // Render text for full address
  const fullAddress = [
    address.street,
    address.city,
    address.district,
    address.state,
    address.country,
    address.pincode
  ].filter(Boolean).join(', ');

  return (
    <div className="bg-[#fafaf9] min-h-screen pt-8 pb-20">
      <div className="standard-container">
        {/* Floating Back Button */}
        <div className="mb-6">
          <Link href="/sellers" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-950 hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft size={12} strokeWidth={3} /> All Vendors
          </Link>
        </div>

        {/* Compact Vendor Profile Card */}
        <div className="bg-white rounded-[24px] shadow-sm p-8 border border-slate-100 flex flex-col md:flex-row items-start gap-8 mb-8 max-w-full">
          {/* Logo */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative">
            {vendor.logo ? (
              <OptimizedImage
                src={vendor.logo}
                alt={vendor.name}
                fill
                className="object-contain p-2"
              />
            ) : (
              <div className="text-3xl font-black text-emerald-800">
                {vendor.name?.charAt(0)}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-[900] text-emerald-950 tracking-tighter uppercase leading-none mb-2">
                {vendor.name}
              </h1>
              {hasAddress && (
                <div className="flex items-center gap-1.5 text-slate-500 text-sm font-medium">
                  <MapPin size={14} className="text-slate-400" />
                  {fullAddress}
                </div>
              )}
            </div>

            {vendor.description && (
              <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-3xl">
                {vendor.description}
              </p>
            )}

          </div>
        </div>

        {/* Detailed Sections */}
        <div className="flex flex-col gap-8">
            {/* About Vendor */}
            {(vendor.companyOverview || vendor.mission || vendor.vision || vendor.yearsOfExperience || vendor.description) && (
              <section className="bg-white rounded-[24px] shadow-sm p-8 border border-slate-100">
                <h2 className="text-lg font-[900] text-emerald-950 uppercase tracking-wide mb-6 flex items-center gap-2">
                  <FileText size={18} className="text-emerald-600" /> About Vendor
                </h2>
                <div className="space-y-6">
                  {vendor.description && !vendor.companyOverview && (
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</h3>
                      <p className="text-slate-600 text-sm">{vendor.description}</p>
                    </div>
                  )}
                  {vendor.companyOverview && (
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Company Overview</h3>
                      <p className="text-slate-600 text-sm">{vendor.companyOverview}</p>
                    </div>
                  )}
                  {vendor.mission && (
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Mission</h3>
                      <p className="text-slate-600 text-sm">{vendor.mission}</p>
                    </div>
                  )}
                  {vendor.vision && (
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Vision</h3>
                      <p className="text-slate-600 text-sm">{vendor.vision}</p>
                    </div>
                  )}
                  {vendor.yearsOfExperience && (
                    <div>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Years of Experience</h3>
                      <p className="text-slate-600 text-sm">{vendor.yearsOfExperience} Years</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Gallery */}
            {vendor.gallery && vendor.gallery.length > 0 && (
              <section className="bg-white rounded-[24px] shadow-sm p-8 border border-slate-100">
                <h2 className="text-lg font-[900] text-emerald-950 uppercase tracking-wide mb-6">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {vendor.gallery.map((img: string, idx: number) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <OptimizedImage src={img} alt={`Gallery image ${idx + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {/* Certifications */}
            {vendor.certifications && vendor.certifications.length > 0 && (
              <section className="bg-white rounded-[24px] shadow-sm p-8 border border-slate-100">
                <h2 className="text-lg font-[900] text-emerald-950 uppercase tracking-wide mb-6">Certifications</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {vendor.certifications.map((cert: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <Award className="text-emerald-600 shrink-0" size={24} />
                      <div>
                        <p className="text-sm font-bold text-slate-800">{cert.name || cert.type}</p>
                        {cert.issuer && <p className="text-xs text-slate-500">{cert.issuer}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {/* Address */}
            {hasAddress && (
              <section className="bg-white rounded-[24px] shadow-sm p-8 border border-slate-100">
                <h2 className="text-lg font-[900] text-emerald-950 uppercase tracking-wide mb-6">Address</h2>
                <div className="text-sm font-medium text-slate-700 leading-relaxed mb-4">
                  {fullAddress}
                </div>
                {/* Optional Google Map Embed if coordinates exist */}
                {vendor.address?.coordinates?.lat && vendor.address?.coordinates?.lng && (
                  <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mt-4">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${vendor.address.coordinates.lat},${vendor.address.coordinates.lng}&zoom=15`}
                    ></iframe>
                  </div>
                )}
              </section>
            )}

            {/* Social Links */}
            {vendor.socialLinks && (vendor.socialLinks.facebook || vendor.socialLinks.instagram || vendor.socialLinks.youtube || vendor.socialLinks.website) && (
              <section className="bg-white rounded-[24px] shadow-sm p-8 border border-slate-100">
                <h2 className="text-lg font-[900] text-emerald-950 uppercase tracking-wide mb-6">Social Links</h2>
                <div className="flex flex-wrap gap-3">
                  {vendor.socialLinks.facebook && (
                    <a href={vendor.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-[#1877F2]/10 text-[#1877F2] text-xs font-bold hover:bg-[#1877F2]/20 transition-colors">
                      Facebook
                    </a>
                  )}
                  {vendor.socialLinks.instagram && (
                    <a href={vendor.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-[#E4405F]/10 text-[#E4405F] text-xs font-bold hover:bg-[#E4405F]/20 transition-colors">
                      Instagram
                    </a>
                  )}
                  {vendor.socialLinks.youtube && (
                    <a href={vendor.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-[#FF0000]/10 text-[#FF0000] text-xs font-bold hover:bg-[#FF0000]/20 transition-colors">
                      YouTube
                    </a>
                  )}
                  {vendor.socialLinks.website && (
                    <a href={vendor.socialLinks.website} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors">
                      Website
                    </a>
                  )}
                </div>
              </section>
            )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. VendorProductsView (For Normal Users)
// ==========================================
function VendorProductsView({ vendor, averageRating, allProducts, categories }: { vendor: any, averageRating: number, allProducts: any[], categories: any[] }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchQuery) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.subVendor?.name && p.subVendor.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategoryId) {
      result = result.filter((p: any) => p.category?.id === selectedCategoryId);
    }

    if (sortBy === 'price-low') result.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === 'price-high') result.sort((a, b) => Number(b.price) - Number(a.price));

    return result;
  }, [allProducts, selectedCategoryId, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    return filteredAndSortedProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, searchQuery, sortBy]);

  return (
    <div className="ent-page bg-[#fafaf9] min-h-screen">
      {/* Vendor Cover/Header */}
      <div className="relative w-full h-40 md:h-64 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 overflow-hidden">
        {vendor.banner ? (
          <OptimizedImage
            src={vendor.banner}
            alt={`${vendor.name} Cover`}
            fill
            className="object-cover opacity-85"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 via-transparent to-black/30" />
        
        {/* Floating Back Button */}
        <div className="absolute top-4 left-4 md:top-6 md:left-8 z-20">
          <Link href="/sellers" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors">
            <ArrowLeft size={12} strokeWidth={3} /> All Vendors
          </Link>
        </div>
      </div>

      {/* Vendor Info Section */}
      <div className="standard-container pb-8">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 -mt-12 md:-mt-16 relative z-10 px-4 md:px-0">
          {/* Logo container */}
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-white border-4 border-white shadow-xl overflow-hidden p-2 flex items-center justify-center shrink-0">
            {vendor.logo ? (
              <OptimizedImage
                src={vendor.logo}
                alt={vendor.name}
                fill
                className="object-contain p-2"
                priority
              />
            ) : (
              <div className="w-full h-full bg-emerald-50 text-emerald-800 text-3xl font-black flex items-center justify-center">
                {vendor.name?.charAt(0)}
              </div>
            )}
          </div>

          {/* Details container */}
          <div className="flex-1 text-center md:text-left space-y-2 md:pt-16">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-900 text-[9px] font-black uppercase tracking-[0.1em]">
                <Store size={12} /> Marketplace Vendor
              </span>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-900 text-[10px] font-bold">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                <span>{averageRating} Rating</span>
              </div>
              <span className="text-slate-400 font-bold text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                <Award size={12} className="text-amber-500" /> Verified Organic Partner
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-[900] text-emerald-950 tracking-tighter uppercase leading-none">
              {vendor.name}
            </h1>

            {vendor.description && (
              <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed max-w-3xl">
                {vendor.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="standard-container pb-20">
        {/* --- Marketplace Toolbar --- */}
        <div className="sticky top-20 md:top-24 z-40 bg-white/90 backdrop-blur-2xl border border-slate-100 shadow-sm rounded-3xl mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-4 md:p-6">

            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar flex-1">
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategoryId === null
                    ? 'bg-emerald-950 border-emerald-950 text-white shadow-xl shadow-emerald-950/10'
                    : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'
                  }`}
              >
                Full Catalog
              </button>
              {categories.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategoryId === cat.id
                      ? 'bg-emerald-950 border-emerald-950 text-white shadow-xl shadow-emerald-950/10'
                      : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search in ${vendor.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-emerald-950 outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-11 pl-5 pr-12 rounded-2xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest appearance-none outline-none cursor-pointer shadow-sm"
                >
                  <option value="popular">Popular</option>
                  <option value="price-low">Price ↑</option>
                  <option value="price-high">Price ↓</option>
                </select>
                <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* --- Product Grid --- */}
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="text-2xl md:text-4xl font-[900] text-emerald-950 tracking-tighter uppercase leading-none">
              {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : 'Product Selection'}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Available: {filteredAndSortedProducts.length} items
            </p>
          </div>

          <AnimatePresence mode="wait">
            {paginatedProducts.length > 0 ? (
              <motion.div
                key={`${selectedCategoryId}-${sortBy}-${searchQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[12px] md:gap-[28px]"
              >
                {paginatedProducts.map((product: any, idx: number) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx % 12 * 0.04 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="py-32 flex flex-col items-center justify-center gap-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                  <Package size={32} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xl font-black text-emerald-950 uppercase tracking-tighter">No items found</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Adjust filters or search query</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* --- Pagination Controls --- */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 border-t border-slate-100 pt-8">
            <button
              disabled={currentPage === 1}
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); }}
              className="h-10 px-4 rounded-xl bg-white border border-slate-200 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentPage(i + 1); }}
                className={`h-10 w-10 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${currentPage === i + 1 ? 'bg-emerald-950 text-white shadow-lg shadow-emerald-950/10' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); }}
              className="h-10 px-4 rounded-xl bg-white border border-slate-200 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Main Client Component
// ==========================================
export default function VendorDetailClient({ vendor }: { vendor: any }) {
  const { user } = useAuth();
  
  const subBrands = vendor.subVendors || [];

  // Aggregate all products from all sub-brands
  const allProducts = useMemo(() => {
    return subBrands.flatMap((sb: any) =>
      (sb.products || []).map((p: any) => ({
        ...p,
        subVendor: sb
      }))
    );
  }, [subBrands]);

  // Extract unique categories
  const categories = useMemo(() => {
    const catMap = new Map();
    allProducts.forEach((p: any) => {
      if (p.category && !catMap.has(p.category.id)) {
        catMap.set(p.category.id, p.category);
      }
    });
    return Array.from(catMap.values());
  }, [allProducts]);

  // Calculate average rating based on all products under this vendor
  const averageRating = useMemo(() => {
    const ratedProducts = allProducts.filter((p: any) => p.averageRating > 0);
    if (ratedProducts.length === 0) return 4.8;
    const sum = ratedProducts.reduce((acc: number, p: any) => acc + p.averageRating, 0);
    return Number((sum / ratedProducts.length).toFixed(1));
  }, [allProducts]);

  const isHubUser = 
    (user?.role as string) === 'HUB_MANAGER' || 
    (user?.role as string) === 'HUB_USER' || 
    user?.role?.toLowerCase() === 'hub' || 
    user?.role?.toLowerCase() === 'vendor' || 
    user?.role?.toLowerCase() === 'admin';

  if (isHubUser) {
    return (
      <VendorInformationView 
        vendor={vendor} 
        averageRating={averageRating} 
        totalProducts={allProducts.length} 
      />
    );
  }

  return (
    <VendorProductsView 
      vendor={vendor} 
      averageRating={averageRating} 
      allProducts={allProducts}
      categories={categories}
    />
  );
}
