'use client';

import React, { useEffect, useState } from 'react';
import BrandForm from '@/components/admin/BrandForm';
import { API_URL } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function EditBrandClient({ id }: { id: string }) {
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && id !== 'new') {
      fetch(`${API_URL}/api/admin-ops/brands/${id}`)
        .then(r => r.json())
        .then(data => {
          setInitialData(data);
          setLoading(false);
        });
    } else {
       setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return <BrandForm mode="edit" initialData={initialData} />;
}
