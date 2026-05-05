'use client';

import { useState, useEffect } from 'react';
import CouponForm from '@/components/admin/CouponForm';
import { API_URL } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function EditCouponPage({ params }: { params: { id: string } }) {
  const [coupon, setCoupon] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/coupons/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setCoupon(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return <CouponForm mode="edit" initialData={coupon} />;
}
