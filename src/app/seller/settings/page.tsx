'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';
import { Save, Lock, Image as ImageIcon, Camera, Loader2, Plus } from 'lucide-react';
import VendorPayoutMethods from '@/components/vendor/VendorPayoutMethods';

const fetcher = (url: string) => {
  const token = localStorage.getItem('token');
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());
};

export default function VendorSettings() {
  const { user } = useAuth();
  
  // Brand Fetching
  const { data: brand, mutate: mutateBrand } = useSWR(user?.brandId ? `${API_URL}/api/brands/${user.brandId}` : null, fetcher);

  const [brandName, setBrandName] = useState('');
  const [logo, setLogo] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        body: uploadData,
      });

      if (res.ok) {
        const data = await res.json();
        setLogo(data.url);
        setStatus({ type: 'success', msg: 'Image uploaded to draft. Click Save to apply.' });
      } else {
        setStatus({ type: 'error', msg: 'Image upload failed' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Network error during upload' });
    } finally {
      setIsUploading(false);
    }
  };
  
  const [status, setStatus] = useState<{type: 'success' | 'error' | null, msg: string}>({ type: null, msg: '' });

  useEffect(() => {
    if (brand) {
      setBrandName(brand.name || '');
      setLogo(brand.logo || '');
    }
  }, [brand]);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.brandId) return;
    setStatus({ type: null, msg: '' });
    
    try {
      const res = await fetch(`${API_URL}/api/brands/${user.brandId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: brandName, logo })
      });
      
      if (!res.ok) throw new Error('Failed to update brand profile');
      await mutateBrand();
      setStatus({ type: 'success', msg: 'Profile updated successfully!' });
      setTimeout(() => setStatus({ type: null, msg: '' }), 5000);
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message || 'Error updating profile' });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: null, msg: '' });
    
    try {
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      
      setCurrentPassword('');
      setNewPassword('');
      setStatus({ type: 'success', msg: 'Password reset successfully!' });
      setTimeout(() => setStatus({ type: null, msg: '' }), 5000);
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message || 'Error resetting password' });
    }
  };

  return (
    <div className="w-full space-y-10">
       
      {status.type && (
         <div className={`p-4 rounded-[14px] border text-sm font-bold uppercase tracking-widest ${
            status.type === 'success' 
            ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]' 
            : 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
         }`}>
            {status.msg}
         </div>
      )}

      {/* Profile Settings */}
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-8 md:p-12 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl md:text-2xl font-black text-[#0F7A4D] uppercase tracking-tighter mb-8 flex items-center gap-3">
           <ImageIcon className="text-[#F59E0B]" />
           Store Identity
        </h2>
        
        <form onSubmit={handleUpdateProfile} className="space-y-8">
           
          {/* Avatar Edit - Round Direct Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-black uppercase tracking-widest text-[#6B7280] block mb-2">Store Profile Picture</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="h-32 w-32 rounded-full border-4 border-[#F8FAF7] bg-[#F8FAF7] flex items-center justify-center overflow-hidden shadow-inner hover:scale-[1.02] transition-transform duration-500 cursor-pointer relative group shrink-0"
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-[#F59E0B] animate-spin" />
              ) : logo ? (
                <>
                  <img src={logo} className="w-full h-full object-cover" alt="Store Logo Preview" />
                  <div className="absolute inset-0 bg-[#0F7A4D]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest bg-[#0F7A4D]/80 px-2 py-1 rounded-md">Change</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-[#D1D5DB] group-hover:text-[#F59E0B] transition-colors">
                  <Camera size={24} />
                  <span className="text-[8px] font-black uppercase tracking-widest mt-1 text-center leading-tight">Upload<br/>Logo</span>
                </div>
              )}
            </div>
            <p className="text-[10px] uppercase font-bold text-[#6B7280] tracking-wider mt-2">Recommended: 500 x 500px square image.</p>
          </div>

          <div className="space-y-3">
             <label className="text-[12px] font-black uppercase tracking-widest text-[#6B7280] block mb-2">Store Name</label>
             <input 
               type="text" 
               value={brandName}
               onChange={(e) => setBrandName(e.target.value)}
               required
               className="w-full h-14 pl-5 pr-5 rounded-[14px] bg-[#F8FAF7] border border-[#E5E7EB] focus:outline-none focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/10 transition-all font-medium text-[#111827]"
               placeholder="Your Store Name"
             />
          </div>

          <button 
             type="submit"
             disabled={!user.brandId}
             className="h-14 px-8 rounded-[14px] bg-[#0F7A4D] text-white font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 hover:bg-[#0a5c3a] transition-all disabled:opacity-50 disabled:cursor-not-allowed group w-full md:w-auto"
          >
             <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
             Save Identity Updates
          </button>
        </form>
      </div>

      {/* Password Reset Component */}
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-8 md:p-12 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="mb-8">
           <h2 className="text-xl md:text-2xl font-black text-[#0F7A4D] uppercase tracking-tighter flex items-center gap-3">
              <Lock className="text-[#F59E0B]" />
              Security Settings
           </h2>
           <p className="mt-2 text-[12px] uppercase tracking-widest font-bold text-[#6B7280]">Regularly update your password to maintain store security.</p>
        </div>
        
        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div className="space-y-3">
             <label className="text-[12px] font-black uppercase tracking-widest text-[#6B7280] block">Current Password</label>
             <input 
               type="password" 
               value={currentPassword}
               onChange={(e) => setCurrentPassword(e.target.value)}
               required
               className="w-full h-14 pl-5 pr-5 rounded-[14px] bg-[#F8FAF7] border border-[#E5E7EB] focus:outline-none focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/10 transition-all font-medium text-[#111827]"
               placeholder="••••••••"
             />
          </div>
          
          <div className="space-y-3">
             <label className="text-[12px] font-black uppercase tracking-widest text-[#6B7280] block">New Password</label>
             <input 
               type="password" 
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
               required
               className="w-full h-14 pl-5 pr-5 rounded-[14px] bg-[#F8FAF7] border border-[#E5E7EB] focus:outline-none focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/10 transition-all font-medium text-[#111827]"
               placeholder="••••••••"
             />
          </div>

          <button 
             type="submit"
             className="h-14 px-8 rounded-[14px] bg-[#0F7A4D] text-white font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-3 hover:bg-[#0a5c3a] transition-all w-full md:w-auto"
          >
             Update Password
          </button>
        </form>
      </div>

      <VendorPayoutMethods />

    </div>
  );
}
