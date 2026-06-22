'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorHubIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/hub/dashboard');
  }, [router]);

  return null;
}
