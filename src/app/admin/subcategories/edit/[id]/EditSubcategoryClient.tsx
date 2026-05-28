'use client';

import React, { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import SubcategoryForm from '@/components/admin/SubcategoryForm';
import PremiumLoader from '@/components/ui/PremiumLoader';

export default function EditSubcategoryClient({ id }: { id: string }) {
  const [subcategory, setSubcategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`${API_URL}/api/subcategories/${id}`)
        .then(r => r.json())
        .then(data => {
          setSubcategory(data);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <PremiumLoader fullScreen={true} />;
  }

  if (!subcategory || subcategory.error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-xl font-black text-slate-900 uppercase">Subcategory Not Found</h2>
        <p className="text-slate-400 text-xs mt-2">The requested mapping does not exist in the catalog.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <SubcategoryForm mode="edit" initialData={subcategory} />
    </div>
  );
}
