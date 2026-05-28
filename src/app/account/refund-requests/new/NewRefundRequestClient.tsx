'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, AlertTriangle, ShieldCheck, CreditCard, CheckCircle2, X,
  ArrowLeft, FileText, UploadCloud, RefreshCcw, ArrowRight, Loader2, Clock
} from 'lucide-react';

export default function NewRefundRequestClient({ orderId }: { orderId: string }) {
  const { user } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [issueType, setIssueType] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<{ orderItemId: number; quantity: number; maxQuantity: number; price: number; name: string; image: string }[]>([]);
  const [description, setDescription] = useState('');
  const [comments, setComments] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [evidencePreview, setEvidencePreview] = useState<string[]>([]);
  const [preference, setPreference] = useState<string>('ORIGINAL_METHOD');
  const [ticketId, setTicketId] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_URL}/api/orders/user/${user.id}`);
        const data = await res.json();
        const found = (Array.isArray(data) ? data : []).find((o: any) => o.id.toString() === orderId);
        if (found) setOrder(found);
        else router.push('/account/orders');
      } catch (err) {
        console.error('Error fetching order', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [user, orderId, router]);

  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handlePrev = () => setCurrentStep(prev => prev - 1);

  const toggleItemSelection = (item: any) => {
    const existing = selectedItems.find(i => i.orderItemId === item.id);
    if (existing) {
      setSelectedItems(selectedItems.filter(i => i.orderItemId !== item.id));
    } else {
      setSelectedItems([...selectedItems, {
        orderItemId: item.id,
        quantity: item.quantity,
        maxQuantity: item.quantity,
        price: Number(item.price || item.unitPrice || 0),
        name: item.product?.name || item.name,
        image: item.product?.images?.[0] || ''
      }]);
    }
  };

  const updateItemQuantity = (id: number, qty: number) => {
    setSelectedItems(selectedItems.map(i => i.orderItemId === id ? { ...i, quantity: qty } : i));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setEvidenceFiles(prev => [...prev, ...filesArray]);
      const previewUrls = filesArray.map(file => URL.createObjectURL(file));
      setEvidencePreview(prev => [...prev, ...previewUrls]);
    }
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
    setEvidencePreview(prev => prev.filter((_, i) => i !== index));
  };

  const submitRefundRequest = async () => {
    if (selectedItems.length === 0) { alert('Please select at least one item.'); return; }
    setSubmitting(true);
    try {
      const payload = {
        orderId,
        userId: user?.id,
        issueType,
        preference,
        description,
        comments,
        evidenceUrls: ['https://mock-image.url/proof.jpg'],
        items: selectedItems.map(item => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
          requestedAmount: item.price * item.quantity
        }))
      };
      const res = await fetch(`${API_URL}/api/refund-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setTicketId(data.refundRequest?.ticketId || 'REF-SUCCESS');
        setCurrentStep(6);
      } else {
        alert(data.error || 'Failed to submit request');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const issueTypes = [
    { id: 'DAMAGED_PRODUCT', label: 'Damaged Product', icon: AlertTriangle, desc: 'Item arrived physically damaged' },
    { id: 'WRONG_PRODUCT', label: 'Wrong Product Delivered', icon: Package, desc: 'Received a different item than ordered' },
    { id: 'MISSING_ITEMS', label: 'Missing Items', icon: RefreshCcw, desc: 'Package arrived with items missing' },
    { id: 'QUALITY_ISSUE', label: 'Product Quality Issue', icon: ShieldCheck, desc: 'Item does not meet quality standards' },
    { id: 'EXPIRED_PRODUCT', label: 'Expired Product', icon: Clock, desc: 'Received an item past its expiry date' },
    { id: 'OTHER', label: 'Other Issue', icon: FileText, desc: 'None of the above' }
  ];

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-emerald-600 h-10 w-10" /></div>;
  if (!order) return null;

  const orderItems = order.orderItems || order.items || [];

  return (
    <div className="max-w-4xl mx-auto py-2">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-700 mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Order
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-emerald-950 tracking-tighter">Raise Request</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Order #{order.id} • Support Desk</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-8 shrink-0">
          <div className="flex flex-row md:flex-col gap-6">
            {[
              { num: 1, label: 'Issue Type' },
              { num: 2, label: 'Select Products' },
              { num: 3, label: 'Description' },
              { num: 4, label: 'Evidence' },
              { num: 5, label: 'Preference' }
            ].map(step => (
              <div key={step.num} className={`flex items-center gap-4 ${currentStep === 6 ? 'opacity-50' : ''}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${currentStep === step.num ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' : currentStep > step.num ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                  {currentStep > step.num ? <CheckCircle2 className="h-4 w-4" /> : step.num}
                </div>
                <span className={`text-[10px] uppercase tracking-widest font-black hidden md:block ${currentStep === step.num ? 'text-emerald-900' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-8 flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1">
                <h3 className="text-xl font-black text-emerald-950 mb-2">What went wrong?</h3>
                <p className="text-xs text-slate-500 mb-8">Select the issue that best describes your problem.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {issueTypes.map(type => {
                    const isSelected = issueType === type.id;
                    const Icon = type.icon;
                    return (
                      <div key={type.id} onClick={() => setIssueType(type.id)} className={`cursor-pointer border-2 rounded-2xl p-4 transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50'}`}>
                        <Icon className={`h-6 w-6 mb-3 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">{type.label}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">{type.desc}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-8 flex justify-end">
                  <button onClick={handleNext} disabled={!issueType} className="px-6 py-3 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-black/10 flex items-center justify-center disabled:opacity-50">
                    Next Step <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1">
                <h3 className="text-xl font-black text-emerald-950 mb-2">Which items have this issue?</h3>
                <p className="text-xs text-slate-500 mb-8">Select the products and the affected quantity.</p>
                <div className="space-y-4">
                  {orderItems.map((item: any) => {
                    const isSelected = selectedItems.some(i => i.orderItemId === item.id);
                    const selectedData = selectedItems.find(i => i.orderItemId === item.id);
                    return (
                      <div key={item.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-100'}`}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleItemSelection(item)} className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer" />
                        <div className="h-12 w-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                          {item.product?.images?.[0] ? <img src={item.product.images[0]} className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-slate-300" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black text-slate-800">{item.product?.name || item.name}</p>
                          <p className="text-[10px] text-slate-500">Ordered: {item.quantity} • ₹{Number(item.price || item.unitPrice || 0)} each</p>
                        </div>
                        {isSelected && (
                          <div className="flex flex-col items-end">
                            <label className="text-[9px] uppercase tracking-widest font-black text-slate-400 mb-1">Affected Qty</label>
                            <select value={selectedData?.quantity} onChange={(e) => updateItemQuantity(item.id, Number(e.target.value))} className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none">
                              {Array.from({ length: item.quantity }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num}>{num}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-8 flex justify-between">
                  <button onClick={handlePrev} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-black uppercase tracking-widest rounded-xl transition-all">Back</button>
                  <button onClick={handleNext} disabled={selectedItems.length === 0} className="px-6 py-3 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-black/10 flex items-center justify-center disabled:opacity-50">
                    Next Step <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1">
                <h3 className="text-xl font-black text-emerald-950 mb-2">Tell us more details</h3>
                <p className="text-xs text-slate-500 mb-8">Please describe the issue in detail to help us resolve it faster.</p>
                <div>
                  <label className="block text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="E.g., The seal was broken when I opened the package..." className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm h-32 resize-none" maxLength={500} />
                  <div className="flex justify-end mt-1 text-[10px] font-bold text-slate-400">{description.length} / 500</div>
                </div>
                <div className="mt-8 flex justify-between">
                  <button onClick={handlePrev} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-black uppercase tracking-widest rounded-xl transition-all">Back</button>
                  <button onClick={handleNext} disabled={description.trim().length < 10} className="px-6 py-3 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-black/10 flex items-center justify-center disabled:opacity-50">
                    Next Step <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1">
                <h3 className="text-xl font-black text-emerald-950 mb-2">Upload Evidence</h3>
                <p className="text-xs text-slate-500 mb-8">Upload clear photos or short videos of the damaged items or package.</p>
                <label className="border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/30 rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all">
                  <div className="h-14 w-14 bg-white shadow-sm rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className="h-6 w-6 text-emerald-600" />
                  </div>
                  <span className="text-sm font-black text-emerald-950">Click to upload photos/videos</span>
                  <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Max 5MB per file • JPG, PNG, MP4</span>
                  <input type="file" hidden multiple accept="image/*,video/*" onChange={handleFileChange} />
                </label>
                {evidencePreview.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-4">
                    {evidencePreview.map((url, idx) => (
                      <div key={idx} className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                        <img src={url} className="h-full w-full object-cover" />
                        <button onClick={() => removeFile(idx)} className="absolute top-1 right-1 h-5 w-5 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-8 flex justify-between">
                  <button onClick={handlePrev} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-black uppercase tracking-widest rounded-xl transition-all">Back</button>
                  <button onClick={handleNext} disabled={evidenceFiles.length === 0} className="px-6 py-3 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-black/10 flex items-center justify-center disabled:opacity-50">
                    Next Step <ArrowRight className="h-4 w-4 ml-2" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
                <h3 className="text-xl font-black text-emerald-950 mb-2">Resolution Preference</h3>
                <p className="text-xs text-slate-500 mb-8">How would you like us to resolve this?</p>
                <div className="space-y-4">
                  {[
                    { id: 'STORE_WALLET', label: 'Store Wallet Credit', icon: CreditCard, desc: 'Instant refund to your wallet. No wait time.' },
                    { id: 'ORIGINAL_METHOD', label: 'Original Payment Method', icon: RefreshCcw, desc: 'Refund processed to source account (5-7 days).' },
                    { id: 'REPLACEMENT', label: 'Request Replacement', icon: Package, desc: 'Ship a new product to your address.' }
                  ].map(pref => (
                    <label key={pref.id} className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${preference === pref.id ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:bg-slate-50'}`}>
                      <input type="radio" name="preference" value={pref.id} checked={preference === pref.id} onChange={() => setPreference(pref.id)} className="mt-1 text-emerald-600 focus:ring-emerald-600 h-4 w-4" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <pref.icon className={`h-4 w-4 ${preference === pref.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <h4 className="text-sm font-black text-emerald-950 uppercase tracking-widest">{pref.label}</h4>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{pref.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-auto pt-8 flex justify-between">
                  <button onClick={handlePrev} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-black uppercase tracking-widest rounded-xl transition-all">Back</button>
                  <button onClick={submitRefundRequest} disabled={submitting} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center disabled:opacity-50">
                    {submitting ? <><Loader2 className="animate-spin h-4 w-4 mr-2" /> Submitting...</> : <><ShieldCheck className="h-4 w-4 mr-2" /> Final Submit</>}
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 6 && (
              <motion.div key="step6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center py-10">
                <div className="h-24 w-24 bg-emerald-50 border-2 border-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-black text-emerald-950 mb-2 tracking-tight">Request Submitted!</h2>
                <p className="text-sm text-slate-500 mb-2 max-w-sm">We've received your request and our support team will begin investigating immediately.</p>
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-6 py-3 my-6 inline-block">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Your Ticket ID</p>
                  <p className="text-lg font-mono font-black text-slate-800">{ticketId}</p>
                </div>
                <button onClick={() => router.push('/account/refund-requests')} className="px-8 py-3 bg-slate-900 hover:bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-black/10 flex items-center justify-center">
                  Track Request Status
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
