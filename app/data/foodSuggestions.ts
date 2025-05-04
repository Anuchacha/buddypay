// รายการอาหารแนะนำ
export type FoodSuggestion = {
  name: string;
  price: number;
  category: string;
};

// ข้อมูลอาหารแนะนำ
export const foodSuggestions: FoodSuggestion[] = [
  // อาหารจานเดียว
  { name: 'ข้าวผัดหมู', price: 60, category: 'อาหารจานเดียว' },
  { name: 'ข้าวผัดกระเพราหมู', price: 60, category: 'อาหารจานเดียว' },
  { name: 'ข้าวผัดกระเพราไก่', price: 60, category: 'อาหารจานเดียว' },
  { name: 'ข้าวผัดกระเพราทะเล', price: 80, category: 'อาหารจานเดียว' },
  { name: 'ข้าวไข่เจียว', price: 45, category: 'อาหารจานเดียว' },
  { name: 'ข้าวหมูทอดกระเทียม', price: 60, category: 'อาหารจานเดียว' },
  { name: 'ข้าวมันไก่', price: 60, category: 'อาหารจานเดียว' },
  { name: 'ข้าวหมูแดง', price: 60, category: 'อาหารจานเดียว' },
  { name: 'ผัดซีอิ๊ว', price: 60, category: 'อาหารจานเดียว' },
  { name: 'ผัดไทย', price: 60, category: 'อาหารจานเดียว' },
  
  // กับข้าว
  { name: 'ผัดผักบุ้ง', price: 80, category: 'กับข้าว' },
  { name: 'ผัดคะน้าหมูกรอบ', price: 90, category: 'กับข้าว' },
  { name: 'ไข่เจียวหมูสับ', price: 70, category: 'กับข้าว' },
  { name: 'ต้มยำกุ้ง', price: 120, category: 'กับข้าว' },
  { name: 'แกงจืดเต้าหู้', price: 80, category: 'กับข้าว' },
  { name: 'ปลาทอดน้ำปลา', price: 150, category: 'กับข้าว' },
  
  // เครื่องดื่ม
  { name: 'น้ำเปล่า', price: 20, category: 'เครื่องดื่ม' },
  { name: 'น้ำอัดลม', price: 25, category: 'เครื่องดื่ม' },
  { name: 'ชาเย็น', price: 35, category: 'เครื่องดื่ม' },
  { name: 'กาแฟเย็น', price: 40, category: 'เครื่องดื่ม' },
  { name: 'น้ำส้ม', price: 40, category: 'เครื่องดื่ม' },
  
  // ของหวาน
  { name: 'ข้าวเหนียวมะม่วง', price: 80, category: 'ของหวาน' },
  { name: 'ไอศกรีม', price: 40, category: 'ของหวาน' },
  { name: 'บัวลอย', price: 50, category: 'ของหวาน' },
];

// ฟังก์ชันสำหรับค้นหารายการอาหาร
export function findFoodSuggestions(
  searchTerm: string = '', 
  category: string | null = null
): FoodSuggestion[] {
  return foodSuggestions.filter(item => {
    const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !category || item.category === category;
    return matchesSearch && matchesCategory;
  });
}

// ฟังก์ชันสำหรับดึงหมวดหมู่ที่ไม่ซ้ำกัน
export function getUniqueCategories(): string[] {
  return Array.from(new Set(foodSuggestions.map(item => item.category)));
}

// ฟังก์ชันสำหรับจัดกลุ่มรายการอาหารตามหมวดหมู่
export function groupFoodSuggestionsByCategory(
  items: FoodSuggestion[]
): Record<string, FoodSuggestion[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FoodSuggestion[]>);
} 