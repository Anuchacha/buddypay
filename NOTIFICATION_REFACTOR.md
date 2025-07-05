# การปรับปรุงระบบแจ้งเตือนยอดค้างชำระ (Pending Bills Notification)

## การเปลี่ยนแปลงที่ทำ

### 1. เปลี่ยนจาก Polling เป็น Real-time
- **เดิม:** ใช้ `setInterval` ดึงข้อมูลทุก 30 วินาที
- **ใหม่:** ใช้ `onSnapshot` จาก Firestore สำหรับ real-time updates

### 2. ปรับปรุง Logic การดึงข้อมูล
- **เดิม:** ดึงทั้งบิลที่เป็นเจ้าของและผู้เข้าร่วม
- **ใหม่:** ดึงเฉพาะบิลที่ผู้ใช้เป็น `participant` และมี `status === "pending"`

### 3. เพิ่มประสิทธิภาพ
- เพิ่ม `limit(100)` เพื่อจำกัดจำนวนบิลที่ดึง
- ใช้ `orderBy('createdAt', 'desc')` เพื่อเรียงลำดับจากใหม่ไปเก่า
- กรองข้อมูลในฝั่ง client แทนการ query ซับซ้อน

## โค้ดที่เปลี่ยนแปลง

### Import ที่เพิ่ม
```typescript
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  onSnapshot, 
  QueryDocumentSnapshot, 
  DocumentData 
} from 'firebase/firestore';
```

### usePendingBills Hook ที่ปรับปรุง
```typescript
function usePendingBills() {
  const [pendingBills, setPendingBills] = useState<PendingBill[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const firebase = useSafeFirebase();

  useEffect(() => {
    if (!isAuthenticated || !user || !firebase.db) return;

    setLoading(true);

    // ใช้ onSnapshot สำหรับ real-time updates
    const billsQuery = query(
      collection(firebase.db, 'bills'),
      orderBy('createdAt', 'desc'),
      limit(100) // เพิ่ม limit เพื่อประสิทธิภาพ
    );

    const unsubscribe = onSnapshot(billsQuery, (snapshot) => {
      try {
        const bills: PendingBill[] = [];
        let count = 0;

        snapshot.docs.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          
          // ข้ามบิลที่ผู้ใช้เป็นเจ้าของ
          if (data.userId === user.uid) return;
          
          // ตรวจสอบว่าผู้ใช้เป็นผู้เข้าร่วมและยังไม่ชำระ
          const userParticipant = data.participants?.find((p: any) => 
            p.email === user.email && p.status === 'pending'
          );
          
          if (userParticipant) {
            bills.push({
              id: doc.id,
              title: data.title || data.name || 'ไม่มีชื่อบิล',
              totalAmount: data.totalAmount || 0,
              createdAt: data.createdAt?.toDate() || new Date(),
              participantName: userParticipant.name,
              amountOwed: userParticipant.amount || 0
            });
            count++;
          }
        });

        // เรียงลำดับตามวันที่สร้าง (ใหม่ไปเก่า)
        const sortedBills = bills.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        setPendingBills(sortedBills);
        setPendingCount(count);
        setLoading(false);
      } catch (error) {
        console.error('Error processing pending bills:', error);
        setLoading(false);
      }
    }, (error: Error) => {
      console.error('Error in pending bills snapshot:', error);
      setLoading(false);
    });

    // Cleanup function
    return () => unsubscribe();
  }, [isAuthenticated, user, firebase.db]);

  return { pendingBills, pendingCount, loading };
}
```

## ฟีเจอร์ที่ยังคงเหมือนเดิม

### 1. UI Components
- Badge แสดงจำนวนบิลที่ค้างชำระ
- Dropdown menu แสดงรายละเอียดบิล
- Loading state และ empty state
- การคลิกไปยัง `/bill/{id}`

### 2. การแสดงผล
- แสดงชื่อบิล, จำนวนเงินที่ค้างชำระ, วันที่สร้าง
- รองรับการแสดงผลทั้งภาษาไทยและภาษาอังกฤษ
- Responsive design สำหรับมือถือและเดสก์ท็อป

## ประโยชน์ที่ได้

### 1. Real-time Updates
- ข้อมูลจะอัปเดตทันทีเมื่อมีการเปลี่ยนแปลงใน Firestore
- ไม่ต้องรอ 30 วินาทีเพื่อดูข้อมูลใหม่

### 2. ประสิทธิภาพที่ดีขึ้น
- ลดการ query ที่ไม่จำเป็น
- ใช้ real-time listener แทน polling
- จำกัดจำนวนข้อมูลที่ดึง

### 3. ประสบการณ์ผู้ใช้ที่ดีขึ้น
- การแจ้งเตือนทันทีเมื่อมีบิลใหม่
- การหายไปของแจ้งเตือนทันทีเมื่อชำระเงินแล้ว

## การทดสอบ

### 1. Linter Check
```bash
npm run lint
# ✅ No ESLint warnings or errors
```

### 2. การทดสอบฟังก์ชัน
- [ ] ตรวจสอบว่าแสดงเฉพาะบิลที่ผู้ใช้เป็น participant
- [ ] ตรวจสอบว่าไม่แสดงบิลที่ผู้ใช้เป็นเจ้าของ
- [ ] ตรวจสอบว่า real-time updates ทำงาน
- [ ] ตรวจสอบว่า Badge แสดงจำนวนที่ถูกต้อง
- [ ] ตรวจสอบว่าการคลิกไปยัง `/bill/{id}` ทำงาน

## หมายเหตุ

- ระบบนี้ยังไม่มีการแจ้งเตือนแบบ push notification
- ข้อมูลแจ้งเตือนยังคงใช้จากคอลเลกชัน `bills` โดยตรง
- ไม่มีการสร้างคอลเลกชัน `notifications` แยกต่างหาก 