'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

// ขยาย type definition ของ Session User
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    }
  }
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // ถ้ากำลังโหลดข้อมูล session ยังไม่ต้องทำอะไร
    if (status === 'loading') return;

    // ถ้าไม่มี session ให้ redirect ไปหน้า login
    if (!session) {
      router.push('/login');
      return;
    }

    // ถ้าต้องการสิทธิ์ admin แต่ผู้ใช้ไม่ใช่ admin
    if (adminOnly && session.user.role !== 'admin') {
      router.push('/unauthorized');
    }
  }, [status, session, router, adminOnly]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">กำลังโหลด...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  // ถ้าต้องการสิทธิ์ admin แต่ผู้ใช้ไม่ใช่ admin
  if (adminOnly && session?.user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
} 