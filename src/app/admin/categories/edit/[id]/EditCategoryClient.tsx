'use client';

import React, { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import CategoryForm from '@/components/admin/CategoryForm';
import PremiumLoader from '@/components/ui/PremiumLoader';

export default function EditCategoryClient({ id }: { id: string }) {
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`${API_URL}/api/admin-ops/categories/${id}`)
        .then(r => r.json())
        .then(data => {
          setCategory(data);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <PremiumLoader fullScreen={true} />;
  }

  if (!category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-xl font-black text-slate-900 uppercase">Category Not Found</h2>
        <p className="text-slate-400 text-xs mt-2">The requested structural section does not exist.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <CategoryForm mode="edit" initialData={category} />
    </div>
  );
}
