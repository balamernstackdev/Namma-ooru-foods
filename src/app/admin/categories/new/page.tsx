'use client';

import React from 'react';
import CategoryForm from '@/components/admin/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <CategoryForm mode="create" />
    </div>
  );
}
