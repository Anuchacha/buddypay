import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * รวม class names เข้าด้วยกันและแก้ไขปัญหา class ที่ซ้ำซ้อนด้วย tailwind-merge
 * ใช้สำหรับรวม class names ที่มาจากหลายแหล่ง เช่น props, conditional classes, etc.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get production URL (for share links)
export const getAppUrl = (): string => {
  // ใน production ให้ใช้ environment variable
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // ใน development หรือ fallback ให้ใช้ window.location
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Server-side fallback
  return 'https://buddypay.vercel.app';
}; 