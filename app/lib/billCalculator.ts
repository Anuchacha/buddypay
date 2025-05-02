import { Bill, Participant } from './schema';

// ประเภทข้อมูลสำหรับผลลัพธ์การคำนวณ
export type SplitResult = {
  participant: Participant;
  amount: number;
  items: { name: string; amount: number }[];
};

/**
 * ฟังก์ชัน memoize สำหรับแคชผลลัพธ์ฟังก์ชันคำนวณที่ซับซ้อน
 */
function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: any[]) => {
    // สร้าง key จาก arguments
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    // จำกัดขนาดของแคช
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  }) as T;
}

/**
 * คำนวณส่วนแบ่งค่าอาหารตามวิธีการหารที่เลือก
 */
export function calculateSplit(bill: Bill): SplitResult[] {
  // ถ้าเลือกหารเท่ากันหมด
  if (bill.splitMethod === 'equal') {
    return calculateEqualSplit(bill);
  }
  
  // ถ้าเลือกหารตามรายการที่กิน
  return calculateItemizedSplit(bill);
}

/**
 * คำนวณส่วนแบ่งค่าอาหารแบบหารเท่ากันหมด
 */
function calculateEqualSplit(bill: Bill): SplitResult[] {
  const totalParticipants = bill.participants.length;
  
  if (totalParticipants === 0) {
    return [];
  }
  
  // คำนวณยอดรวมที่ต้องจ่าย (รวม VAT, ส่วนลด, ค่าบริการ)
  const subtotal = bill.foodItems.reduce((sum, item) => sum + item.price, 0);
  const vatAmount = subtotal * (bill.vat / 100);
  const serviceChargeAmount = subtotal * (bill.serviceCharge / 100);
  const finalTotal = subtotal + vatAmount + serviceChargeAmount - bill.discount;
  
  // หารเท่ากันทุกคน
  const amountPerPerson = finalTotal / totalParticipants;
  
  // สร้างผลลัพธ์สำหรับทุกคน
  return bill.participants.map(participant => ({
    participant,
    amount: parseFloat(amountPerPerson.toFixed(2)),
    items: [
      { name: 'ค่าอาหาร', amount: parseFloat((subtotal / totalParticipants).toFixed(2)) },
      { name: 'VAT', amount: parseFloat((vatAmount / totalParticipants).toFixed(2)) },
      { name: 'ค่าบริการ', amount: parseFloat((serviceChargeAmount / totalParticipants).toFixed(2)) },
      { name: 'ส่วนลด', amount: parseFloat((bill.discount / totalParticipants).toFixed(2)) },
      { name: 'ยอดรวมที่ต้องจ่าย', amount: parseFloat(amountPerPerson.toFixed(2)) }
    ]
  }));
}

/**
 * คำนวณส่วนแบ่งค่าอาหารแบบหารตามรายการที่กิน (ปรับปรุงประสิทธิภาพแล้ว)
 */
function calculateItemizedSplit(bill: Bill): SplitResult[] {
  // สร้าง Map ของผู้เข้าร่วมเพื่อการเข้าถึงที่รวดเร็ว O(1)
  const participantCosts: Map<string, number> = new Map();
  const participantItems: Map<string, { name: string; amount: number }[]> = new Map();
  
  // สร้าง Map สำหรับทุกคนก่อน - ความซับซ้อน O(n) เมื่อ n คือจำนวนผู้เข้าร่วม
  bill.participants.forEach(p => {
    participantCosts.set(p.id, 0);
    participantItems.set(p.id, []);
  });
  
  // คำนวณค่าใช้จ่ายส่วนกลาง (VAT, ส่วนลด, ค่าบริการ)
  const subtotal = bill.foodItems.reduce((sum, item) => sum + item.price, 0);
  const vatAmount = subtotal * (bill.vat / 100);
  const serviceChargeAmount = subtotal * (bill.serviceCharge / 100);
  const additionalCosts = vatAmount + serviceChargeAmount - bill.discount;
  const additionalCostsPerPerson = additionalCosts / bill.participants.length;
  
  // คำนวณส่วนแบ่งค่าอาหารแต่ละรายการ - ความซับซ้อน O(m + p) เมื่อ m คือจำนวนรายการอาหาร
  // และ p คือผลรวมของจำนวนผู้กินในทุกรายการ
  bill.foodItems.forEach(item => {
    const participantCount = item.participants.length;
    if (participantCount === 0) return;
    
    const pricePerPerson = item.price / participantCount;
    
    item.participants.forEach(pId => {
      // ใช้การกระจายค่าเพื่อประสิทธิภาพ
      const currentAmount = participantCosts.get(pId) || 0;
      participantCosts.set(pId, currentAmount + pricePerPerson);
      
      const items = participantItems.get(pId) || [];
      items.push({
        name: item.name,
        amount: parseFloat(pricePerPerson.toFixed(2))
      });
      participantItems.set(pId, items);
    });
  });
  
  // เพิ่มค่าใช้จ่ายส่วนกลาง - ความซับซ้อน O(n)
  bill.participants.forEach(p => {
    const currentAmount = participantCosts.get(p.id) || 0;
    participantCosts.set(p.id, currentAmount + additionalCostsPerPerson);
    
    const items = participantItems.get(p.id) || [];
    items.push({
      name: 'ค่าใช้จ่ายเพิ่มเติม (VAT, ส่วนลด, ค่าบริการ)',
      amount: parseFloat(additionalCostsPerPerson.toFixed(2))
    });
  });
  
  // สร้าง SplitResult - ความซับซ้อน O(n)
  return bill.participants.map(p => ({
    participant: p,
    amount: parseFloat((participantCosts.get(p.id) || 0).toFixed(2)),
    items: participantItems.get(p.id) || []
  }));
}

// เพิ่มเวอร์ชัน memoized ของฟังก์ชันคำนวณ
export const calculateSplitMemoized = memoize(calculateSplit);
export const calculateEqualSplitMemoized = memoize(calculateEqualSplit);
export const calculateItemizedSplitMemoized = memoize(calculateItemizedSplit);

/**
 * คำนวณค่าใช้จ่ายทั้งหมด (รวม VAT, ส่วนลด, ค่าบริการ)
 */
function calculateFinalTotal(bill: Bill): number {
  const subtotal = bill.foodItems.reduce((sum, item) => sum + item.price, 0);
  
  // เพิ่ม VAT (ถ้ามี)
  const vatAmount = subtotal * (bill.vat / 100);
  
  // หัก ส่วนลด (ถ้ามี)
  const discountAmount = bill.discount;
  
  // เพิ่ม ค่าบริการ (ถ้ามี)
  const serviceChargeAmount = subtotal * (bill.serviceCharge / 100);
  
  return subtotal + vatAmount - discountAmount + serviceChargeAmount;
}

/**
 * คำนวณค่าใช้จ่ายเพิ่มเติม (VAT, ส่วนลด, ค่าบริการ)
 */
function calculateAdditionalCosts(bill: Bill): number {
  const subtotal = bill.foodItems.reduce((sum, item) => sum + item.price, 0);
  
  // เพิ่ม VAT (ถ้ามี)
  const vatAmount = subtotal * (bill.vat / 100);
  
  // หัก ส่วนลด (ถ้ามี)
  const discountAmount = bill.discount;
  
  // เพิ่ม ค่าบริการ (ถ้ามี)
  const serviceChargeAmount = subtotal * (bill.serviceCharge / 100);
  
  return vatAmount - discountAmount + serviceChargeAmount;
}

// เพิ่มเวอร์ชัน memoized ของฟังก์ชันอื่นๆ
export const calculateFinalTotalMemoized = memoize(calculateFinalTotal);
export const calculateAdditionalCostsMemoized = memoize(calculateAdditionalCosts); 