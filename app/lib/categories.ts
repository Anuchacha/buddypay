import { ShoppingBag, Coffee, Utensils, Bus, Home, Briefcase, Film, GraduationCap, Gift, ShoppingCart, HeartPulse, User2, Ticket, Beer, Gamepad2, Book, GanttChartSquare } from 'lucide-react';

// ประเภทสำหรับหมวดหมู่
export interface Category {
  id: string;
  name: string;
  icon: any; // Lucide icon component
  color: string;
}

// หมวดหมู่บิลค่าใช้จ่ายทั้งหมด
export const CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'อาหาร',
    icon: Utensils,
    color: 'text-orange-500',
  },
  {
    id: 'coffee',
    name: 'กาแฟและเครื่องดื่ม',
    icon: Coffee,
    color: 'text-amber-600',
  },
  {
    id: 'shopping',
    name: 'ช้อปปิ้ง',
    icon: ShoppingBag,
    color: 'text-pink-500',
  },
  {
    id: 'transportation',
    name: 'การเดินทาง',
    icon: Bus,
    color: 'text-blue-500',
  },
  {
    id: 'home',
    name: 'ที่พักและสาธารณูปโภค',
    icon: Home,
    color: 'text-slate-600',
  },
  {
    id: 'work',
    name: 'การทำงาน',
    icon: Briefcase,
    color: 'text-zinc-700',
  },
  {
    id: 'entertainment',
    name: 'บันเทิง',
    icon: Film,
    color: 'text-purple-600',
  },
  {
    id: 'education',
    name: 'การศึกษา',
    icon: GraduationCap,
    color: 'text-green-600',
  },
  {
    id: 'gift',
    name: 'ของขวัญและของฝาก',
    icon: Gift,
    color: 'text-red-500',
  },
  {
    id: 'groceries',
    name: 'ซื้อของใช้',
    icon: ShoppingCart,
    color: 'text-emerald-600',
  },
  {
    id: 'health',
    name: 'สุขภาพและการแพทย์',
    icon: HeartPulse,
    color: 'text-rose-500',
  },
  {
    id: 'personal',
    name: 'ส่วนตัว',
    icon: User2,
    color: 'text-indigo-500',
  },
  {
    id: 'ticket',
    name: 'ตั๋วและการจอง',
    icon: Ticket,
    color: 'text-yellow-500',
  },
  {
    id: 'party',
    name: 'ปาร์ตี้และสังสรรค์',
    icon: Beer,
    color: 'text-amber-500',
  },
  {
    id: 'game',
    name: 'เกมและความบันเทิง',
    icon: Gamepad2,
    color: 'text-violet-500',
  },
  {
    id: 'book',
    name: 'หนังสือและสื่อการเรียนรู้',
    icon: Book,
    color: 'text-cyan-600',
  },
  {
    id: 'other',
    name: 'อื่นๆ',
    icon: GanttChartSquare,
    color: 'text-gray-500',
  },
];

// สร้าง Map ของหมวดหมู่เพื่อลดการใช้ Array.find (ปรับปรุงจาก O(n) เป็น O(1))
const CATEGORY_MAP = new Map<string, Category>(
  CATEGORIES.map(category => [category.id, category])
);

// ฟังก์ชันหาหมวดหมู่จาก ID (ปรับปรุงประสิทธิภาพใช้ Map lookup แทน Array.find)
export function getCategoryById(id: string): Category | undefined {
  return CATEGORY_MAP.get(id);
}

// ฟังก์ชันหาหมวดหมู่ยอดนิยม
export function getPopularCategories(counts: Record<string, number>): Category[] {
  // เรียงลำดับตามจำนวนการใช้งาน และเลือก top 5
  const sortedIds = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);
  
  // ใช้ filter แบบ non-nullable
  return sortedIds
    .map(id => getCategoryById(id))
    .filter((category): category is Category => !!category);
} 