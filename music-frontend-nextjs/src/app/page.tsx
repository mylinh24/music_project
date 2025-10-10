'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin dashboard on home page load
    router.push('/admin/dashboard');
  }, [router]);

  return null;
}
