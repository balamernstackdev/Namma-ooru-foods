'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
   Bell, Trash2, CheckCircle, Clock, Search, Filter,
   Package, ShoppingBag, CreditCard, Users, Settings,
   MoreVertical, ShieldAlert, CheckCheck
} from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface Notification {
   id: number;
   title: string;
   message: string;
   notificationType: string;
   priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
   isRead: boolean;
   createdAt: string;
   recipientType: string;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const TABS = [
   { id: 'ALL', label: 'All', icon: Bell },
   { id: 'UNREAD', label: 'Unread', icon: ShieldAlert },
   { id: 'ORDER_PLACED', label: 'Orders', icon: ShoppingBag },
   { id: 'PRODUCT_APPROVAL', label: 'Products', icon: Package },
   { id: 'PAYMENT', label: 'Transactions', icon: CreditCard },
   { id: 'VENDOR', label: 'Vendors', icon: Users },
   { id: 'SYSTEM', label: 'System', icon: Settings },
];

const NotificationsPage = () => {
   const { user } = useAuth();
   const [activeTab, setActiveTab] = useState('ALL');
   const [searchQuery, setSearchQuery] = useState('');
   const [isMarkingAll, setIsMarkingAll] = useState(false);

   const { data: rawData, mutate } = useSWR<any>(`${API_URL}/api/notifications`, fetcher, {
      refreshInterval: 30000 // Fallback poll every 30s
   });

   const notifications: Notification[] = Array.isArray(rawData)
      ? rawData
      : (rawData && Array.isArray(rawData.notifications) ? rawData.notifications : []);

   // Socket Integration
   useEffect(() => {
      const socket = io(API_URL.replace('/api', ''));

      socket.on('connect', () => {
         socket.emit('join', 'admin');
         if (user?.id) {
            socket.emit('join', `user_${user.id}`);
         }
      });

      socket.on('notification:new', (newNotif: Notification) => {
         mutate(); // Revalidation
         toast.success(newNotif.title, {
            icon: '🔔',
            style: {
               borderRadius: '20px',
               background: '#022c22',
               color: '#fff',
               fontSize: '12px',
               fontWeight: 'bold'
            }
         });
      });

      return () => {
         socket.disconnect();
      };
   }, [mutate, user?.id]);

   const filteredNotifications = useMemo(() => {
      return notifications.filter(n => {
         const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());

         if (!matchesSearch) return false;

         if (activeTab === 'ALL') return true;
         if (activeTab === 'UNREAD') return !n.isRead;
         if (activeTab === 'PAYMENT') return n.notificationType.includes('PAYMENT') || n.notificationType.includes('REFUND');
         if (activeTab === 'VENDOR') return n.notificationType.includes('VENDOR');
         if (activeTab === 'SYSTEM') return n.notificationType === 'INFO' || n.notificationType.includes('ADMIN');

         return n.notificationType === activeTab;
      });
   }, [notifications, activeTab, searchQuery]);

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
            body: JSON.stringify({ role: 'ADMIN' })
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

   const getPriorityColor = (priority: string) => {
      switch (priority) {
         case 'CRITICAL': return 'bg-red-500 text-white shadow-red-500/20';
         case 'HIGH': return 'bg-amber-500 text-white shadow-amber-500/20';
         case 'NORMAL': return 'bg-emerald-500 text-white shadow-emerald-500/20';
         default: return 'bg-slate-400 text-white shadow-slate-400/20';
      }
   };

   return (
      <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">

         {/* Header & Search */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Notification <span className="text-emerald-600">Management</span></h1>
               <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Enterprise-grade event monitoring & notifications</p>
            </div>

            <div className="flex items-center gap-3">
               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <input
                     type="text"
                     placeholder="Search alerts..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="h-12 w-64 pl-12 pr-4 rounded-2xl bg-white border border-slate-100 shadow-sm outline-none font-bold text-slate-700 text-sm focus:ring-2 ring-emerald-500/10 transition-all"
                  />
               </div>
               <button
                  onClick={markAllAsRead}
                  disabled={isMarkingAll || notifications.filter(n => !n.isRead).length === 0}
                  className="h-12 px-6 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
               >
                  <CheckCheck size={16} />
                  Clear Unread
               </button>
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-slate-100">
            {TABS.map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap
                     ${activeTab === tab.id
                        ? 'bg-[#022c22] text-white shadow-xl shadow-slate-900/20 scale-105'
                        : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'
                     }
                  `}
               >
                  <tab.icon size={14} />
                  {tab.label}
                  {tab.id === 'UNREAD' && notifications.filter(n => !n.isRead).length > 0 && (
                     <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[8px]">{notifications.filter(n => !n.isRead).length}</span>
                  )}
               </button>
            ))}
         </div>

         <div className="w-full">
            {/* Notification List */}
            <div className="w-full space-y-4">
               <AnimatePresence mode="popLayout">
                  {filteredNotifications.length === 0 ? (
                     <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="py-32 text-center bg-white rounded-[3rem] border border-slate-100"
                     >
                        <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-slate-200 mb-8">
                           <Bell size={48} strokeWidth={1} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 uppercase italic">Zero Frequency</h3>
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
                           className={`group relative bg-white p-8 rounded-[2.5rem] border transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 
                              ${!n.isRead ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-50'}
                           `}
                        >
                           <div className="flex items-start justify-between gap-6">
                              <div className="flex-1 space-y-4">
                                 <div className="flex items-center gap-3">
                                    <div className={`h-2.5 w-2.5 rounded-full shadow-lg ${getPriorityColor(n.priority)}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{n.notificationType}</span>
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 ml-auto">
                                       <Clock size={12} /> {format(new Date(n.createdAt), 'MMM d, h:mm a')} ({formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })})
                                    </span>
                                 </div>

                                 <div className="space-y-2">
                                    <h3 className={`text-xl font-black tracking-tight leading-none ${!n.isRead ? 'text-slate-900' : 'text-slate-500'}`}>
                                       {n.title}
                                    </h3>
                                    <p className="text-slate-600 font-medium leading-relaxed max-w-2xl whitespace-pre-line">
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
                                    className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:shadow-lg transition-all opacity-0 group-hover:opacity-100"
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
      </div>
   );
};

export default NotificationsPage;
