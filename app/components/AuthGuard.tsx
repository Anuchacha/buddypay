'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

// หน้าที่ต้องบังคับให้ล็อกอิน (ถ้ามี)
const PROTECTED_ROUTES: string[] = [];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isProtectedRoute = PROTECTED_ROUTES.includes(pathname);

  useEffect(() => {
    // ถ้ากำลังโหลดข้อมูล ให้รอก่อน
    if (loading) return;

    // ถ้าเป็นหน้าที่บังคับให้ล็อกอิน และยังไม่ได้ล็อกอิน
    if (isProtectedRoute && !isAuthenticated) {
      // เก็บเส้นทางปัจจุบันเพื่อ redirect กลับมาหลังจากล็อกอิน
      sessionStorage.setItem('returnUrl', pathname);
      
      // เปิดหน้าล็อกอิน
      router.push('/');
    }
  }, [loading, isAuthenticated, isProtectedRoute, pathname, router]);

  // แสดง loading state เมื่อกำลังตรวจสอบการล็อกอิน
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ถ้าเป็นหน้าที่บังคับให้ล็อกอิน และยังไม่ได้ล็อกอิน ไม่แสดงเนื้อหา
  if (isProtectedRoute && !isAuthenticated) {
    return null;
  }

  // แสดงเนื้อหาตามปกติสำหรับทุกกรณี
  return <>{children}</>;
} 