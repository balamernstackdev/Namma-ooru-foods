'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowDownLeft, ArrowUpRight, Download, Filter, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';

const statusStyle: Record<string, string> = {
  Success: 'bg-emerald-100 text-emerald-700',
  Refunded: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-600',
  Pending: 'bg-amber-100 text-amber-700',
};

export default function PaymentsPage() {
  const [filter, setFilter] = useState('All');
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_URL}/api/payments/transactions/user/${user.id}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          const mapped = data.map((tx: any) => {
            const isSuccess = tx.status === 'SUCCESS';
            const isFailed = tx.status === 'FAILED';
            const isRefund = tx.type === 'REFUND';
            
            let status = 'Pending';
            if (isSuccess) status = 'Success';
            else if (isFailed) status = 'Cancelled';
            else if (isRefund) status = 'Refunded';

            return {
              id: `TXN${tx.id}`,
              desc: `Payment for Order #${tx.orderId}`,
              method: tx.method,
              date: new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
              status,
              type: isRefund ? 'credit' : 'debit',
              amount: Number(tx.amount)
            };
          });
          setTransactions(mapped);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const totalSpent = transactions.filter(t => t.type === 'debit' && t.status === 'Success').reduce((s, t) => s + t.amount, 0);
  const totalRefunded = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);

  const filtered = filter === 'All' ? transactions : transactions.filter(t => t.status === filter || t.type === filter);

  if (loading) {
     return (
        <div className="flex justify-center items-center h-64">
           <Loader2 className="animate-spin text-emerald-600 h-8 w-8" />
        </div>
     );
  }

  return (
    <div className="py-2 px-0 md:px-4">
      <div className="max-w-4xl">

        {/* Mobile Back Button */}
        <Link href="/account" className="md:hidden flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-6 bg-emerald-50 w-fit px-4 py-2 rounded-full">
          <ChevronLeft className="h-4 w-4" /> Back to Account
        </Link>

        <h1 className="text-3xl font-black text-emerald-950 tracking-tighter mb-8">Payment History</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-emerald-950 rounded-[1.5rem] p-5 text-white">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Total Spent</p>
            <p className="text-2xl font-black">₹{totalSpent.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-300/60 font-medium mt-1">Across {transactions.filter(t => t.type === 'debit' && t.status === 'Success').length} orders</p>
          </div>
          <div className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Refunded</p>
            <p className="text-2xl font-black text-blue-600">₹{totalRefunded.toLocaleString()}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">{transactions.filter(t => t.type === 'credit').length} refunds</p>
          </div>
          <div className="bg-amber-50 rounded-[1.5rem] p-5 border border-amber-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Wallet Balance</p>
            <p className="text-2xl font-black text-emerald-950">₹0.00</p>
            <p className="text-[10px] text-slate-400 font-medium mt-1">Available credits</p>
          </div>
        </div>

        {/* Filter + Table */}
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex gap-2">
              {['All', 'debit', 'credit', 'Cancelled'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-emerald-950 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {f === 'debit' ? 'Payments' : f === 'credit' ? 'Refunds' : f}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-700 transition-colors">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] admin-data-table">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Method</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="text-right px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <CreditCard className="h-10 w-10 text-slate-200 mb-3" />
                        <p className="text-[14px] font-black text-emerald-950 mb-1">No transactions found</p>
                        <p className="text-[12px] text-slate-400 font-medium">Your payment history will appear here once you make a purchase.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx, i) => (
                    <tr key={tx.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-blue-50' : 'bg-slate-100'}`}>
                            {tx.type === 'credit'
                              ? <ArrowDownLeft className="h-4 w-4 text-blue-500" />
                              : <ArrowUpRight className="h-4 w-4 text-slate-500" />
                            }
                          </div>
                          <div>
                            <p className="text-[12px] font-black text-emerald-950">{tx.desc}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{tx.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-[12px] font-bold text-slate-600">{tx.method}</td>
                      <td className="px-4 py-4 text-[12px] font-medium text-slate-500">{tx.date}</td>
                      <td className="px-4 py-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${statusStyle[tx.status]}`}>{tx.status}</span>
                      </td>
                      <td className={`px-6 py-4 text-right text-[14px] font-black ${tx.type === 'credit' ? 'text-blue-600' : 'text-emerald-950'}`}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
