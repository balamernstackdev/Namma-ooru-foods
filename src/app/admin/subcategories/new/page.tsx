'use client';

import React from 'react';
import SubcategoryForm from '@/components/admin/SubcategoryForm';

export default function NewSubcategoryPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <SubcategoryForm mode="create" />
    </div>
  );
}
