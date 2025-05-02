import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * รวม class names เข้าด้วยกันและแก้ไขปัญหา class ที่ซ้ำซ้อนด้วย tailwind-merge
 * ใช้สำหรับรวม class names ที่มาจากหลายแหล่ง เช่น props, conditional classes, etc.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 