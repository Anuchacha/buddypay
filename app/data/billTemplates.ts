import { LucideIcon, Utensils, Coffee, Pizza, Car, Droplet, Martini, Film, Book, Shirt, Train, Home, CreditCard, Award, Heart, Music, Send, Briefcase, Flame, MapPin } from 'lucide-react';

// กำหนด type สำหรับ template บิล
export type BillTemplate = {
  name: string;
  icon: LucideIcon;
  color: string;
  category: string;
}

// ข้อมูลเทมเพลตบิล
export const billTemplates: BillTemplate[] = [
  // อาหาร
  { name: 'อาหารกลางวัน', icon: Utensils, color: 'text-orange-500', category: 'อาหาร' },
  { name: 'อาหารเย็น', icon: Utensils, color: 'text-blue-500', category: 'อาหาร' },
  { name: 'ร้านอาหารญี่ปุ่น', icon: Utensils, color: 'text-red-500', category: 'อาหาร' },
  { name: 'คาเฟ่', icon: Coffee, color: 'text-amber-600', category: 'อาหาร' },
  { name: 'พิซซ่า', icon: Pizza, color: 'text-red-500', category: 'อาหาร' },
  { name: 'ข้าวมันไก่', icon: Utensils, color: 'text-yellow-500', category: 'อาหาร' },
  { name: 'ส้มตำ', icon: Utensils, color: 'text-green-500', category: 'อาหาร' },
  { name: 'ชาบู', icon: Flame, color: 'text-red-600', category: 'อาหาร' },
  
  // เดินทาง
  { name: 'ค่าเดินทาง', icon: Car, color: 'text-blue-600', category: 'เดินทาง' },
  { name: 'ค่าแท็กซี่', icon: Car, color: 'text-yellow-500', category: 'เดินทาง' },
  { name: 'ค่าน้ำมัน', icon: Droplet, color: 'text-blue-500', category: 'เดินทาง' },
  { name: 'ค่ารถไฟฟ้า', icon: Train, color: 'text-blue-600', category: 'เดินทาง' },
  { name: 'แชร์เดินทางต่างจังหวัด', icon: MapPin, color: 'text-red-500', category: 'เดินทาง' },
  
  // บันเทิง
  { name: 'หนัง', icon: Film, color: 'text-purple-500', category: 'บันเทิง' },
  { name: 'คอนเสิร์ต', icon: Music, color: 'text-pink-500', category: 'บันเทิง' },
  { name: 'เกม', icon: Film, color: 'text-indigo-500', category: 'บันเทิง' },
  { name: 'ปาร์ตี้', icon: Martini, color: 'text-pink-500', category: 'บันเทิง' },
  
  // ช้อปปิ้ง
  { name: 'ช้อปปิ้ง', icon: Heart, color: 'text-green-500', category: 'ช้อปปิ้ง' },
  { name: 'เสื้อผ้า', icon: Shirt, color: 'text-blue-400', category: 'ช้อปปิ้ง' },
  { name: 'ของขวัญ', icon: Heart, color: 'text-red-500', category: 'ช้อปปิ้ง' },
  { name: 'เครื่องสำอาง', icon: Award, color: 'text-pink-400', category: 'ช้อปปิ้ง' },
  
  // ที่พักอาศัย
  { name: 'ค่าน้ำ/ไฟ', icon: Droplet, color: 'text-cyan-500', category: 'ที่พักอาศัย' },
  { name: 'ค่าเช่า', icon: Home, color: 'text-blue-600', category: 'ที่พักอาศัย' },
  { name: 'ค่าอินเทอร์เน็ต', icon: Send, color: 'text-indigo-500', category: 'ที่พักอาศัย' },
  
  // อื่นๆ
  { name: 'ค่าเล่าเรียน', icon: Book, color: 'text-amber-600', category: 'อื่นๆ' },
  { name: 'ค่าใช้จ่ายประจำเดือน', icon: Briefcase, color: 'text-gray-600', category: 'อื่นๆ' },
  { name: 'ค่าประกัน', icon: CreditCard, color: 'text-green-600', category: 'อื่นๆ' },
];

// ฟังก์ชันสำหรับค้นหาเทมเพลตบิล
export function findBillTemplates(
  searchTerm: string = '', 
  category: string | null = null
): BillTemplate[] {
  return billTemplates.filter(item => {
    const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !category || item.category === category;
    return matchesSearch && matchesCategory;
  });
}

// ฟังก์ชันสำหรับดึงหมวดหมู่ที่ไม่ซ้ำกัน
export function getUniqueCategories(): string[] {
  return Array.from(new Set(billTemplates.map(item => item.category)));
}

// ฟังก์ชันสำหรับจัดกลุ่มเทมเพลตบิลตามหมวดหมู่
export function groupBillTemplatesByCategory(
  items: BillTemplate[]
): Record<string, BillTemplate[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, BillTemplate[]>);
} 