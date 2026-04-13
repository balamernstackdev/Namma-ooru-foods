import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
