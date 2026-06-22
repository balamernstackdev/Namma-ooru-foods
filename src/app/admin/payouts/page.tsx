'use client';

import React from 'react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { Landmark, Smartphone, CheckCircle2 } from 'lucide-react';

const fetcher = (url: string) => {
  const token = localStorage.getItem('token');
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json());
};

export default function AdminVendorPayouts() {
  const [activeTab, setActiveTab] = React.useState('settlements');
  const [processingId, setProcessingId] = React.useState<number | null>(null);

  const { data: methods, error: methodsError, isLoading: loadingMethods } = useSWR(`${API_URL}/api/vendor/payout-methods/all`, fetcher);
  const { data: ledgers, error: ledgersError, isLoading: loadingLedgers, mutate: mutateLedgers } = useSWR(`${API_URL}/api/vendor/payouts/ledgers`, fetcher);

  const handleProcessPayout = async (vendor: any) => {
    if (!window.confirm(`Process payout of ₹${vendor.pendingBalance} for ${vendor.name}?`)) return;

    const primaryMethod = vendor.payoutMethods?.find((m: any) => m.isPrimary) || vendor.payoutMethods?.[0];
    if (!primaryMethod) {
      alert("This vendor does not have a payout method configured.");
      return;
    }

    setProcessingId(vendor.id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/vendor/payouts/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          vendorId: vendor.id,
          amount: vendor.pendingBalance,
          methodId: primaryMethod.id,
          notes: 'Automated settlement'
        })
      });

      if (!res.ok) throw new Error('Failed to process payout');
      alert('Payout processed successfully!');
      mutateLedgers();
    } catch (error) {
      console.error(error);
      alert('Error processing payout');
    } finally {
      setProcessingId(null);
    }
  };

  if (loadingMethods || loadingLedgers) {
    return (
      <div className="flex h-96 items-center justify-center bg-[#F8FAF7]">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-[#0F7A4D] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-[#111827] tracking-tighter flex items-center gap-3">
              <Landmark className="text-[#0F7A4D]" />
              Payouts Management
            </h1>
            <p className="mt-2 text-[12px] uppercase tracking-widest font-bold text-[#6B7280]">
              Manage vendor ledgers and process payments
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-6 border-b border-[#E5E7EB] mb-8">
          <button
            onClick={() => setActiveTab('settlements')}
            className={`pb-4 text-[13px] font-black uppercase tracking-widest transition-colors relative ${activeTab === 'settlements' ? 'text-[#0F7A4D]' : 'text-[#6B7280] hover:text-[#111827]'}`}
          >
            Pending Settlements
            {activeTab === 'settlements' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F7A4D] rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('methods')}
            className={`pb-4 text-[13px] font-black uppercase tracking-widest transition-colors relative ${activeTab === 'methods' ? 'text-[#0F7A4D]' : 'text-[#6B7280] hover:text-[#111827]'}`}
          >
            Configured Methods
            {activeTab === 'methods' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F7A4D] rounded-t-full" />}
          </button>
        </div>

        {activeTab === 'settlements' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px] admin-data-table">
              <thead>
                <tr className="bg-[#F8FAF7] border-b border-[#E5E7EB]">
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Vendor</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Commission Rate</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Pending Balance</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {ledgers?.map((vendor: any) => (
                  <tr key={vendor.id} className="hover:bg-[#F8FAF7]/50 transition-colors duration-300">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 border border-[#E5E7EB] overflow-hidden flex items-center justify-center font-black text-[#6B7280]">
                          {vendor.logo ? <img src={vendor.logo} alt="" className="w-full h-full object-cover" /> : vendor.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-black text-[#111827]">{vendor.name}</span>
                          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                            Primary: {vendor.payoutMethods?.[0]?.type || 'NONE'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FEF3C7] text-[#B45309] text-[12px] font-black">
                        {vendor.commissionRate}%
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <span className="text-[16px] font-black text-[#0F7A4D]">
                        ₹{Number(vendor.pendingBalance).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <button
                        onClick={() => handleProcessPayout(vendor)}
                        disabled={Number(vendor.pendingBalance) <= 0 || processingId === vendor.id}
                        className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${Number(vendor.pendingBalance) > 0 ? 'bg-[#0F7A4D] hover:bg-[#0c623d] text-white shadow-sm' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                      >
                        {processingId === vendor.id ? 'Processing...' : 'Settle Payout'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px] admin-data-table">
              <thead>
                <tr className="bg-[#F8FAF7] border-b border-[#E5E7EB]">
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Vendor</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Method</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Details</th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-[#6B7280] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {methods?.length > 0 ? methods.map((method: any) => (
                  <tr key={method.id} className="hover:bg-[#F8FAF7]/50 transition-colors">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-50 border border-[#E5E7EB] overflow-hidden">
                          {method.subVendor?.logo ? (
                            <img src={method.subVendor.logo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-[#6B7280]">
                              {method.subVendor?.name?.substring(0, 2).toUpperCase() || 'V'}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-black text-[#111827]">{method.subVendor?.name || 'Unknown Vendor'}</span>
                          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">ID: {method.subVendorId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        {method.type === 'BANK' ? (
                          <Landmark size={16} className="text-[#0F7A4D]" />
                        ) : (
                          <Smartphone size={16} className="text-purple-500" />
                        )}
                        <span className="text-[12px] font-black text-[#111827] uppercase tracking-widest">
                          {method.type}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-mono font-bold text-[#111827]">
                          {method.type === 'BANK' ? method.accountNumber : method.upiId}
                        </span>
                        {method.type === 'BANK' && (
                          <span className="text-[10px] font-bold text-[#6B7280] tracking-widest">
                            {method.bankName} • {method.ifscCode}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#DCFCE7] text-[#15803D] border border-[#DCFCE7]">
                        <CheckCircle2 size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-[#6B7280] font-bold text-sm uppercase tracking-widest">
                      No payout methods found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
