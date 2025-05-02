import 'next-auth';
import { DefaultSession } from 'next-auth';

// ประกาศโมดูล 'next-auth' เพื่อขยาย interface ของ Session
declare module 'next-auth' {
  // ขยาย interface Session เพื่อรวมข้อมูลผู้ใช้
  interface Session {
    user: {
      // รหัสผู้ใช้ (อาจจะเป็น undefined)
      id?: string;
      // ชื่อผู้ใช้ (อาจจะเป็น null)
      name?: string | null;
      // อีเมลของผู้ใช้ (อาจจะเป็น null)
      email?: string | null;
      // รูปภาพของผู้ใช้ (อาจจะเป็น null)
      image?: string | null;
      role?: string;
    };
  }

  interface User {
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role?: string;
  }
} 