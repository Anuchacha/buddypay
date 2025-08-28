# การหาผู้ค้างชำระ (Pending Participants)

## Flow ขั้นตอนการหา "ผู้ค้างชำระ" และ "เงินค้างชำระ"

### 1. รับข้อมูลบิล (Bill) เข้ามา
แต่ละบิลมี:
- `participants`: รายชื่อผู้ร่วมจ่ายพร้อมสถานะการชำระเงิน (pending/settled)
- `splitResults`: ยอดเงินที่แต่ละคนต้องจ่าย

### 2. กรองบิลที่สถานะของผู้ร่วมจ่ายเป็น "pending"
### 3. คัดเลือกเฉพาะ participant ที่ยังไม่ได้ชำระเงิน (status === "pending")
### 4. หาเงินค้างชำระของผู้ร่วมจ่าย pending แต่ละคน
### 5. หา splitResult ที่ตรงกับ participant ตาม id
### 6. ดึงยอดเงิน (amount) ของคน ๆ นั้น
### 7. รวมข้อมูลเป็นรายการผู้ค้างชำระ

## ไฟล์ที่เกี่ยวข้อง

### 1. `app/hooks/useStatistics.ts`
- ฟังก์ชัน `calculatePendingParticipants()` - หาผู้ค้างชำระจากหลายบิล
- ใช้ในหน้า Statistics

### 2. `app/utils/statistics.ts`
- `getPendingParticipantsFromSplitResults()` - หาผู้ค้างชำระจากบิลเดียว
- `calculateTotalPendingAmount()` - คำนวณยอดรวมเงินค้างชำระ
- `formatPendingParticipantsText()` - สร้างข้อความแสดงผล

### 3. `app/components/PendingParticipantsDisplay.tsx`
- `PendingParticipantsDisplay` - Component แสดงผลแบบเรียบง่าย
- `PendingParticipantsTable` - Component แสดงผลแบบตาราง

### 4. `app/lib/pendingParticipantsExample.ts`
- ตัวอย่างการใช้งานฟังก์ชันต่างๆ

## ตัวอย่างการใช้งาน

### การใช้งานฟังก์ชันพื้นฐาน

```typescript
import { 
  getPendingParticipantsFromSplitResults, 
  calculateTotalPendingAmount,
  formatCurrency 
} from '../utils/statistics';

// ข้อมูลบิลตัวอย่าง
const billData = {
  splitResults: [
    {
      amount: 70.33,
      participant: {
        id: "person-1",
        name: "a",
        status: "pending"
      }
    },
    {
      amount: 18.81,
      participant: {
        id: "person-2", 
        name: "b",
        status: "pending"
      }
    }
  ]
};

// หาผู้ค้างชำระ
const pendingList = getPendingParticipantsFromSplitResults(billData.splitResults);

// แสดงผล
pendingList.forEach((person, index) => {
  console.log(`${index + 1}. ${person.name} - ค้างชำระ ${formatCurrency(person.amount)}`);
});

// คำนวณยอดรวม
const totalAmount = calculateTotalPendingAmount(billData.splitResults);
console.log(`ยอดรวม: ${formatCurrency(totalAmount)}`);
```

### การใช้งานใน React Component

```tsx
import { PendingParticipantsDisplay } from '../components/PendingParticipantsDisplay';

function BillDetail({ bill }) {
  return (
    <div>
      <h2>รายละเอียดบิล</h2>
      
      {/* แสดงผู้ค้างชำระ */}
      <PendingParticipantsDisplay 
        splitResults={bill.splitResults}
        title="ผู้ค้างชำระ"
        showTotal={true}
      />
    </div>
  );
}
```

## ผลลัพธ์ที่ได้

### ข้อมูลผู้ค้างชำระ
```typescript
[
  {
    name: "a",
    amount: 70.33,
    id: "person-1",
    status: "pending"
  },
  {
    name: "b", 
    amount: 18.81,
    id: "person-2",
    status: "pending"
  }
]
```

### การแสดงผล
- **ชื่อผู้ค้างชำระ**: ชื่อของคนที่ยังไม่ได้จ่าย
- **จำนวนเงินที่ค้างชำระ**: ยอดเงินที่ต้องจ่าย (แสดงเป็นบาท)
- **สถานะ**: "pending" (ยังไม่ได้ชำระ)

## หมายเหตุ

1. ฟังก์ชันจะกรองเฉพาะผู้ที่มี `status === "pending"` เท่านั้น
2. ผลลัพธ์จะเรียงลำดับตามยอดเงินจากมากไปน้อย
3. ถ้าไม่มีผู้ค้างชำระ จะแสดงข้อความ "ไม่มีผู้ค้างชำระ"
4. สำหรับหลายบิล ระบบจะรวมยอดของคนเดียวกันเข้าด้วยกัน 