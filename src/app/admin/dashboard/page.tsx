import React from 'react';
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ORDERS } from '@/lib/staticData';

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-[var(--muted-foreground)]">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Sales" 
          value="₹1,24,500" 
          change="+12.5%" 
          isPositive={true} 
          Icon={DollarSign} 
        />
        <StatCard 
          title="Active Orders" 
          value="45" 
          change="+8%" 
          isPositive={true} 
          Icon={ShoppingBag} 
        />
        <StatCard 
          title="New Users" 
          value="128" 
          change="-3.2%" 
          isPositive={false} 
          Icon={Users} 
        />
        <StatCard 
          title="Conversion Rate" 
          value="4.2%" 
          change="+1.5%" 
          isPositive={true} 
          Icon={TrendingUp} 
        />
      </div>

      {/* Recent Orders Snippet */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8">
        <div className="mb-6 flex items-center justify-between">
           <h2 className="text-xl font-bold">Recent Orders</h2>
           <button className="text-sm font-semibold text-[var(--primary)] hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)] text-sm font-semibold text-[var(--muted-foreground)]">
                <th className="pb-4">Order ID</th>
                <th className="pb-4">Customer</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Amount</th>
                <th className="pb-4">Date</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[var(--foreground)]">
              {ORDERS.map((order, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-4 font-medium">{order.id}</td>
                  <td className="py-4">{order.customer}</td>
                  <td className="py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 font-bold">{order.amount}</td>
                  <td className="py-4 text-[var(--muted-foreground)]">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function StatCard({ title, value, change, isPositive, Icon }: any) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-[var(--primary)]/10 p-3 text-[var(--primary)]">
          <Icon className="h-6 w-6" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {change} {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wider">{title}</p>
        <h3 className="mt-1 text-3xl font-bold">{value}</h3>
      </div>
    </div>
  );
}

export default DashboardPage;
