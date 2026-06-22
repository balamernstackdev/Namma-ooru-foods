'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorDetailLoader({ id }: { id: string }) {
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/sellers/detail?slug=${id}`);
    } else {
      router.replace('/sellers');
    }
  }, [id, router]);

  return null;
}
