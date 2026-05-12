'use client';

import React from 'react';
import { Bell, Trash2, CheckCircle, Clock, ShoppingBag } from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
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

const VendorNotificationsPage = () => {
   const { user } = useAuth();
   const { data: rawData, mutate } = useSWR<any>(
      user?.id ? `${API_URL}/api/notifications?userId=${user.id}` : null, 
      fetcher
   );

   const notificationsList: Notification[] = Array.isArray(rawData) 
      ? rawData 
      : (rawData && Array.isArray(rawData.notifications) ? rawData.notifications : []);

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
               <h1 className="text-4xl font-black text-slate-900 tracking-tight">Vendor Notifications</h1>
               <p className="text-slate-500 font-medium">Tracking your product approvals, store status, and customer interactions.</p>
            </div>
         </div>

         <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* History */}
            <div className="lg:col-span-2 rounded-[2rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
               <div className="border-b border-slate-50 p-8 bg-slate-50/50">
                  <h2 className="font-black text-slate-900 flex items-center gap-3 uppercase text-xs tracking-widest">
                     <Bell className="h-4 w-4 text-amber-600" /> Recent Updates
                  </h2>
               </div>
               <div className="divide-y divide-slate-50">
                  {!notificationsList || notificationsList.length === 0 ? (
                     <div className="p-20 text-center">
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-6">
                           <Bell size={40} />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No recent notifications</p>
                     </div>
                  ) : (
                     notificationsList.map((n) => (
                        <div key={n.id} className={`p-8 hover:bg-slate-50/50 transition-colors ${!n.isRead ? 'border-l-4 border-amber-500' : ''}`}>
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
                                       className="p-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all"
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
                     ))
                  )}
               </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-col gap-6">
               <div className="rounded-[2rem] border border-slate-100 bg-emerald-900 p-8 text-white">
                  <h3 className="font-black text-emerald-400 mb-6 uppercase text-[10px] tracking-widest opacity-80">Store Status</h3>
                  <div className="flex items-center gap-4">
                     <div className="h-4 w-4 rounded-full bg-emerald-400 animate-pulse" />
                     <p className="text-3xl font-black tracking-tighter">Live</p>
                  </div>
                  <p className="mt-4 text-emerald-200/60 text-xs font-bold uppercase tracking-widest">All products are syncing</p>
               </div>
               
               <div className="rounded-[2rem] border border-slate-100 bg-white p-8">
                  <h3 className="font-black text-slate-400 mb-6 uppercase text-[10px] tracking-widest">Unread Alerts</h3>
                  <p className="text-5xl font-black tracking-tighter text-slate-900">
                     {notificationsList.filter(n => !n.isRead).length || 0}
                  </p>
                  <p className="mt-4 text-slate-500 text-xs font-medium italic">Check your pending approvals regularly.</p>
               </div>
            </div>
         </div>
      </div>
   );
};

export default VendorNotificationsPage;
