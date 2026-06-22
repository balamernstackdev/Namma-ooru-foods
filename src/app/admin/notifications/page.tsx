'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
   Bell, Trash2, CheckCircle, Clock, Search, Filter,
   Package, ShoppingBag, CreditCard, Users, Settings,
   MoreVertical, ShieldAlert, CheckCheck, ChevronLeft, ChevronRight
} from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { formatDistanceToNow, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Notification {
   id: number;
   title: string;
   message: string;
   notificationType: string;
   priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
   isRead: boolean;
   createdAt: string;
   recipientType: string;
   orderId?: number | null;
   vendorId?: number | null;
   customerId?: number | null;
   productId?: number | null;
   paymentId?: number | null;
   metadata?: any;
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
   const [currentPage, setCurrentPage] = useState(1);
   const [itemsPerPage, setItemsPerPage] = useState(10);
   const router = useRouter();

   const { data: rawData, mutate } = useSWR<any>(`${API_URL}/api/notifications?recipientType=ADMIN&limit=1000`, fetcher, {
      refreshInterval: 30000 // Fallback poll every 30s
   });

   const notifications: Notification[] = Array.isArray(rawData)
      ? rawData
      : (rawData && Array.isArray(rawData.notifications) ? rawData.notifications : []);

   // Reset pagination on filter change
   useEffect(() => {
      setCurrentPage(1);
   }, [activeTab, searchQuery, itemsPerPage]);

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
               borderRadius: '12px',
               background: '#FFFFFF',
               color: '#111827',
               border: '1px solid #E5E7EB',
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

   const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

   const paginatedNotifications = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return filteredNotifications.slice(startIndex, startIndex + itemsPerPage);
   }, [filteredNotifications, currentPage, itemsPerPage]);

   const markAsRead = async (id: number) => {
      await fetch(`${API_URL}/api/notifications/${id}/read`, { method: 'PATCH' });
      mutate();
   };

   const handleNotificationClick = async (n: Notification) => {
      if (!n.isRead) {
         await fetch(`${API_URL}/api/notifications/${n.id}/read`, { method: 'PATCH' });
         mutate();
      }

      const referenceId = n.metadata?.referenceId || n.metadata?.entityId || n.orderId || n.vendorId || n.customerId || n.productId || n.paymentId || n.metadata?.orderId || n.metadata?.vendorId || n.metadata?.productId;
      let targetUrl = '/admin/notifications';

      if (referenceId) {
         const type = n.notificationType;
         if (type === 'ORDER_PLACED' || type === 'ORDER_UPDATED' || type === 'ORDER_CANCELLED' || type === 'PAYMENT_SUCCESS') {
            targetUrl = `/admin/orders/${referenceId}`;
         } else if (type === 'USER_REGISTERED') {
            targetUrl = `/admin/users/${referenceId}`;
         } else if (type === 'VENDOR_REGISTERED') {
            targetUrl = `/admin/vendors/${referenceId}`;
         } else if (type === 'PRODUCT_APPROVAL') {
            targetUrl = `/admin/products/${referenceId}`;
         } else if (n.metadata?.redirectUrl) {
            targetUrl = n.metadata.redirectUrl;
         }
      } else if (n.metadata?.redirectUrl) {
         targetUrl = n.metadata.redirectUrl;
      }

      router.push(targetUrl);
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
         case 'CRITICAL': return 'bg-red-500 text-white';
         case 'HIGH': return 'bg-amber-500 text-white';
         case 'NORMAL': return 'bg-[#0F7A4D] text-white';
         default: return 'bg-slate-400 text-white';
      }
   };

   return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-16">

         {/* Header & Search */}
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
               <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
                  <Bell className="text-emerald-600" />
                  Notification <span className="text-emerald-600">Management</span>
               </h1>
               <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                  Enterprise-grade event monitoring & notifications
               </p>
            </div>

            <div className="flex items-center gap-3">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                     type="text"
                     placeholder="Search alerts..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="h-12 w-64 pl-11 pr-4 rounded-xl bg-white border border-slate-200 outline-none font-bold text-xs text-slate-900 focus:border-emerald-600 transition-colors shadow-sm"
                  />
               </div>
               <button
                  onClick={markAllAsRead}
                  disabled={isMarkingAll || notifications.filter(n => !n.isRead).length === 0}
                  className="h-12 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50 shadow-xl shadow-emerald-500/20 active:scale-95 cursor-pointer"
               >
                  <CheckCheck size={14} />
                  Clear Unread
               </button>
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5E7EB] no-scrollbar">
            {TABS.map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all whitespace-nowrap
                     ${activeTab === tab.id
                        ? 'bg-[#0F7A4D] text-white shadow-sm'
                        : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAF7] hover:text-[#111827]'
                     }
                  `}
               >
                  <tab.icon size={13} />
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
                        className="py-24 text-center bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
                     >
                        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#F8FAF7] text-[#6B7280] mb-6">
                           <Bell size={36} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-black text-[#111827] uppercase">No Notifications</h3>
                        <p className="text-[#6B7280] font-bold uppercase tracking-widest text-[10px] mt-2">No notifications found matching your filters</p>
                     </motion.div>
                  ) : (
                     paginatedNotifications.map((n) => (
                        <motion.div
                           key={n.id}
                           layout
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, scale: 0.95 }}
                           onClick={() => handleNotificationClick(n)}
                           className={`group relative bg-white p-6 rounded-[20px] border transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] cursor-pointer hover:bg-slate-50
                              ${!n.isRead ? 'border-[#0F7A4D]/30 bg-[#0F7A4D]/5' : 'border-[#E5E7EB]'}
                           `}
                        >
                           <div className="flex items-start justify-between gap-6">
                              <div className="flex-1 space-y-3">
                                 <div className="flex items-center gap-3">
                                    <div className={`px-2 py-0.5 rounded text-[8px] font-black tracking-widest ${getPriorityColor(n.priority)}`}>
                                       {n.priority}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">{n.notificationType}</span>
                                    <span className="text-[10px] font-medium text-[#6B7280] flex items-center gap-1.5 ml-auto">
                                       <Clock size={12} /> {format(new Date(n.createdAt), 'MMM d, h:mm a')} ({formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })})
                                    </span>
                                 </div>

                                 <div className="space-y-1">
                                    <h3 className={`text-base font-bold tracking-tight ${!n.isRead ? 'text-[#111827]' : 'text-[#6B7280]'}`}>
                                       {n.title}
                                    </h3>
                                    <p className="text-[#6B7280] text-sm leading-relaxed max-w-3xl whitespace-pre-line">
                                       {n.message}
                                    </p>
                                 </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                 {!n.isRead && (
                                    <button
                                       onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                       className="h-10 w-10 rounded-xl bg-[#0F7A4D] hover:bg-[#0c633e] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
                                       title="Mark as Read"
                                    >
                                       <CheckCircle size={18} />
                                    </button>
                                 )}
                                 <button
                                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                    className="h-10 w-10 rounded-xl bg-[#F8FAF7] border border-[#E5E7EB] text-[#6B7280] flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete"
                                  >
                                    <Trash2 size={18} />
                                 </button>
                              </div>
                           </div>
                        </motion.div>
                     ))
                  )}
               </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {filteredNotifications.length > 0 && (
               <div className="mt-8 bg-white rounded-[20px] border border-[#E5E7EB] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm font-semibold text-[#6B7280]">
                     Showing <span className="text-[#111827] font-black">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredNotifications.length)}</span> to{' '}
                     <span className="text-[#111827] font-black">{Math.min(currentPage * itemsPerPage, filteredNotifications.length)}</span> of{' '}
                     <span className="text-[#111827] font-black">{filteredNotifications.length}</span> alerts
                  </div>

                  <div className="flex items-center gap-6">
                     {/* Items per page selector */}
                     <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">Show:</span>
                        <select
                           value={itemsPerPage}
                           onChange={(e) => setItemsPerPage(Number(e.target.value))}
                           className="h-9 px-3 rounded-xl bg-[#F8FAF7] border border-[#E5E7EB] outline-none font-bold text-xs text-[#111827] focus:border-[#0F7A4D] transition-colors cursor-pointer"
                        >
                           {[5, 10, 20, 50].map((size) => (
                              <option key={size} value={size}>
                                 {size} per page
                              </option>
                           ))}
                        </select>
                     </div>

                     {/* Page navigation */}
                     <div className="flex items-center gap-1.5">
                        {/* Previous Button */}
                        <button
                           onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                           disabled={currentPage === 1}
                           className="h-9 w-9 rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8FAF7] hover:text-[#111827] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#6B7280] flex items-center justify-center transition-all cursor-pointer"
                        >
                           <ChevronLeft size={16} />
                        </button>

                        {/* Page Numbers */}
                        {(() => {
                           const pages = [];
                           const maxVisiblePages = 5;
                           let startPage = Math.max(1, currentPage - 2);
                           let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                           if (endPage - startPage + 1 < maxVisiblePages) {
                              startPage = Math.max(1, endPage - maxVisiblePages + 1);
                           }

                           if (startPage > 1) {
                              pages.push(
                                 <button
                                    key={1}
                                    onClick={() => setCurrentPage(1)}
                                    className={`h-9 w-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer
                                       ${currentPage === 1
                                          ? 'bg-[#0F7A4D] text-white shadow-sm'
                                          : 'border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8FAF7] hover:text-[#111827]'
                                       }
                                    `}
                                 >
                                    1
                                 </button>
                              );
                              if (startPage > 2) {
                                 pages.push(<span key="dots-start" className="px-1 text-[#6B7280] text-xs font-bold">...</span>);
                              }
                           }

                           for (let p = startPage; p <= endPage; p++) {
                              pages.push(
                                 <button
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
                                    className={`h-9 w-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer
                                       ${currentPage === p
                                          ? 'bg-[#0F7A4D] text-white shadow-sm'
                                          : 'border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8FAF7] hover:text-[#111827]'
                                       }
                                    `}
                                 >
                                    {p}
                                 </button>
                              );
                           }

                           if (endPage < totalPages) {
                              if (endPage < totalPages - 1) {
                                 pages.push(<span key="dots-end" className="px-1 text-[#6B7280] text-xs font-bold">...</span>);
                              }
                              pages.push(
                                 <button
                                    key={totalPages}
                                    onClick={() => setCurrentPage(totalPages)}
                                    className={`h-9 w-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all cursor-pointer
                                       ${currentPage === totalPages
                                          ? 'bg-[#0F7A4D] text-white shadow-sm'
                                          : 'border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8FAF7] hover:text-[#111827]'
                                       }
                                    `}
                                 >
                                    {totalPages}
                                 </button>
                              );
                           }

                           return pages;
                        })()}

                        {/* Next Button */}
                        <button
                           onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                           disabled={currentPage === totalPages}
                           className="h-9 w-9 rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F8FAF7] hover:text-[#111827] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#6B7280] flex items-center justify-center transition-all cursor-pointer"
                        >
                           <ChevronRight size={16} />
                        </button>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default NotificationsPage;
