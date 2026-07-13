'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings,
  LogOut, Bell, List, Layers, Tag, Ticket, Star, Truck, Clock,
  RotateCcw, BookOpen, Image as ImageIcon, Mail, ClipboardList,
  ChevronDown, ChevronRight, Shield, ShieldCheck, Play, Megaphone,
  Menu
} from 'lucide-react';
import { useState } from 'react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { usePlatformSettings } from '@/context/PlatformSettingsContext';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const authFetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('namma_orru_token') : null;
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  }).then(res => res.json());
};

const navGroups = [
  {
    label: 'Dashboard',
    hideHeader: true,
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    ]
  },
  {
    label: 'Customers',
    items: [
      { label: 'Users', href: '/admin/users', icon: Users },
      { label: 'Reviews', href: '/admin/reviews', icon: Star },
    ]
  },
  {
    label: 'Sellers',
    items: [
      { label: 'Seller Registrations', href: '/admin/vendor-requests', icon: Shield, adminOnly: true },
      { label: 'Seller Hub', href: '/admin/hubs', icon: Layers, adminOnly: true },
      { label: 'Seller Payouts', href: '/admin/vendor-payouts', icon: ClipboardList, adminOnly: true },
    ]
  },
  {
    label: 'Products',
    items: [
      { label: 'Product Approvals', href: '/admin/products/approvals', icon: Shield, adminOnly: true },
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: List },
      { label: 'Subcategories', href: '/admin/subcategories', icon: Layers },
      { label: 'Variants', href: '/admin/variants', icon: Layers },
      // { label: 'Brands', href: '/admin/brands', icon: Tag },
    ]
  },
  {
    label: 'Orders',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Shipment Tracker', href: '/admin/tracking', icon: Truck },
      { label: 'Refund Requests', href: '/admin/refund-requests', icon: RotateCcw },
    ]
  },

  {
    label: 'Marketing',
    items: [
      { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
      // { label: 'Promotions', href: '/admin/promotions', icon: ClipboardList },
      { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
      { label: 'Announcement Bars', href: '/admin/marketing/announcement-bar', icon: Megaphone },
      { label: 'Popup Campaigns', href: '/admin/marketing/popup-campaigns', icon: Layers },
      { label: 'Email Subscribers', href: '/admin/marketing/subscribers', icon: Mail },
      // { label: 'Vendor Approvals', href: '/admin/marketing/vendor-approvals', icon: ShieldCheck },
    ]
  },
  {
    label: 'Content',
    items: [
      { label: 'Video Stories', href: '/admin/video-commerce', icon: Play },
      { label: 'Blog / Articles', href: '/admin/blog', icon: BookOpen },
    ]
  },
  {
    label: 'System',
    hideHeader: true,
    items: [
      { label: 'Global Settings', href: '/admin/settings', icon: Settings, adminOnly: true },
    ]
  },
];


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { settings } = usePlatformSettings();

  const { data: rawNotifs, mutate: mutateNotifs } = useSWR<any>(
    user?.id ? `${API_URL}/api/notifications?recipientType=ADMIN&limit=30` : null,
    authFetcher,
    { refreshInterval: 30000 }
  );
  const notifications = rawNotifs?.notifications || (Array.isArray(rawNotifs) ? rawNotifs : []);
  const unreadCount = rawNotifs?.unreadCount ?? notifications.filter((n: any) => !n.isRead).length;

  // Global Socket Listener
  React.useEffect(() => {
    if (!user?.id) return;

    const socket = io(API_URL.replace('/api', ''));

    socket.on('connect', () => {
      // Admins join 'admin' room, Vendors join their specific room
      if (user.role?.toLowerCase() === 'admin') {
        socket.emit('join', 'admin');
      } else {
        socket.emit('join', `vendor:${user.id}`);
      }
      socket.emit('join', `user_${user.id}`);
    });

    socket.on('notification:new', (newNotif: any) => {
      mutateNotifs(); // Update unread count and popover

      // Don't show toast if we are already on the notifications page (it has its own listener)
      if (pathname !== '/admin/notifications') {
        toast.success(newNotif.title, {
          icon: '🔔',
          duration: 5000,
          style: {
            borderRadius: '16px',
            background: '#FFFFFF',
            color: '#111827',
            fontSize: '12px',
            fontWeight: 'bold',
            padding: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, user?.role, mutateNotifs, pathname]);

  React.useEffect(() => {
    if (!isLoading) {
      const role = user?.role?.toLowerCase();
      if (!user || (role !== 'admin' && role !== 'vendor' && role !== 'seller')) {
        router.replace('/account');
      }
    }
  }, [user, isLoading, router]);

  React.useEffect(() => {
    document.body.style.overflow = 'auto';
    window.scrollTo(0, 0);

    // Auto-expand the group that contains the active route
    const activeGroup = navGroups.find(group =>
      group.items.some(item =>
        item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
      )
    );
    if (activeGroup) {
      setCollapsedGroups(prev => prev.filter(g => g !== activeGroup.label));
    }
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--admin-muted)]">
        <div className="h-12 w-12 border-4 border-slate-900/10 border-t-[var(--primary)] rounded-full animate-spin" />
        <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-900/40">Loading Dashboard...</span>
      </div>
    );
  }

  const userRole = user?.role?.toLowerCase();
  if (!user || (userRole !== 'admin' && userRole !== 'vendor' && userRole !== 'seller')) return null;

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  return (
    <div id="admin-root" className="min-h-screen bg-[#F8FAF7] flex font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Font Application */
        #admin-root,
        #admin-root button,
        #admin-root input,
        #admin-root select,
        #admin-root textarea,
        #admin-root table,
        #admin-root label,
        #admin-root span,
        #admin-root p,
        #admin-root h1,
        #admin-root h2,
        #admin-root h3,
        #admin-root h4,
        #admin-root h5,
        #admin-root h6 {
          font-family: var(--font-mulish), 'Mulish', sans-serif !important;
        }

        /* Typography Hierarchy */
        #admin-root h1 {
          font-size: 32px !important;
          font-weight: 800 !important;
        }
        #admin-root h2 {
          font-size: 20px !important;
          font-weight: 700 !important;
        }
        #admin-root h3 {
          font-size: 18px !important;
          font-weight: 700 !important;
        }
        #admin-root label {
          font-size: 12px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.08em !important;
        }
        #admin-root p {
          font-size: 14px !important;
          font-weight: 500 !important;
        }
        #admin-root td, #admin-root th {
          font-size: 14px !important;
          font-weight: 600 !important;
        }
        #admin-root button, #admin-root .btn-text {
          font-size: 14px !important;
          font-weight: 700 !important;
        }

        @media (min-width: 768px) {
          #admin-root h1 {
            font-size: 42px !important;
          }
          #admin-root h2 {
            font-size: 26px !important;
          }
          #admin-root h3 {
            font-size: 22px !important;
          }
        }

        @media (min-width: 1024px) {
          #admin-root h1 {
            font-size: 52px !important;
          }
          #admin-root h2 {
            font-size: 32px !important;
          }
          #admin-root h3 {
            font-size: 24px !important;
          }
        }

        /* Banner Cards overrides */
        #admin-root .admin-banner-card {
           box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
           transition: all 0.3s ease !important;
        }
        #admin-root .admin-banner-card:hover {
           box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important;
           transform: translateY(-4px) !important;
        }
        #admin-root .badge-live {
           background-color: #16A34A !important;
           color: #ffffff !important;
           border: none !important;
        }

        /* Premium Primary Action Button */
        .admin-primary-btn {
          background: linear-gradient(135deg, #16A34A, #059669) !important;
          color: white !important;
          height: 52px !important;
          padding: 0 24px !important;
          border-radius: 14px !important;
          font-weight: 700 !important;
          font-size: 15px !important;
          box-shadow: 0 12px 24px rgba(22,163,74,0.25) !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 12px !important;
          transition: all 0.3s ease !important;
          border: none !important;
          cursor: pointer !important;
          text-decoration: none !important;
        }
        .admin-primary-btn svg {
          color: white !important;
        }
        .admin-primary-btn:hover {
          transform: translateY(-2px) !important;
          background: linear-gradient(135deg, #22c55e, #10b981) !important;
          box-shadow: 0 16px 32px rgba(22,163,74,0.3) !important;
        }

        /* Global Spacing Enforcements (optional utility classes if needed, mostly handled by tailwind gap-8/p-6 but can enforce standard if components use these classes) */
        .admin-card-padding { padding: 24px !important; }
        .admin-section-gap { gap: 32px !important; }
        .admin-form-gap { gap: 20px !important; }
        .admin-input-height { height: 52px !important; }

        .admin-sidebar-nav::-webkit-scrollbar {
          width: 5px;
        }
        .admin-sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.05);
          border-radius: 20px;
        }
        .admin-sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }
      `}} />

      {/* ─── MOBILE OVERLAY ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ─── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside className={`
        w-72 bg-white text-slate-900 flex flex-col fixed top-0 left-0 bottom-0 z-50 border-r border-slate-200 transition-transform duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} data-lenis-prevent>

        {/* Brand Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 shrink-0 relative z-10">
          <Link href="/" className="flex items-center gap-4 transition-all hover:opacity-80 active:scale-95">
            <div className="h-16 w-16 flex items-center justify-center flex-shrink-0 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
              <img src={settings.logo || "/logo.webp"} alt="Logo" className="h-14 w-14 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-[17px] font-black tracking-tighter leading-none text-slate-900 uppercase italic">Namma Ooru Foods Pvt Ltd</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-400 mt-1.5">Admin Console</span>
            </div>
          </Link>
        </div>

        {/* Navigation - Enhanced Scroll Zone */}
        <div className="flex-1 relative min-h-0">
          <nav
            className="admin-sidebar-nav absolute inset-0 overflow-y-auto px-4 py-6 space-y-0.5"
          >
            {navGroups.map(group => {
              const isCollapsed = collapsedGroups.includes(group.label);
              const hideHeader = (group as any).hideHeader === true;
              return (
                <div key={group.label} className={hideHeader ? "mb-1" : "mb-4"}>
                  {/* Group Header */}
                  {!hideHeader && (
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className="w-full flex items-center justify-between px-4 py-2.5 mb-2 rounded-xl bg-slate-100/50 hover:bg-slate-100 border border-slate-200/60 transition-all group/header shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                    >
                      <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-700 group-hover/header:text-emerald-700 transition-colors">
                        {group.label}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-slate-400 group-hover/header:text-emerald-600 transition-transform duration-300 ${isCollapsed ? '-rotate-90' : ''}`} />
                    </button>
                  )}

                  {/* Group Items */}
                  <div className="flex flex-col gap-1 mt-1">
                    {(!isCollapsed || hideHeader) && group.items.map(item => {
                      // Skip if item is adminOnly and user is not admin
                      if ((item as any).adminOnly && userRole !== 'admin') return null;

                      const isActive = item.href === '/admin'
                        ? pathname === '/admin' || pathname === '/admin/'
                        : (pathname === item.href || pathname.startsWith(item.href + '/')) &&
                        !(item.href === '/admin/products' && pathname.startsWith('/admin/products/approvals'));

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`
                            flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 group
                            ${isActive
                              ? 'bg-emerald-600 text-white shadow-[0_10px_20px_-5px_rgba(5,150,105,0.3)] scale-[1.02]'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                            }
                          `}
                        >
                          <item.icon
                            className={`
                              h-[20px] w-[20px] shrink-0 transition-all duration-300
                              ${isActive ? 'text-white scale-110 drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)]' : 'text-slate-400 group-hover:text-emerald-600 group-hover:scale-110'}
                            `}
                            strokeWidth={isActive ? 2.5 : 1.5}
                          />
                          <span className={`text-[14px] font-semibold flex-1 tracking-tight ${isActive ? 'text-white' : 'text-inherit'}`}>
                            {item.label}
                          </span>

                          {/* Unread Notifications Badge */}
                          {item.label === 'Notifications' && unreadCount > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-white text-emerald-600' : 'bg-red-500 text-white'}`}>
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}

                          {isActive && (
                            <motion.div
                              layoutId="active-pill"
                              className="h-1.5 w-1.5 rounded-full bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                            />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Footer - Clean Container */}
        <div className="shrink-0 p-6 bg-slate-50/50 border-t border-slate-100">
          <div className="bg-white border border-slate-200 rounded-[22px] p-4 flex items-center gap-4 group/user hover:shadow-lg transition-all cursor-pointer">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 border border-emerald-400/20 flex items-center justify-center text-sm font-black shrink-0 overflow-hidden text-white shadow-sm">
              {(user.avatar && user.avatar.trim() !== '') ? <img src={user.avatar || undefined} className="w-full h-full object-cover" alt="avatar" /> : (user.name?.[0] || 'A')}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] font-bold tracking-tight leading-none text-slate-900 truncate">{user.name || 'Administrator'}</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600 mt-2">
                {userRole === 'admin' ? 'Super Admin' : 'Seller Access'}
              </span>
            </div>
            <button
              onClick={logout}
              className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500 hover:border-red-400 transition-all duration-300"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-72 min-w-0 relative flex flex-col min-h-screen overflow-y-auto overflow-x-hidden">

        {/* Admin Top Header */}
        <header className="flex lg:hidden h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 lg:hidden hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col min-w-0">
              {(() => {
                const activeItem = navGroups
                  .flatMap(g => g.items)
                  .find(i => pathname === i.href) ||
                  navGroups
                    .flatMap(g => g.items)
                    .find(i => i.href !== '/admin' && pathname.startsWith(i.href + '/'));
                const activeGroup = navGroups.find(g => g.items.some(i => i.href === activeItem?.href));
                const categoryLabel = activeGroup ? activeGroup.label : 'System';
                const itemLabel = activeItem ? activeItem.label : 'Overview';
                return (
                  <>
                    <h2 className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 truncate">{categoryLabel}</h2>
                    <span className="text-xs md:text-sm font-bold text-slate-900 tracking-tight truncate">{itemLabel}</span>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 relative shrink-0">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all relative ${showNotifications ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'}`}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <div className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
              )}
            </button>

            {/* Notifications Popover */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-3 w-96 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.12)] z-50 overflow-hidden"
                  >
                    <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Signal Intelligence</h3>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Activity Hub</span>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-600 text-[9px] font-black text-white uppercase tracking-tighter shadow-lg shadow-emerald-600/20">{unreadCount} Active</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="p-16 text-center">
                          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-200 mb-4">
                            <Bell size={32} strokeWidth={1} />
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zero Signals Detected</p>
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((n: any) => (
                          <Link
                            key={n.id}
                            href="/admin/notifications"
                            onClick={() => setShowNotifications(false)}
                            className="flex flex-col gap-3 p-6 hover:bg-slate-50/80 transition-all cursor-pointer group border-l-4 border-transparent hover:border-emerald-500"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className={`h-1.5 w-1.5 rounded-full ${!n.isRead ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{n.notificationType}</span>
                              <span className="text-[8px] font-bold text-slate-300 ml-auto flex items-center gap-1">
                                <Clock size={10} /> {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <h4 className={`text-[13px] font-black tracking-tight leading-tight ${!n.isRead ? 'text-slate-900' : 'text-slate-500'}`}>{n.title}</h4>
                              <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">{n.message}</p>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                    <Link
                      href="/admin/notifications"
                      onClick={() => setShowNotifications(false)}
                      className="block p-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:bg-emerald-50 transition-all border-t border-slate-50 italic"
                    >
                      Open Command Center →
                    </Link>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            <div className="h-10 w-px bg-slate-100 mx-2" />
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-[11px] font-bold text-slate-900 leading-none">{user.name || 'Admin'}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mt-1">Live</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                {user.name?.[0] || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-4 md:p-6 lg:p-8 max-w-full w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
