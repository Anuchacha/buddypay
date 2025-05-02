'use client';

import { ReactNode, Suspense, lazy } from 'react';
// Lazy load NavbarWrapper เพื่อลดขนาด JavaScript ที่ต้องโหลดเริ่มต้น
const NavbarWrapper = lazy(() => import('./NavbarWrapper'));

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      {/* เพิ่ม Suspense เพื่อรองรับ lazy loading */}
      <Suspense fallback={
        <div className="h-16 bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
          <div className="container mx-auto h-full flex items-center px-4">
            <div className="w-10 h-10 rounded-full border-2 border-primary bg-white text-primary flex items-center justify-center font-bold">
              LB
            </div>
          </div>
        </div>
      }>
        <NavbarWrapper />
      </Suspense>
      <main className="pt-16">
        {children}
      </main>
    </>
  );
} 