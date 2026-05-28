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
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-sm mt-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
           <h2 className="text-xl md:text-2xl font-black text-emerald-950 dark:text-white uppercase tracking-tighter flex items-center gap-3">
              <CreditCard className="text-amber-500" />
              Payout Methods
           </h2>
           <p className="mt-2 text-[12px] uppercase tracking-widest font-bold text-slate-400">Manage how you receive your earnings.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="h-10 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
          >
            <Plus size={16} /> Add Method
          </button>
        )}
      </div>

      {status.type && (
         <div className={`p-4 mb-6 rounded-2xl border text-sm font-bold uppercase tracking-widest ${
            status.type === 'success' 
            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30' 
            : 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/30'
         }`}>
            {status.msg}
         </div>
      )}

      {/* Payout Methods List */}
      {!isAdding && payoutMethods && payoutMethods.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {payoutMethods.map((method: any) => (
            <div key={method.id} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 relative group">
               <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-amber-500">
                    {method.type === 'BANK' ? <Landmark size={24} /> : <Smartphone size={24} />}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-black text-emerald-950 dark:text-white tracking-widest uppercase">
                      {method.type === 'BANK' ? method.bankName : 'UPI Transfer'}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400 tracking-wider">
                      {method.accountHolderName}
                    </p>
                  </div>
               </div>
               
               <div className="space-y-1">
                 <p className="text-[14px] font-mono font-bold text-slate-600 dark:text-slate-300">
                   {method.type === 'BANK' ? method.accountNumber : method.upiId}
                 </p>
                 {method.type === 'BANK' && (
                   <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">IFSC: {method.ifscCode}</p>
                 )}
               </div>

               {method.isPrimary && (
                 <div className="absolute top-6 right-6 flex items-center gap-1 text-emerald-500">
                   <CheckCircle2 size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Primary</span>
                 </div>
               )}
            </div>
          ))}
        </div>
      )}

      {!isAdding && (!payoutMethods || payoutMethods.length === 0) && (
        <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
          <Landmark className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
          <span className="text-[12px] font-black uppercase tracking-widest text-slate-400">No payout methods added</span>
        </div>
      )}

      {/* Add New Form */}
      {isAdding && (
        <div className="p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
           <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-6">
             <span className="pb-2 text-[12px] font-black uppercase tracking-widest text-amber-500 border-b-2 border-amber-500">
               Bank Account
             </span>
           </div>
             <form onSubmit={handleAddBank} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#022c22]/50 dark:text-slate-400">Account Holder Name</label>
                    <input 
                      type="text" required value={bankData.accountHolderName} onChange={e => setBankData({...bankData, accountHolderName: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#022c22]/50 dark:text-slate-400">Bank Name</label>
                    <input 
                      type="text" required value={bankData.bankName} onChange={e => setBankData({...bankData, bankName: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#022c22]/50 dark:text-slate-400">Account Number</label>
                    <input 
                      type="text" required value={bankData.accountNumber} onChange={e => setBankData({...bankData, accountNumber: e.target.value.replace(/\D/g, '')})}
                      maxLength={18} minLength={9}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#022c22]/50 dark:text-slate-400">IFSC Code</label>
                    <input 
                      type="text" required value={bankData.ifscCode} onChange={e => setBankData({...bankData, ifscCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')})}
                      maxLength={11} minLength={11}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-amber-400 font-mono"
                      placeholder="e.g. HDFC0001234"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 justify-end pt-4">
                  <button type="button" onClick={() => setIsAdding(false)} className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancel</button>
                  <button type="submit" className="h-12 px-8 rounded-xl bg-emerald-950 text-white font-black text-[11px] uppercase tracking-widest hover:bg-amber-500 hover:text-emerald-950 transition-colors">
                    Save Bank Account
                  </button>
                </div>
             </form>
        </div>
      )}
    </div>
  );
}
