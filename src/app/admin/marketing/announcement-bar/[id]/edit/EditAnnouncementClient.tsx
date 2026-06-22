'use client';

import React, { useEffect, useState } from 'react';
import AnnouncementForm from '@/components/admin/AnnouncementForm';
import { API_URL } from '@/lib/api';

interface Props { id: string; }

export default function EditAnnouncementClient({ id }: Props) {
  const annId = parseInt(id);
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnn = async () => {
      try {
        const res = await fetch(`${API_URL}/api/offer-announcements/${annId}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setInitialData({
          title: data.title || '',
          message: data.message || '',
          couponCode: data.couponCode || '',
          buttonText: data.buttonText || '',
          redirectUrl: data.redirectUrl || '',
          offerType: data.offerType || 'Coupon Offer',
          bgColor: data.bgColor || '#0F7A4D',
          textColor: data.textColor || '#FFFFFF',
          startDate: data.startDate ? data.startDate.split('T')[0] : '',
          endDate: data.endDate ? data.endDate.split('T')[0] : '',
          isActive: data.isActive ?? true,
          priorityOrder: data.priorityOrder ?? 0,
          vendorId: data.vendorId ? String(data.vendorId) : '',
          categoryId: data.categoryId ? String(data.categoryId) : '',
          productId: data.productId ? String(data.productId) : '',
          publishHomepage: data.publishHomepage ?? false,
          announcementType: (data.announcementType === 'ADMIN' || data.announcementType === 'VENDOR' || !data.announcementType) ? 'TOP_ANNOUNCEMENT_BAR' : data.announcementType
        });
      } catch {
        setError('Failed to load announcement data.');
      } finally {
        setLoading(false);
      }
    };
    if (annId) fetchAnn();
  }, [annId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-[#0F7A4D] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !initialData) {
    return (
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-12 text-center">
        <p className="text-sm font-black text-red-500">{error || 'Announcement not found.'}</p>
      </div>
    );
  }

  return <AnnouncementForm mode="edit" announcementId={annId} initialData={initialData} />;
}
