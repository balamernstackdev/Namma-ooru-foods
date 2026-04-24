'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const data = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 5000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 6390 },
  { name: 'Sun', sales: 8490 },
];

const categoryData = [
  { name: 'Pickles', value: 400 },
  { name: 'Grains', value: 300 },
  { name: 'Cold Pressed', value: 300 },
  { name: 'Traditional', value: 200 },
];

const COLORS = ['#064e3b', '#f59e0b', '#3b82f6', '#ec4899'];

export const SalesPerformanceChart = () => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
          dy={10}
        />
        <YAxis 
           hide 
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '16px', 
            border: 'none', 
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            padding: '12px'
          }}
          itemStyle={{ fontSize: '12px', fontWeight: 900, color: '#064e3b' }}
        />
        <Area 
          type="monotone" 
          dataKey="sales" 
          stroke="#10b981" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorSales)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const CategoryPieChart = () => (
  <div className="h-[300px] w-full mt-4">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={categoryData}
          innerRadius={60}
          outerRadius={80}
          paddingAngle={8}
          dataKey="value"
        >
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
        />
      </PieChart>
    </ResponsiveContainer>
    <div className="flex flex-wrap justify-center gap-4 mt-4">
       {categoryData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.name}</span>
          </div>
       ))}
    </div>
  </div>
);
