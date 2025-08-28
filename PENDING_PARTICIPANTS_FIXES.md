# การแก้ไขการหาผู้ค้างชำระ

## ไฟล์ที่แก้ไข

### 1. `app/hooks/useStatistics.ts`
- **แก้ไขฟังก์ชัน `calculatePendingParticipants`**:
  - เพิ่ม `Number()` เพื่อแปลง `splitResult.amount` เป็นตัวเลข
  - Export ฟังก์ชันเพื่อให้สามารถ import ได้
  - ปรับปรุง logic การตรวจสอบข้อมูล

### 2. `app/components/statistics/PendingParticipants.tsx`
- **เปลี่ยนจาก `renderSafeAmount` เป็น `formatCurrency`**:
  - ใช้ฟังก์ชัน `formatCurrency` จาก `utils/statistics` แทน
  - แสดงผลเป็นรูปแบบสกุลเงินไทย (บาท)
  - เพิ่ม import `formatCurrency`

### 3. `app/lib/testPendingParticipants.ts` (ไฟล์ใหม่)
- **สร้างไฟล์ทดสอบ**:
  - ทดสอบการทำงานของฟังก์ชันหาผู้ค้างชำระ
  - ใช้ข้อมูลตัวอย่างที่คุณให้มา
  - ตรวจสอบความถูกต้องของการคำนวณ

## การเปลี่ยนแปลงหลัก

### Flow การหาผู้ค้างชำระ
1. **รับข้อมูลบิล** → ตรวจสอบ `splitResults`
2. **กรอง participant ที่ status === "pending"**
3. **ดึงยอดเงินจาก splitResult** → `Number(result.amount)`
4. **รวมข้อมูลเป็นรายการ** → ชื่อ, จำนวนเงิน, สถานะ
5. **เรียงลำดับ** → จากมากไปน้อย

### การแสดงผล
- **ใช้ `formatCurrency`** แทน `renderSafeAmount`
- **แสดงผลเป็นบาท** เช่น "฿70.33" แทน "70.33"
- **รองรับหลายบิล** รวมยอดของคนเดียวกัน

## ผลลัพธ์ที่คาดหวัง

### ข้อมูลตัวอย่างที่คุณให้มา:
```typescript
[
  { name: "a", amount: 70.33, id: "...", status: "pending" },
  { name: "c", amount: 70.33, id: "...", status: "pending" },
  { name: "d", amount: 43.28, id: "...", status: "pending" },
  { name: "e", amount: 39.41, id: "...", status: "pending" },
  { name: "b", amount: 18.81, id: "...", status: "pending" }
]
```

### การแสดงผล:
- **ชื่อผู้ค้างชำระ**: a, c, d, e, b
- **จำนวนเงิน**: ฿70.33, ฿70.33, ฿43.28, ฿39.41, ฿18.81
- **ยอดรวม**: ฿242.16

## การทดสอบ

### เรียกใช้ฟังก์ชันทดสอบ:
```typescript
import { testPendingParticipantsLogic, testMultipleBills } from './lib/testPendingParticipants';

// ทดสอบบิลเดียว
testPendingParticipantsLogic();

// ทดสอบหลายบิล
testMultipleBills();
```

### ผลลัพธ์ที่คาดหวัง:
- ✅ กรองผู้ที่มี status === "pending" ได้ถูกต้อง
- ✅ คำนวณยอดเงินรวมได้ถูกต้อง
- ✅ เรียงลำดับจากมากไปน้อย
- ✅ รวมยอดของคนเดียวกันในหลายบิล

## หมายเหตุ

1. **Type Safety**: เพิ่ม `Number()` เพื่อป้องกันข้อมูลที่ไม่ใช่ตัวเลข
2. **Export Function**: Export `calculatePendingParticipants` เพื่อให้ใช้งานได้จากไฟล์อื่น
3. **Currency Format**: ใช้ `formatCurrency` เพื่อแสดงผลเป็นสกุลเงินไทย
4. **Error Handling**: ตรวจสอบข้อมูลก่อนประมวลผล 