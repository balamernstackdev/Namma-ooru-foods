'use client';

import React, { useEffect, useState } from 'react';
import VariantForm from '@/components/admin/VariantForm';
import { useParams } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function EditVariantPage() {
  const params = useParams();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`${API_URL}/api/variants/${params.id}`)
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

  return <VariantForm mode="edit" initialData={initialData} />;
}
