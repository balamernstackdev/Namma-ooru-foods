'use client';

import React, { useEffect, useState } from 'react';
import BrandForm from '@/components/admin/BrandForm';
import { useParams } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function EditBrandPage() {
  const params = useParams();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`${API_URL}/api/admin-ops/brands/${params.id}`)
        .then(r => r.json())
        .then(data => {
          setInitialData(data);
          setLoading(false);
        });
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return <BrandForm mode="edit" initialData={initialData} />;
}
