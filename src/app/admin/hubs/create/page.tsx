'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { API_URL } from '@/lib/api';
import { 
  Save, Building2, User, Phone, MapPin, Settings, CheckCircle2, Check,
  Image as ImageIcon, Loader2, X, ChevronLeft, Eye, EyeOff
} from 'lucide-react';

const MODULES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'subVendors', label: 'Sub Vendors' },
  { id: 'products', label: 'Products' },
  { id: 'categories', label: 'Categories' },
  { id: 'orders', label: 'Orders' },
  { id: 'customers', label: 'Customers' },
  { id: 'payments', label: 'Payments' },
  { id: 'payouts', label: 'Payouts' },
  { id: 'coupons', label: 'Coupons' },
  { id: 'reports', label: 'Reports' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'analytics', label: 'Analytics' },
];

const ACTIONS = [
  { id: 'view', label: 'View' },
  { id: 'create', label: 'Create' },
  { id: 'edit', label: 'Edit' },
  { id: 'delete', label: 'Delete' },
  { id: 'approve', label: 'Approve' },
  { id: 'export', label: 'Export' },
];

const DEFAULT_MATRIX_PERMISSIONS: Record<string, Record<string, boolean>> = {
  dashboard: { view: true, create: true, edit: false, delete: false, approve: false, export: false },
  subVendors: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
  products: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
  categories: { view: true, create: true, edit: true, delete: true, approve: false, export: false },
  orders: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
  customers: { view: true, create: false, edit: true, delete: false, approve: false, export: true },
  payments: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
  payouts: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
  coupons: { view: true, create: true, edit: true, delete: true, approve: false, export: false },
  reports: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
  reviews: { view: true, create: true, edit: true, delete: true, approve: true, export: false },
  notifications: { view: true, create: true, edit: true, delete: true, approve: false, export: false },
  analytics: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
};

const PRESETS: Record<string, Record<string, Record<string, boolean>>> = {
  fullAccess: Object.fromEntries(
    MODULES.map(mod => [
      mod.id,
      Object.fromEntries(ACTIONS.map(act => [act.id, true]))
    ])
  ),
  manager: {
    dashboard: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
    subVendors: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
    products: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
    categories: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
    orders: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
    customers: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
    payments: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
    payouts: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
    coupons: { view: true, create: true, edit: true, delete: true, approve: false, export: true },
    reports: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
    reviews: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
    notifications: { view: true, create: true, edit: true, delete: true, approve: false, export: true },
    analytics: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
  },
  vendorOperator: {
    dashboard: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    subVendors: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
    products: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
    categories: { view: true, create: true, edit: true, delete: false, approve: false, export: false },
    orders: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    customers: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    payments: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    payouts: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    coupons: { view: true, create: true, edit: true, delete: false, approve: false, export: false },
    reports: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    reviews: { view: true, create: true, edit: true, delete: false, approve: true, export: false },
    notifications: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    analytics: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
  },
  orderExecutive: {
    dashboard: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    subVendors: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    products: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    categories: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    orders: { view: true, create: true, edit: true, delete: false, approve: true, export: true },
    customers: { view: true, create: false, edit: true, delete: false, approve: false, export: false },
    payments: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    payouts: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    coupons: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    reports: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    reviews: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    notifications: { view: true, create: true, edit: false, delete: false, approve: false, export: false },
    analytics: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
  },
  inventoryManager: {
    dashboard: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    subVendors: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    products: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
    categories: { view: true, create: true, edit: true, delete: true, approve: false, export: false },
    orders: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    customers: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    payments: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    payouts: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    coupons: { view: true, create: true, edit: true, delete: true, approve: false, export: false },
    reports: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    reviews: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    notifications: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    analytics: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
  },
  financeManager: {
    dashboard: { view: true, create: false, edit: false, delete: false, approve: false, export: false },
    subVendors: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    products: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    categories: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    orders: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
    customers: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    payments: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
    payouts: { view: true, create: true, edit: true, delete: true, approve: true, export: true },
    coupons: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    reports: { view: true, create: true, edit: true, delete: false, approve: false, export: true },
    reviews: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    notifications: { view: false, create: false, edit: false, delete: false, approve: false, export: false },
    analytics: { view: true, create: false, edit: false, delete: false, approve: false, export: true },
  },
};

const PRESET_LIST = [
  { id: 'fullAccess', label: 'Full Access' },
  { id: 'manager', label: 'Manager' },
  { id: 'vendorOperator', label: 'Vendor Operator' },
  { id: 'orderExecutive', label: 'Order Executive' },
  { id: 'inventoryManager', label: 'Inventory Manager' },
  { id: 'financeManager', label: 'Finance Manager' },
];

const getMatchingPreset = (matrix: Record<string, Record<string, boolean>>): string | null => {
  for (const [presetId, presetData] of Object.entries(PRESETS)) {
    let match = true;
    for (const mod of MODULES) {
      for (const act of ACTIONS) {
        if (!!matrix[mod.id]?.[act.id] !== !!presetData[mod.id]?.[act.id]) {
          match = false;
          break;
        }
      }
      if (!match) break;
    }
    if (match) return presetId;
  }
  return null;
};

export default function CreateHubPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // -------------------------------------------------------------
  // Form State
  // -------------------------------------------------------------
  const [formData, setFormData] = useState({
    // Section 1: Login Credentials
    hubUsername: '',
    password: '',
    confirmPassword: '',
    email: '',
    mobileNumber: '',
    hubId: '', // Auto-generated if empty

    // Section 2: Hub Information
    name: '',
    displayName: '',
    shortDescription: '',
    logo: '',
    banner: '',

    // Section 3: Address
    state: '',
    district: '',
    city: '',
    pincode: '',
    address: '',

    // Section 6: Status
    status: 'Active',
  });

  const [matrixPermissions, setMatrixPermissions] = useState<Record<string, Record<string, boolean>>>(
    JSON.parse(JSON.stringify(DEFAULT_MATRIX_PERMISSIONS))
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));

      if (name === 'pincode' && value.length === 6 && /^\d+$/.test(value)) {
        fetch(`https://api.postalpincode.in/pincode/${value}`)
          .then(res => res.json())
          .then(data => {
            if (data && data[0] && data[0].Status === 'Success') {
              const postOffice = data[0].PostOffice[0];
              setFormData(prev => ({
                ...prev,
                state: postOffice.State || prev.state,
                district: postOffice.District || prev.district,
                city: postOffice.Block || postOffice.Name || prev.city
              }));
              addToast('Success', 'Location details fetched from Pincode');
            }
          })
          .catch(err => console.error('Failed to fetch pincode details', err));
      }
    }
  };

  const generateHubId = () => {
    // A quick local generation, but backend handles it too
    const num = Math.floor(100 + Math.random() * 900);
    setFormData(prev => ({ ...prev, hubId: `HUB-${num}` }));
  };

  const toggleCell = (moduleId: string, actionId: string) => {
    setMatrixPermissions(prev => {
      const updated = { ...prev };
      updated[moduleId] = {
        ...updated[moduleId],
        [actionId]: !updated[moduleId]?.[actionId]
      };
      return updated;
    });
  };

  const applyPreset = (presetId: string) => {
    const presetData = PRESETS[presetId];
    if (presetData) {
      setMatrixPermissions(JSON.parse(JSON.stringify(presetData)));
    }
  };

  const selectAll = () => {
    const updated = Object.fromEntries(
      MODULES.map(mod => [
        mod.id,
        Object.fromEntries(ACTIONS.map(act => [act.id, true]))
      ])
    );
    setMatrixPermissions(updated);
  };

  const clearAll = () => {
    const updated = Object.fromEntries(
      MODULES.map(mod => [
        mod.id,
        Object.fromEntries(ACTIONS.map(act => [act.id, false]))
      ])
    );
    setMatrixPermissions(updated);
  };

  const readOnly = () => {
    const updated = Object.fromEntries(
      MODULES.map(mod => [
        mod.id,
        Object.fromEntries(ACTIONS.map(act => [act.id, act.id === 'view']))
      ])
    );
    setMatrixPermissions(updated);
  };

  const fullAccess = () => {
    selectAll();
  };

  // Compute summary values dynamically
  const activePreset = getMatchingPreset(matrixPermissions);
  
  const accessibleModulesCount = MODULES.filter(mod => 
    Object.values(matrixPermissions[mod.id] || {}).some(val => val)
  ).length;

  const hasCreatePermission = MODULES.some(mod => matrixPermissions[mod.id]?.create);
  const hasEditPermission = MODULES.some(mod => matrixPermissions[mod.id]?.edit);
  const hasDeletePermission = MODULES.some(mod => matrixPermissions[mod.id]?.delete);
  const hasApprovePermission = MODULES.some(mod => matrixPermissions[mod.id]?.approve);
  const hasExportPermission = MODULES.some(mod => matrixPermissions[mod.id]?.export);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(fieldName);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        body: uploadData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, [fieldName]: data.url }));
        addToast('Success', `${fieldName} uploaded successfully`);
      } else {
        addToast('Error', 'Image upload failed');
      }
    } catch (err) {
      addToast('Error', 'Server connecting issue during upload');
    } finally {
      setIsUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      addToast('Error', 'Passwords do not match!');
      return;
    }
    if (!formData.hubUsername || !formData.password || !formData.email || !formData.mobileNumber || !formData.name) {
      addToast('Error', 'Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        displayName: formData.displayName,
        shortDescription: formData.shortDescription,
        logo: formData.logo,
        banner: formData.banner,
        hubCode: formData.hubId,
        
        managerUsername: formData.hubUsername,
        managerPassword: formData.password,
        managerEmail: formData.email,
        managerPhone: formData.mobileNumber,
        managerStatus: formData.status,

        addressStreet: formData.address,
        addressCity: formData.city,
        addressDistrict: formData.district,
        addressState: formData.state,
        addressPincode: formData.pincode,

        settingsJson: {
          permissions: matrixPermissions
        }
      };

      const res = await fetch(`${API_URL}/api/admin-ops/hubs/wizard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Success', 'Hub created successfully!');
        router.push('/admin/hubs');
      } else {
        addToast('Error', data.error || 'Failed to create Hub');
      }
    } catch (err) {
      addToast('Error', 'Failed to create Hub');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Create Vendor Hub</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Single Page Registration</p>
        </div>
        <button type="button" onClick={() => router.push('/admin/hubs')} className="px-4 py-2 text-slate-500 font-bold text-xs uppercase hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2">
          <ChevronLeft size={16} /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1 - LOGIN CREDENTIALS */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
            <User className="text-emerald-500" /> 1. Login Credentials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Hub Username *</label>
              <input type="text" name="hubUsername" value={formData.hubUsername} onChange={handleInputChange} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 outline-none focus:border-emerald-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 outline-none focus:border-emerald-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Password *</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} className="w-full bg-slate-50 rounded-xl px-4 py-3 pr-12 text-sm font-bold border border-slate-200 outline-none focus:border-emerald-500 transition-colors" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Confirm Password *</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="w-full bg-slate-50 rounded-xl px-4 py-3 pr-12 text-sm font-bold border border-slate-200 outline-none focus:border-emerald-500 transition-colors" required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Mobile Number *</label>
              <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 outline-none focus:border-emerald-500 transition-colors" required />
            </div>
            {/* Hub ID is auto-generated */}
          </div>
        </div>

        {/* SECTION 2 - HUB INFORMATION */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
            <Building2 className="text-emerald-500" /> 2. Hub Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Hub Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 outline-none focus:border-emerald-500 transition-colors" required />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Display Name</label>
              <input type="text" name="displayName" value={formData.displayName} onChange={handleInputChange} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 outline-none focus:border-emerald-500 transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Short Description</label>
              <input type="text" name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 outline-none focus:border-emerald-500 transition-colors" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-2">Logo Upload</label>
              <div className="relative w-28 h-28 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden hover:border-emerald-300 transition-colors shadow-sm">
                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={e => handleFileUpload(e, 'logo')} />
                {isUploading === 'logo' ? <Loader2 className="animate-spin text-emerald-500" /> : 
                  formData.logo ? (
                    <div className="relative w-full h-full p-2 flex items-center justify-center">
                      <img src={formData.logo} className="max-w-full max-h-full object-contain rounded-lg" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, logo: '' })); }} className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 shadow hover:bg-rose-600 transition-all z-20">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <ImageIcon size={20} className="mb-1" />
                      <span className="text-[9px] font-black uppercase tracking-wider">Logo</span>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 - ADDRESS */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-4 mb-6 flex items-center gap-2">
            <MapPin className="text-emerald-500" /> 3. Address
          </h2>
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Address</label>
            <textarea name="address" value={formData.address} onChange={handleInputChange} rows={3} className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm font-bold border border-slate-200 outline-none focus:border-emerald-500 transition-colors" />
          </div>
        </div>

        {/* SECTION 4 - ACCESS PERMISSIONS */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Settings className="text-emerald-500" /> Access Permissions
            </h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">
              Manage what this Hub Manager can access.
            </p>
          </div>

          {/* Quick Presets and Utility Actions */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between bg-slate-50/50 p-6 rounded-[1.5rem] border border-slate-100">
            <div className="space-y-2">
              <span className="block text-[10px] font-black uppercase text-slate-500">Quick Presets</span>
              <div className="flex flex-wrap gap-2">
                {PRESET_LIST.map(preset => {
                  const isActive = activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        isActive
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 lg:text-right">
              <span className="block text-[10px] font-black uppercase text-slate-500">Utility Actions</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={readOnly}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  Read Only
                </button>
                <button
                  type="button"
                  onClick={fullAccess}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  Full Access
                </button>
              </div>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="border border-slate-200 rounded-[1.5rem] overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200">
                    <th className="sticky left-0 bg-slate-50 z-10 p-4 text-[10px] font-black uppercase tracking-wider text-slate-500 w-1/4 min-w-[150px] border-r border-slate-100">
                      Module
                    </th>
                    {ACTIONS.map(act => (
                      <th key={act.id} className="p-4 text-[10px] font-black uppercase tracking-wider text-slate-500 text-center min-w-[90px]">
                        {act.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MODULES.map(mod => (
                    <tr key={mod.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="sticky left-0 bg-white group-hover:bg-slate-50/50 transition-colors z-10 p-4 text-xs font-bold text-slate-800 uppercase tracking-wide border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.02)]">
                        {mod.label}
                      </td>
                      {ACTIONS.map(act => {
                        const checked = matrixPermissions[mod.id]?.[act.id] || false;
                        return (
                          <td key={act.id} className="p-4 align-middle text-center">
                            <div className="flex justify-center">
                              <button
                                type="button"
                                role="checkbox"
                                aria-checked={checked}
                                onClick={() => toggleCell(mod.id, act.id)}
                                className={`w-6 h-6 rounded-lg border flex items-center justify-center cursor-pointer transition-all ${
                                  checked
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                                    : 'bg-slate-50 border-slate-200 text-slate-300 hover:border-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                {checked && <Check size={14} className="stroke-[3]" />}
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Permissions Summary Card */}
          <div className="bg-slate-50/50 border border-slate-100 p-6 rounded-[1.5rem] grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-2 space-y-1">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Permissions Summary</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{accessibleModulesCount}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Modules Accessible</span>
              </div>
            </div>
            <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Create', value: hasCreatePermission },
                { label: 'Edit', value: hasEditPermission },
                { label: 'Delete', value: hasDeletePermission },
                { label: 'Approve', value: hasApprovePermission },
                { label: 'Export', value: hasExportPermission },
              ].map(sum => (
                <div key={sum.label} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{sum.label}</span>
                  <span className={`text-sm font-black mt-1 ${sum.value ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {sum.value ? 'Yes' : 'No'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 6 - STATUS & ACTIONS */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="w-full md:w-auto">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide mb-2">6. Status</h2>
            <div className="flex gap-4">
              {['Active', 'Inactive', 'Suspended'].map(stat => (
                <label key={stat} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="status" value={stat} checked={formData.status === stat} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))} className="text-emerald-600 focus:ring-emerald-500" />
                  <span className="text-sm font-bold text-slate-700">{stat}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button type="button" onClick={() => router.push('/admin/hubs')} className="px-6 py-4 w-full md:w-auto text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 rounded-xl transition-all">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-8 py-4 w-full md:w-auto bg-emerald-600 text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 rounded-xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-wait">
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
              {isSubmitting ? 'Creating Hub...' : 'Create Vendor Hub'}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
