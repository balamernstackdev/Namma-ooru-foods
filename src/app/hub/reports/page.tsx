'use client';

import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import {
  BarChart3, TrendingUp, IndianRupee, Users, Package, ArrowUpRight,
  CheckCircle2, XCircle, ShoppingBag
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }).then(res => {
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  });
};

const CHART_COLORS = ['#059669', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-3">
        {label && <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>}
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm font-black" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' && entry.value > 1000
              ? `₹${entry.value.toLocaleString('en-IN')}`
              : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function VendorHubReports() {
  const { data: stats } = useSWR(`${API_URL}/api/vendor-hub/dashboard`, fetcher);
  const { data: subVendorsData } = useSWR(`${API_URL}/api/vendor-hub/sub-vendors?limit=100`, fetcher);
  const { data: payoutsData } = useSWR(`${API_URL}/api/vendor-hub/payouts?limit=10`, fetcher);

  const subVendors = subVendorsData?.subVendors || [];
  const payouts = payoutsData?.payouts || [];

  // Build order status breakdown pie data
  const orderBreakdown = stats ? [
    { name: 'Delivered', value: stats.deliveredOrders || 0, color: '#059669' },
    { name: 'Cancelled', value: stats.cancelledOrders || 0, color: '#ef4444' },
    { name: 'Other', value: Math.max(0, (stats.totalOrders || 0) - (stats.deliveredOrders || 0) - (stats.cancelledOrders || 0)), color: '#f59e0b' },
  ].filter(d => d.value > 0) : [];

  // Build vendor comparison bar data from subvendors
  const vendorBarData = subVendors
    .slice(0, 8)
    .map((sv: any) => ({
      name: sv.name.length > 12 ? sv.name.slice(0, 12) + '…' : sv.name,
      products: sv._count?.products || 0,
      orders: sv.ordersCount || 0,
      revenue: Math.round(sv.revenue || 0),
    }));

  // Payout trend (last 10 payouts)
  const payoutTrend = [...payouts].reverse().map((p: any, idx: number) => ({
    name: `#${idx + 1}`,
    amount: Number(p.amount) || 0,
    status: p.status,
  }));

  // Hub performance summary cards
  const summaryCards = [
    {
      label: 'Total Hub Sales',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      sub: 'Gross revenue from all vendors',
      icon: IndianRupee,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      label: 'Active Sub Vendors',
      value: `${stats?.activeVendors || 0} / ${stats?.totalVendors || 0}`,
      sub: 'Active vs Total registered',
      icon: Users,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      label: 'Pending Settlements',
      value: `₹${(stats?.pendingPayouts || 0).toLocaleString('en-IN')}`,
      sub: 'Awaiting payout processing',
      icon: TrendingUp,
      color: 'bg-orange-50 text-orange-500'
    },
    {
      label: 'Total Catalog Items',
      value: `${stats?.totalProducts || 0}`,
      sub: 'Products across all vendors',
      icon: Package,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      label: 'Total Customers',
      value: `${stats?.totalCustomers || 0}`,
      sub: 'Unique buyers via this hub',
      icon: Users,
      color: 'bg-sky-50 text-sky-600'
    },
    {
      label: 'Fulfilled Orders',
      value: `${stats?.deliveredOrders || 0}`,
      sub: `of ${stats?.totalOrders || 0} total orders`,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-600'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-3">
          <BarChart3 className="text-green-700" size={32} />
          Reports & <span className="text-emerald-600">Analytics</span>
        </h1>
        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
          Monitor hub performance, sub-vendor sales, and payout trends.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className={`p-4 rounded-2xl ${card.color.split(' ')[0]}`}>
                <Icon size={24} className={card.color.split(' ')[1]} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{card.label}</p>
                <h3 className="text-xl font-black text-slate-950 mt-1">{card.value}</h3>
                <p className="text-[9px] font-semibold text-slate-400 mt-0.5">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Comparison Bar Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Vendor Performance Comparison</h3>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
              {subVendors.length} Brands
            </span>
          </div>
          {vendorBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={vendorBarData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} dy={8} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8' }}
                />
                <Bar dataKey="products" name="Products" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="orders" name="Orders" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">No vendor data yet</p>
            </div>
          )}
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Order Status Breakdown</h3>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
              {stats?.totalOrders || 0} Total
            </span>
          </div>
          {orderBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={orderBreakdown}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {orderBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {orderBreakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {item.name}: {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">No order data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payout Trend Area Chart */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Payout Trend</h3>
            <span className="text-[9px] font-black uppercase tracking-widest text-green-700 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
              Recent Settlements
            </span>
          </div>
          {payoutTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={payoutTrend}>
                <defs>
                  <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} dy={8} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" name="Payout ₹" stroke="#059669" strokeWidth={2.5} fill="url(#payGrad)" dot={{ r: 4, fill: '#059669', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center">
              <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">No payout data yet</p>
            </div>
          )}
        </div>

        {/* Recent Payouts List */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Recent Payouts</h3>
          </div>
          <div className="space-y-3">
            {payouts.slice(0, 6).map((payout: any) => (
              <div key={payout.id} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[11px] font-black text-slate-950 uppercase truncate">{payout.subVendor?.name || 'Sub Vendor'}</p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    {new Date(payout.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-slate-950">₹{Number(payout.amount).toLocaleString('en-IN')}</p>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border mt-0.5 inline-block ${
                    payout.status === 'COMPLETED' || payout.status === 'SETTLED'
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                      : payout.status === 'FAILED'
                      ? 'text-red-700 bg-red-50 border-red-100'
                      : 'text-amber-700 bg-amber-50 border-amber-100'
                  }`}>
                    {payout.status}
                  </span>
                </div>
              </div>
            ))}
            {payouts.length === 0 && (
              <div className="py-8 text-center font-bold text-slate-300 uppercase tracking-widest text-xs">
                No payouts yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Vendor Catalog Volume Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex justify-between items-center border-b border-slate-50 pb-4 mb-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Sub Vendor Catalog & Performance</h3>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
            {subVendors.length} Brands Registered
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                {['Vendor ID', 'Brand Name', 'Owner', 'Products', 'Orders', 'Revenue', 'Status', ''].map(h => (
                  <th key={h} className="pb-3 pr-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
              {subVendors.map((sv: any) => {
                const svStatus = sv.deletedAt ? 'Disabled' : (sv.userId ? 'Active' : 'Pending');
                return (
                  <tr key={sv.id} className="group hover:bg-slate-50/50">
                    <td className="py-4 pr-4">
                      <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        SEL-{sv.id.toString().padStart(3, '0')}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-1.5 font-black text-slate-400 text-[9px]">
                          {sv.logo ? <img src={sv.logo} alt="" className="object-contain max-h-full" /> : sv.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-950 uppercase text-[11px]">{sv.name}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-[11px] text-slate-500">{sv.owner?.name || 'Pending'}</td>
                    <td className="py-4 pr-4 text-center">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {sv._count?.products || 0}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-center font-bold">{sv.ordersCount || 0}</td>
                    <td className="py-4 pr-4 font-bold text-emerald-700">₹{Number(sv.revenue || 0).toLocaleString('en-IN')}</td>
                    <td className="py-4 pr-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        svStatus === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                        svStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-red-50 text-red-700 border-red-100'
                      }`}>{svStatus}</span>
                    </td>
                    <td className="py-4 text-right">
                      <a href={`/hub/sub-vendors/${sv.id}`} className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold uppercase text-[10px] tracking-wider">
                        Details <ArrowUpRight size={12} />
                      </a>
                    </td>
                  </tr>
                );
              })}
              {subVendors.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center font-bold text-slate-300 uppercase tracking-widest text-xs">
                    No Sub Vendors registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
