import { z } from 'zod';

// สคีม่าสำหรับผู้เข้าร่วม
export const participantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'ต้องระบุชื่อผู้ร่วมบิล'),
  status: z.enum(['paid', 'pending']).default('pending'), // สถานะการชำระเงิน
});

// สคีม่าสำหรับรายการอาหาร
export const foodItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'ต้องระบุชื่ออาหาร'),
  price: z.coerce.number().min(0, 'ราคาต้องไม่เป็นลบ'),
  participants: z.array(z.string()), // รายชื่อ ID ของผู้กินอาหารรายการนี้
});

// สคีม่าสำหรับบิลทั้งหมด
export const billSchema = z.object({
  name: z.string().min(1, 'ต้องระบุชื่อบิล'),
  categoryId: z.string().default('other'), // หมวดหมู่ของบิล (default เป็น "other")
  totalAmount: z.coerce.number().min(0, 'จำนวนเงินรวมต้องไม่เป็นลบ'),
  foodItems: z.array(foodItemSchema),
  participants: z.array(participantSchema),
  vat: z.coerce.number().min(0, 'VAT ต้องไม่เป็นลบ').default(0),
  discount: z.coerce.number().min(0, 'ส่วนลดต้องไม่เป็นลบ').default(0),
  serviceCharge: z.coerce.number().min(0, 'ค่าบริการต้องไม่เป็นลบ').default(0),
  splitMethod: z.enum(['equal', 'itemized']), // หารเท่ากันหมด หรือ หารตามรายการที่กิน
  description: z.string().optional(), // คำอธิบายเพิ่มเติมของบิล
  createdAt: z.date().default(() => new Date()),
  userId: z.string().optional(), // เก็บ UID ของผู้ใช้จาก Firebase Auth
  status: z.enum(['paid', 'pending']).default('pending'), // สถานะการชำระเงินของบิลทั้งใบ
});

// ประเภทข้อมูลจาก Zod schema
export type Participant = z.infer<typeof participantSchema>;
export type FoodItem = z.infer<typeof foodItemSchema>;
export type Bill = z.infer<typeof billSchema>; 