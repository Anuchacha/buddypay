import { 
  getPendingParticipantsFromSplitResults, 
  calculateTotalPendingAmount, 
  formatPendingParticipantsText,
  formatCurrency 
} from '../utils/statistics';

// ตัวอย่างข้อมูลบิลที่คุณให้มา
const exampleBillData = {
  id: "bill-1",
  name: "คาเฟ่",
  splitResults: [
    {
      amount: 70.33,
      participant: {
        id: "c042fe9d-bbc7-4c45-bbc8-c3b064818796",
        name: "a",
        status: "pending"
      }
    },
    {
      amount: 18.81,
      participant: {
        id: "87556ddf-9850-4581-9497-6a42b6626f44",
        name: "b",
        status: "pending"
      }
    },
    {
      amount: 70.33,
      participant: {
        id: "58b7a63a-303d-45e6-b68f-ee7abc97b323",
        name: "c",
        status: "pending"
      }
    },
    {
      amount: 43.28,
      participant: {
        id: "4333ffd4-88f1-4780-b037-3901caa17284",
        name: "d",
        status: "pending"
      }
    },
    {
      amount: 39.41,
      participant: {
        id: "97e8f27e-92aa-454e-8ed4-2b14958bfbbb",
        name: "e",
        status: "pending"
      }
    }
  ]
};

/**
 * ตัวอย่างการใช้งานฟังก์ชันหาผู้ค้างชำระ
 * Flow ขั้นตอนการหา "ผู้ค้างชำระ" และ "เงินค้างชำระ":
 * 1. รับข้อมูลบิล (Bill) เข้ามา
 * 2. กรองบิลที่สถานะของผู้ร่วมจ่ายเป็น "pending"
 * 3. คัดเลือกเฉพาะ participant ที่ยังไม่ได้ชำระเงิน (status === "pending")
 * 4. หาเงินค้างชำระของผู้ร่วมจ่าย pending แต่ละคน
 * 5. หา splitResult ที่ตรงกับ participant ตาม id
 * 6. ดึงยอดเงิน (amount) ของคน ๆ นั้น
 * 7. รวมข้อมูลเป็นรายการผู้ค้างชำระ
 */
export const exampleUsage = () => {
  console.log("=== ตัวอย่างการหาผู้ค้างชำระตาม Flow ที่กำหนด ===");
  
  // ใช้ฟังก์ชัน getPendingParticipantsFromSplitResults
  const pendingList = getPendingParticipantsFromSplitResults(exampleBillData.splitResults);
  
  console.log("รายชื่อผู้ค้างชำระ:");
  pendingList.forEach((person, index) => {
    console.log(`${index + 1}. ${person.name} - ค้างชำระ ${formatCurrency(person.amount)} (สถานะ: ${person.status})`);
  });
  
  // คำนวณยอดรวม
  const totalPending = calculateTotalPendingAmount(exampleBillData.splitResults);
  console.log(`\nยอดรวมเงินค้างชำระ: ${formatCurrency(totalPending)}`);
  
  // สร้างข้อความแสดงผล
  const formattedText = formatPendingParticipantsText(exampleBillData.splitResults);
  console.log("\n=== ข้อความแสดงผล ===");
  console.log(formattedText);
  
  return {
    pendingParticipants: pendingList,
    totalPendingAmount: totalPending,
    formattedText: formattedText
  };
};

/**
 * ตัวอย่างการใช้งานกับข้อมูลหลายบิล
 */
export const exampleMultipleBills = () => {
  const bills = [
    {
      id: "bill-1",
      name: "คาเฟ่",
      splitResults: exampleBillData.splitResults
    },
    {
      id: "bill-2", 
      name: "ร้านอาหาร",
      splitResults: [
        {
          amount: 150.00,
          participant: {
            id: "c042fe9d-bbc7-4c45-bbc8-c3b064818796", // คนเดียวกันกับ bill-1
            name: "a",
            status: "pending"
          }
        },
        {
          amount: 75.00,
          participant: {
            id: "new-person-id",
            name: "f",
            status: "pending"
          }
        }
      ]
    }
  ];
  
  console.log("=== ตัวอย่างการหาผู้ค้างชำระจากหลายบิล ===");
  
  // รวมข้อมูลจากทุกบิล
  const allPendingParticipants = new Map();
  
  bills.forEach(bill => {
    const pendingList = getPendingParticipantsFromSplitResults(bill.splitResults);
    
    pendingList.forEach(person => {
      if (allPendingParticipants.has(person.id)) {
        // ถ้ามีคนนี้อยู่แล้ว ให้บวกยอด
        const existing = allPendingParticipants.get(person.id);
        existing.amount += person.amount;
        existing.billCount += 1;
      } else {
        // ถ้าเป็นคนใหม่ ให้เพิ่มเข้าไป
        allPendingParticipants.set(person.id, {
          name: person.name,
          amount: person.amount,
          id: person.id,
          status: person.status,
          billCount: 1
        });
      }
    });
  });
  
  // แปลงเป็น Array และเรียงลำดับ
  const aggregatedPending = Array.from(allPendingParticipants.values())
    .sort((a, b) => b.amount - a.amount);
  
  console.log("รายชื่อผู้ค้างชำระแบบรวมยอด:");
  aggregatedPending.forEach((person, index) => {
    console.log(`${index + 1}. ${person.name} - ค้างชำระรวม ${formatCurrency(person.amount)} (${person.billCount} บิล)`);
  });
  
  const totalAmount = aggregatedPending.reduce((sum, person) => sum + person.amount, 0);
  console.log(`\nยอดรวมทั้งหมด: ${formatCurrency(totalAmount)}`);
  
  return {
    aggregatedPending,
    totalAmount
  };
};

// เรียกใช้ตัวอย่าง
if (typeof window !== 'undefined') {
  // เรียกใช้เฉพาะใน browser
  console.log("=== เริ่มต้นตัวอย่างการใช้งาน ===");
  exampleUsage();
  exampleMultipleBills();
} 