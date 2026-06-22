'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VendorDetailLoader() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const slug = searchParams.get('slug') || searchParams.get('id');
    if (slug) {
      router.replace(`/sellers/detail?slug=${slug}`);
    } else {
      router.replace('/sellers');
    }
  }, [router, searchParams]);

  return null;
}
