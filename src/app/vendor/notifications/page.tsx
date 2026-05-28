'use client';

import React, { useState, useMemo } from 'react';
import { Bell, Trash2, CheckCircle, Clock, Search, ShoppingBag, Package, Settings, ShieldAlert, CheckCheck } from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
   id: number;
   title: string;
   message: string;
   type?: string;
   notificationType?: string;
   isRead: boolean;
   createdAt: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const TABS = [
   { id: 'ALL', label: 'All', icon: Bell },
   { id: 'UNREAD', label: 'Unread', icon: ShieldAlert },
   { id: 'ORDER', label: 'Orders', icon: ShoppingBag },
   { id: 'PRODUCT', label: 'Products', icon: Package },
   { id: 'SYSTEM', label: 'System', icon: Settings },
];

const VendorNotificationsPage = () => {
   const { user } = useAuth();
   const [activeTab, setActiveTab] = useState('ALL');
   const [searchQuery, setSearchQuery] = useState('');
   const [isMarkingAll, setIsMarkingAll] = useState(false);

   const { data: rawData, mutate } = useSWR<any>(
      user?.id ? `${API_URL}/api/notifications?recipientId=${user.id}&vendorId=${user.brandId || ''}&limit=100` : null, 
      fetcher
   );

   const notificationsList: Notification[] = Array.isArray(rawData) 
      ? rawData 
      : (rawData && Array.isArray(rawData.notifications) ? rawData.notifications : []);

   const filteredNotifications = useMemo(() => {
      return notificationsList.filter(n => {
         const type = (n.notificationType || n.type || '').toUpperCase();
         const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());

         if (!matchesSearch) return false;

         if (activeTab === 'ALL') return true;
         if (activeTab === 'UNREAD') return !n.isRead;
         if (activeTab === 'ORDER') return type.includes('ORDER');
         if (activeTab === 'PRODUCT') return type.includes('PRODUCT') || type.includes('APPROVAL');
         if (activeTab === 'SYSTEM') return type === 'INFO' || type.includes('SYSTEM') || type.includes('ADMIN');

         return type === activeTab;
      });
   }, [notificationsList, activeTab, searchQuery]);

   const markAsRead = async (id: number) => {
      await fetch(`${API_URL}/api/notifications/${id}/read`, { method: 'PATCH' });
      mutate();
   };

   const markAllAsRead = async () => {
      setIsMarkingAll(true);
      try {
         await fetch(`${API_URL}/api/notifications/read-all`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipientId: user?.id, vendorId: user?.brandId })
         });
         mutate();
      } finally {
         setIsMarkingAll(false);
      }
   };

   const deleteNotification = async (id: number) => {
      await fetch(`${API_URL}/api/notifications/${id}`, { method: 'DELETE' });
      mutate();
   };

   return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
         {/* Actions & Filters */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
               <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full pl-12 pr-4 rounded-2xl bg-white border border-slate-200 dark:border-slate-800 dark:bg-slate-900 shadow-sm outline-none font-bold text-slate-700 dark:text-slate-300 text-sm focus:border-emerald-500 transition-all"
               />
            </div>
            <button
               onClick={markAllAsRead}
               disabled={isMarkingAll || notificationsList.filter(n => !n.isRead).length === 0}
               className="h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
            >
               <CheckCheck size={16} />
               Clear Unread
            </button>
         </div>

         {/* Navigation Tabs */}
         <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-100 dark:border-slate-800">
            {TABS.map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap
                     ${activeTab === tab.id
                        ? 'bg-emerald-950 text-amber-400 dark:bg-slate-850 dark:text-amber-400 shadow-xl shadow-slate-900/10 scale-105'
                        : 'bg-white border border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                     }
                  `}
               >
                  <tab.icon size={14} />
                  {tab.label}
                  {tab.id === 'UNREAD' && notificationsList.filter(n => !n.isRead).length > 0 && (
                     <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[8px]">{notificationsList.filter(n => !n.isRead).length}</span>
                  )}
               </button>
            ))}
         </div>

         {/* Notification List */}
         <div className="w-full space-y-4">
            <AnimatePresence mode="popLayout">
               {filteredNotifications.length === 0 ? (
                  <motion.div
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                     className="py-32 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800"
                  >
                     <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-200 dark:text-slate-700 mb-8">
                        <Bell size={48} strokeWidth={1} />
                     </div>
                     <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic">Zero Frequency</h3>
                     <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] mt-2">No notifications found matching your filters</p>
                  </motion.div>
               ) : (
                  filteredNotifications.map((n) => (
                     <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`group relative bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 dark:border-slate-800
                           ${!n.isRead ? 'border-emerald-100 bg-emerald-50/10 dark:border-emerald-950/20' : 'border-slate-100'}
                        `}
                     >
                        <div className="flex items-start justify-between gap-6">
                           <div className="flex-1 space-y-4">
                              <div className="flex items-center gap-3">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{n.notificationType || n.type || 'Alert'}</span>
                                 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 ml-auto">
                                    <Clock size={12} /> {format(new Date(n.createdAt), 'MMM d, h:mm a')} ({formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })})
                                 </span>
                              </div>

                              <div className="space-y-2">
                                 <h3 className={`text-xl font-black tracking-tight leading-none ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {n.title}
                                 </h3>
                                 <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl whitespace-pre-line">
                                    {n.message}
                                 </p>
                              </div>
                           </div>

                           <div className="flex flex-col gap-2">
                              {!n.isRead && (
                                 <button
                                    onClick={() => markAsRead(n.id)}
                                    className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 hover:scale-110 active:scale-95 transition-all"
                                    title="Mark as Read"
                                 >
                                    <CheckCircle size={20} />
                                 </button>
                              )}
                              <button
                                 onClick={() => deleteNotification(n.id)}
                                 className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
                                 title="Delete"
                              >
                                 <Trash2 size={20} />
                              </button>
                           </div>
                        </div>
                     </motion.div>
                  ))
               )}
            </AnimatePresence>
         </div>
      </div>
   );
};

export default VendorNotificationsPage;
