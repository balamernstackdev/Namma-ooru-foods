'use client';

import React from 'react';
import { Bell, Trash2, CheckCircle, Clock } from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
   id: number;
   title: string;
   message: string;
   type: string;
   isRead: boolean;
   createdAt: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const NotificationsPage = () => {
   const { data: notifications, mutate } = useSWR<Notification[]>(`${API_URL}/api/notifications`, fetcher);

   const markAsRead = async (id: number) => {
      await fetch(`${API_URL}/api/notifications/${id}/read`, { method: 'PATCH' });
      mutate();
   };

   const deleteNotification = async (id: number) => {
      await fetch(`${API_URL}/api/notifications/${id}`, { method: 'DELETE' });
      mutate();
   };

   return (
      <div className="flex flex-col gap-8 animate-in fade-in duration-700">
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Alerts</h1>
               <p className="text-slate-500 font-medium">Real-time feed of product approvals, vendor submissions, and system events.</p>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* History */}
            <div className="lg:col-span-2 rounded-[2rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
               <div className="border-b border-slate-50 p-8 bg-slate-50/50">
                  <h2 className="font-black text-slate-900 flex items-center gap-3 uppercase text-xs tracking-widest">
                     <Bell className="h-4 w-4 text-emerald-600" /> Recent Activity
                  </h2>
               </div>
               <div className="divide-y divide-slate-50">
                  {notifications?.length === 0 && (
                     <div className="p-20 text-center">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-6">
                           <Bell size={40} />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No recent alerts</p>
                     </div>
                  )}
                  {notifications?.map((n) => (
                     <div key={n.id} className={`p-8 hover:bg-slate-50/50 transition-colors ${!n.isRead ? 'border-l-4 border-emerald-500' : ''}`}>
                        <div className="flex items-start justify-between">
                           <div className="space-y-1">
                              <h3 className={`font-black text-lg ${!n.isRead ? 'text-slate-900' : 'text-slate-500'}`}>{n.title}</h3>
                              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                 <span className="px-2 py-0.5 rounded bg-slate-100">{n.type}</span>
                                 <span className="flex items-center gap-1"><Clock size={12} /> {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              {!n.isRead && (
                                 <button 
                                    onClick={() => markAsRead(n.id)}
                                    className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all"
                                    title="Mark as Read"
                                 >
                                    <CheckCircle size={18} />
                                 </button>
                              )}
                              <button 
                                 onClick={() => deleteNotification(n.id)}
                                 className="p-2 rounded-lg bg-red-50 text-red-300 hover:bg-red-100 hover:text-red-500 transition-all"
                                 title="Delete"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                        </div>
                        <p className="mt-4 text-slate-600 font-medium leading-relaxed">{n.message}</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-col gap-6">
               <div className="rounded-[2rem] border border-slate-100 bg-[var(--admin-sidebar)] p-8 text-white">
                  <h3 className="font-black text-[var(--admin-accent)] mb-6 uppercase text-[10px] tracking-widest opacity-80">Pending Tasks</h3>
                  <p className="text-5xl font-black tracking-tighter">
                     {notifications?.filter(n => !n.isRead).length || 0}
                  </p>
                  <p className="mt-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Unread Alerts</p>
               </div>
               
               <div className="rounded-[2rem] border border-slate-100 bg-white p-8">
                  <h3 className="font-black text-slate-400 mb-6 uppercase text-[10px] tracking-widest">System Health</h3>
                  <div className="flex items-center gap-4">
                     <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="font-black text-slate-900 text-sm">Monitoring Active</span>
                  </div>
                  <p className="mt-4 text-slate-500 text-xs font-medium">All approval triggers are operating within normal latency parameters.</p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default NotificationsPage;
