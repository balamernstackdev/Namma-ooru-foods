'use client';

import React, { useState } from 'react';
import { CreditCard, ArrowDownLeft, ArrowUpRight, Download, Filter, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const transactions = [
  { id: 'TXN-8827641', date: '12 Apr 2024', desc: 'Order NOF-2024-001847', type: 'debit', amount: 1847, method: 'UPI', status: 'Success' },
  { id: 'TXN-8820192', date: '01 Apr 2024', desc: 'Refund – Order NOF-2024-001401', type: 'credit', amount: 549, method: 'Wallet', status: 'Refunded' },
  { id: 'TXN-8811034', date: '28 Mar 2024', desc: 'Order NOF-2024-001632', type: 'debit', amount: 748, method: 'Credit Card', status: 'Success' },
  { id: 'TXN-8805672', date: '15 Mar 2024', desc: 'Order NOF-2024-001589', type: 'debit', amount: 1199, method: 'Debit Card', status: 'Success' },
  { id: 'TXN-8799183', date: '02 Mar 2024', desc: 'Order NOF-2024-001401', type: 'debit', amount: 549, method: 'UPI', status: 'Cancelled' },
  { id: 'TXN-8791240', date: '18 Feb 2024', desc: 'Order NOF-2024-001298', type: 'debit', amount: 2249, method: 'Net Banking', status: 'Success' },
  { id: 'TXN-8780562', date: '04 Feb 2024', desc: 'Wallet Top-up', type: 'credit', amount: 1000, method: 'UPI', status: 'Success' },
];

const statusStyle: Record<string, string> = {
  Success: 'bg-emerald-100 text-emerald-700',
  Refunded: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-600',
};

export default function PaymentsPage() {
  const [filter, setFilter] = useState('All');
  const totalSpent = transactions.filter(t => t.type === 'debit' && t.status === 'Success').reduce((s, t) => s + t.amount, 0);
  const totalRefunded = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);

  const filtered = filter === 'All' ? transactions : transactions.filter(t => t.status === filter || t.type === filter);

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
            <p className="text-2xl font-black text-emerald-950">₹451.00</p>
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
            <table className="w-full">
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
                {filtered.map((tx, i) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
