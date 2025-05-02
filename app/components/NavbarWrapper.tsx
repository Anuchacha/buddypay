'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// ทำการ import Navbar แบบ dynamic ซึ่งจะโหลดแบบ lazy
const DynamicNavbar = dynamic(() => import('./Navbar'), {
  ssr: false, // ไม่ render ที่ server
  loading: () => <NavbarSkeleton />, // แสดง loading component ระหว่างรอ
});

// ตัว skeleton component สำหรับแสดงระหว่างรอโหลด Navbar
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

export default function NavbarWrapper() {
  return (
    <Suspense fallback={<NavbarSkeleton />}>
      <DynamicNavbar />
    </Suspense>
  );
} 