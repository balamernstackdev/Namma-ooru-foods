'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';
import { CreditCard, Plus, Landmark, Smartphone, Trash2, CheckCircle2 } from 'lucide-react';

const fetcher = (url: string) => {
  const token = localStorage.getItem('namma_orru_token') || localStorage.getItem('token');
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());
};

export default function VendorPayoutMethods() {
  const { user } = useAuth();
  
  const { data: payoutMethods, mutate: mutatePayoutMethods } = useSWR(
    user?.brandId ? `${API_URL}/api/vendor/payout-methods?vendorId=${user.brandId}` : null,
    fetcher
  );

  const [activeTab, setActiveTab] = useState<'BANK'>('BANK');
  const [isAdding, setIsAdding] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | null, msg: string}>({ type: null, msg: '' });

  // Bank Form State
  const [bankData, setBankData] = useState({ accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '' });

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankData.ifscCode.match(/^[A-Z]{4}0[A-Z0-9]{6}$/)) {
      setStatus({ type: 'error', msg: 'Invalid IFSC Code format.' });
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/vendor/payout-methods/bank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bankData, vendorId: user?.brandId })
      });
      if (!res.ok) throw new Error('Failed to add Bank Account');
      await mutatePayoutMethods();
      setIsAdding(false);
      setBankData({ accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '' });
      setStatus({ type: 'success', msg: 'Bank Account added successfully.' });
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    }
  };



  return (
    <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-8 md:p-12 shadow-[0_4px_12px_rgba(0,0,0,0.05)] mt-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
           <h2 className="text-xl md:text-2xl font-black text-[#0F7A4D] uppercase tracking-tighter flex items-center gap-3">
              <CreditCard className="text-[#F59E0B]" />
              Payout Methods
           </h2>
           <p className="mt-2 text-[12px] uppercase tracking-widest font-bold text-[#6B7280]">Manage how you receive your earnings.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="h-10 px-4 rounded-xl bg-[#F8FAF7] text-[#0F7A4D] font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#E5E7EB] transition-colors"
          >
            <Plus size={16} /> Add Method
          </button>
        )}
      </div>

      {status.type && (
         <div className={`p-4 mb-6 rounded-2xl border text-sm font-bold uppercase tracking-widest ${
            status.type === 'success' 
            ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]' 
            : 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
         }`}>
            {status.msg}
         </div>
      )}

      {/* Payout Methods List */}
      {!isAdding && payoutMethods && payoutMethods.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {payoutMethods.map((method: any) => (
            <div key={method.id} className="p-6 rounded-[14px] border border-[#E5E7EB] bg-[#F8FAF7] relative group">
               <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-white shadow-sm flex items-center justify-center text-[#F59E0B]">
                    {method.type === 'BANK' ? <Landmark size={24} /> : <Smartphone size={24} />}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-black text-[#111827] tracking-widest uppercase">
                      {method.type === 'BANK' ? method.bankName : 'UPI Transfer'}
                    </h3>
                    <p className="text-[11px] font-bold text-[#6B7280] tracking-wider">
                      {method.accountHolderName}
                    </p>
                  </div>
               </div>
               
               <div className="space-y-1">
                 <p className="text-[14px] font-mono font-bold text-[#374151]">
                   {method.type === 'BANK' ? method.accountNumber : method.upiId}
                 </p>
                 {method.type === 'BANK' && (
                   <p className="text-[11px] font-bold text-[#6B7280] tracking-widest uppercase">IFSC: {method.ifscCode}</p>
                 )}
               </div>

               {method.isPrimary && (
                 <div className="absolute top-6 right-6 flex items-center gap-1 text-[#0F7A4D]">
                   <CheckCircle2 size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Primary</span>
                 </div>
               )}
            </div>
          ))}
        </div>
      )}

      {!isAdding && (!payoutMethods || payoutMethods.length === 0) && (
        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E7EB] rounded-[14px] bg-[#F8FAF7]">
          <Landmark className="h-12 w-12 text-[#9CA3AF] mb-4" />
          <span className="text-[12px] font-black uppercase tracking-widest text-[#6B7280]">No payout methods added</span>
        </div>
      )}

      {/* Add New Form */}
      {isAdding && (
        <div className="p-6 md:p-8 rounded-[14px] border border-[#E5E7EB] bg-[#F8FAF7]">
           <div className="flex items-center gap-4 border-b border-[#E5E7EB] pb-6 mb-6">
             <span className="pb-2 text-[12px] font-black uppercase tracking-widest text-[#F59E0B] border-b-2 border-[#F59E0B]">
               Bank Account
             </span>
           </div>
             <form onSubmit={handleAddBank} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Account Holder Name</label>
                    <input 
                      type="text" required value={bankData.accountHolderName} onChange={e => setBankData({...bankData, accountHolderName: e.target.value})}
                      className="w-full h-12 px-4 rounded-[14px] bg-white border border-[#E5E7EB] focus:outline-none focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/10 transition-all font-medium text-[#111827]"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Bank Name</label>
                    <input 
                      type="text" required value={bankData.bankName} onChange={e => setBankData({...bankData, bankName: e.target.value})}
                      className="w-full h-12 px-4 rounded-[14px] bg-white border border-[#E5E7EB] focus:outline-none focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/10 transition-all font-medium text-[#111827]"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Account Number</label>
                    <input 
                      type="text" required value={bankData.accountNumber} onChange={e => setBankData({...bankData, accountNumber: e.target.value.replace(/\D/g, '')})}
                      maxLength={18} minLength={9}
                      className="w-full h-12 px-4 rounded-[14px] bg-white border border-[#E5E7EB] focus:outline-none focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/10 transition-all font-medium text-[#111827] font-mono"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">IFSC Code</label>
                    <input 
                      type="text" required value={bankData.ifscCode} onChange={e => setBankData({...bankData, ifscCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')})}
                      maxLength={11} minLength={11}
                      className="w-full h-12 px-4 rounded-[14px] bg-white border border-[#E5E7EB] focus:outline-none focus:border-[#0F7A4D] focus:ring-4 focus:ring-[#0F7A4D]/10 transition-all font-medium text-[#111827] font-mono"
                      placeholder="e.g. HDFC0001234"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 justify-end pt-4">
                  <button type="button" onClick={() => setIsAdding(false)} className="text-[11px] font-black uppercase tracking-widest text-[#6B7280] hover:text-[#374151]">Cancel</button>
                  <button type="submit" className="h-12 px-8 rounded-[14px] bg-[#0F7A4D] text-white font-black text-[11px] uppercase tracking-widest hover:bg-[#0a5c3a] transition-all">
                    Save Bank Account
                  </button>
                </div>
             </form>
        </div>
      )}
    </div>
  );
}
