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
   const [currentPage, setCurrentPage] = useState(1);
   const ITEMS_PER_PAGE = 5;

   // Reset page to 1 when filters or search query changes
   React.useEffect(() => {
      setCurrentPage(1);
   }, [activeTab, searchQuery]);

   const { data: rawData, mutate } = useSWR<any>(
      user?.id ? `${API_URL}/api/notifications?recipientType=VENDOR&recipientId=${user.id}&vendorId=${user.brandId || ''}&limit=100` : null, 
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

   const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE) || 1;
   const paginatedNotifications = useMemo(() => {
      return filteredNotifications.slice(
         (currentPage - 1) * ITEMS_PER_PAGE,
         currentPage * ITEMS_PER_PAGE
      );
   }, [filteredNotifications, currentPage]);

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
      <div className="space-y-8 animate-in fade-in duration-700 pb-16">
         {/* Actions & Filters */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] group-focus-within:text-[#0F7A4D] transition-colors" />
               <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full pl-12 pr-4 rounded-[14px] bg-white border border-[#E5E7EB] shadow-sm outline-none font-bold text-[#111827] text-sm focus:border-[#0F7A4D] focus:ring-2 focus:ring-[#0F7A4D]/10 transition-all"
               />
            </div>
            <button
               onClick={markAllAsRead}
               disabled={isMarkingAll || notificationsList.filter(n => !n.isRead).length === 0}
               className="h-12 px-6 rounded-[14px] bg-[#0F7A4D] hover:bg-[#0a5c3a] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#0F7A4D]/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
            >
               <CheckCheck size={16} />
               Clear Unread
            </button>
         </div>

         {/* Navigation Tabs */}
         <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-[#E5E7EB]">
            {TABS.map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-[14px] font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap
                     ${activeTab === tab.id
                        ? 'bg-[#0F7A4D] text-white shadow-lg shadow-[#0F7A4D]/20 scale-105'
                        : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAF7] hover:text-[#111827]'
                     }
                  `}
               >
                  <tab.icon size={14} />
                  {tab.label}
                  {tab.id === 'UNREAD' && notificationsList.filter(n => !n.isRead).length > 0 && (
                     <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#DC2626] text-white text-[8px]">{notificationsList.filter(n => !n.isRead).length}</span>
                  )}
               </button>
            ))}
         </div>

         {/* Notification List */}
         <div className="w-full space-y-4">
            <AnimatePresence mode="popLayout">
               {paginatedNotifications.length === 0 ? (
                  <motion.div
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                     className="py-32 text-center bg-white rounded-[20px] border border-[#E5E7EB]"
                  >
                     <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#F8FAF7] text-[#D1D5DB] mb-8">
                        <Bell size={48} strokeWidth={1} />
                     </div>
                     <h3 className="text-lg font-black text-[#111827] uppercase italic">Zero Frequency</h3>
                     <p className="text-[#6B7280] font-bold uppercase tracking-widest text-[9px] mt-2">No notifications found matching your filters</p>
                  </motion.div>
               ) : (
                  paginatedNotifications.map((n) => (
                     <motion.div
                        key={n.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`group relative bg-white p-6 sm:p-8 rounded-[20px] border transition-all duration-300 hover:shadow-lg
                           ${!n.isRead ? 'border-[#0F7A4D]/20 bg-[#F0FDF4]/30' : 'border-[#E5E7EB]'}
                        `}
                     >
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
                           <div className="flex-1 space-y-4">
                              <div className="flex items-center gap-3">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">{n.notificationType || n.type || 'Alert'}</span>
                                 <span className="text-[10px] font-bold text-[#9CA3AF] flex items-center gap-1.5 ml-auto">
                                    <Clock size={12} /> {format(new Date(n.createdAt), 'MMM d, h:mm a')} ({formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })})
                                 </span>
                              </div>

                              <div className="space-y-2">
                                 <h3 className={`text-xl font-black tracking-tight leading-none ${!n.isRead ? 'text-[#111827]' : 'text-[#6B7280]'}`}>
                                    {n.title}
                                 </h3>
                                 <p className="text-[#6B7280] font-medium leading-relaxed max-w-2xl whitespace-pre-line">
                                    {n.message}
                                 </p>
                              </div>
                           </div>

                           <div className="flex sm:flex-col gap-2 mt-2 sm:mt-0 self-end sm:self-start shrink-0">
                              {!n.isRead && (
                                 <button
                                    onClick={() => markAsRead(n.id)}
                                    className="h-12 w-12 rounded-[14px] bg-[#0F7A4D] text-white flex items-center justify-center shadow-lg shadow-[#0F7A4D]/20 hover:scale-110 active:scale-95 transition-all"
                                    title="Mark as Read"
                                 >
                                    <CheckCircle size={20} />
                                 </button>
                              )}
                              <button
                                 onClick={() => deleteNotification(n.id)}
                                 className="h-12 w-12 rounded-[14px] bg-[#F8FAF7] border border-[#E5E7EB] text-[#9CA3AF] flex items-center justify-center hover:bg-[#FEE2E2] hover:text-[#DC2626] hover:border-[#FECACA] hover:shadow-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
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

         {/* Pagination Controls */}
         {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-6 mt-6 px-2 animate-in fade-in duration-500">
               <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">
                  Page {currentPage} of {totalPages}
               </span>
               <div className="flex items-center gap-1.5">
                  <button
                     disabled={currentPage === 1}
                     onClick={() => { setCurrentPage(currentPage - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                     className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-[#F8FAF7] border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-50 disabled:pointer-events-none active:scale-95 flex items-center gap-1"
                  >
                     Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                     if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                        return (
                           <button
                              key={page}
                              onClick={() => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className={`h-9 w-9 rounded-xl text-xs font-black transition-all active:scale-95 flex items-center justify-center border ${currentPage === page
                                 ? 'bg-[#0F7A4D] border-[#0F7A4D] text-white shadow-md shadow-[#0F7A4D]/20'
                                 : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:bg-[#F8FAF7]'
                                 }`}
                           >
                              {page}
                           </button>
                        );
                     }
                     if (page === 2 || page === totalPages - 1) {
                        return <span key={page} className="text-[#D1D5DB] text-xs px-1 select-none font-bold">...</span>;
                     }
                     return null;
                  })}
                  <button
                     disabled={currentPage === totalPages}
                     onClick={() => { setCurrentPage(currentPage + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                     className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-[#F8FAF7] border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-50 disabled:pointer-events-none active:scale-95 flex items-center gap-1"
                  >
                     Next
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};

export default VendorNotificationsPage;
