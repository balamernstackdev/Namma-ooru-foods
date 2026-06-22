'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/sellers');
  }, [router]);

  return null;
}
