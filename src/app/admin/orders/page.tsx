'use client';

import React from 'react';
import { Eye, Download, Search, Filter } from 'lucide-react';
import { ORDERS } from '@/lib/staticData';

const OrderManagementPage = () => {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Order Management</h1>
        <p className="text-[var(--muted-foreground)]">Track and fulfill customer orders in real-time.</p>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer Name..." 
            className="h-11 w-full rounded-xl bg-[var(--muted)] pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>
        <button className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-bold bg-[var(--card)] hover:bg-[var(--muted)] transition-all">
          <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[var(--muted)]/50 text-sm font-semibold text-[var(--muted-foreground)] border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {ORDERS.map((order, i) => (
              <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30 transition-colors">
                <td className="px-6 py-4 font-bold">{order.id}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold">{order.customer}</span>
                    <span className="text-xs text-[var(--muted-foreground)]">{order.date}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{order.items} products</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold">{order.amount}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-[var(--muted-foreground)] hover:text-[var(--secondary)] transition-colors">
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagementPage;
