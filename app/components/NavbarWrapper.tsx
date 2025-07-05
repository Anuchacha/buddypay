'use client';

import { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Skeleton component สำหรับแสดงระหว่างที่ Navbar กำลังโหลด
function NavbarSkeleton() {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 animate-pulse">
      <div className="container mx-auto h-full flex items-center justify-between">
        <div className="h-6 w-32 bg-muted rounded"></div>
        <div className="h-8 w-40 bg-muted rounded"></div>
      </div>
    </header>
  );
}

// Dynamic import สำหรับ Navbar component
const Navbar = dynamic(() => import('./Navbar'), {
  loading: () => <NavbarSkeleton />,
  ssr: false
});

export default function NavbarWrapper() {
  useEffect(() => {
    // ทำงานเมื่อ component mount
  }, []);

  return (
    <Suspense fallback={<NavbarSkeleton />}>
      <Navbar />
    </Suspense>
  );
} 