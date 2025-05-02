// ข้อมูลตัวอย่างบิล
export const mockBills = [
  {
    id: 'mock-bill-1',
    name: 'อาหารกลางวัน',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000), // เมื่อวานนี้
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // เมื่อวานนี้
    total: 850,
    totalAmount: 850,
    split: 4,
    categoryId: 'food',
    status: 'pending',
    items: [
      { name: 'ส้มตำไทย', price: 80, qty: 2 },
      { name: 'ข้าวเหนียว', price: 15, qty: 4 },
      { name: 'ตำแตง', price: 70, qty: 1 },
      { name: 'น้ำกระเจี๊ยบ', price: 25, qty: 4 },
      { name: 'ไก่ย่าง', price: 180, qty: 1 },
      { name: 'ปลาเผา', price: 220, qty: 1 },
    ],
    participants: [
      { id: 'p1', name: 'เอ', status: 'paid' },
      { id: 'p2', name: 'บี', status: 'pending' },
      { id: 'p3', name: 'ซี', status: 'pending' },
      { id: 'p4', name: 'ดี', status: 'paid' },
    ],
  },
  {
    id: 'mock-bill-2',
    name: 'ค่าที่พัก',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // สัปดาห์ที่แล้ว
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // สัปดาห์ที่แล้ว
    total: 3600,
    totalAmount: 3600,
    split: 3,
    categoryId: 'home',
    status: 'paid',
    items: [
      { name: 'ห้องพัก 2 คืน', price: 3000, qty: 1 },
      { name: 'ค่าจอดรถ', price: 200, qty: 2 },
      { name: 'มินิบาร์', price: 400, qty: 1 },
    ],
    participants: [
      { id: 'p1', name: 'เอ', status: 'paid' },
      { id: 'p2', name: 'บี', status: 'paid' },
      { id: 'p3', name: 'ซี', status: 'paid' },
    ],
  },
  {
    id: 'mock-bill-3',
    name: 'ค่าแท็กซี่',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 วันก่อน
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 วันก่อน
    total: 380,
    totalAmount: 380,
    split: 2,
    categoryId: 'transportation',
    status: 'pending',
    items: [
      { name: 'ค่าแท็กซี่ไปสนามบิน', price: 380, qty: 1 },
    ],
    participants: [
      { id: 'p1', name: 'เอ', status: 'paid' },
      { id: 'p2', name: 'บี', status: 'pending' },
    ],
  },
  // เพิ่มบิลประเภทอาหารใหม่
  {
    id: 'mock-bill-4',
    name: 'อาหารเย็น',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // เมื่อวานนี้
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // เมื่อวานนี้
    total: 1200,
    totalAmount: 1200,
    split: 3,
    categoryId: 'food',
    status: 'pending',
    items: [
      { name: 'พิซซ่า', price: 400, qty: 1 },
      { name: 'สปาเก็ตตี้', price: 300, qty: 2 },
      { name: 'น้ำอัดลม', price: 50, qty: 4 },
    ],
    participants: [
      { id: 'p1', name: 'เอ', status: 'pending' },
      { id: 'p2', name: 'บี', status: 'pending' },
      { id: 'p3', name: 'ซี', status: 'paid' },
    ],
  },
];
