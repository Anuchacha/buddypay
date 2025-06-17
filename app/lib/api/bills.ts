import { collection, addDoc, query, where, getDocs, orderBy, limit, startAfter, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { Bill } from '@/app/lib/schema';
import { cachingService } from '../cachingService';

/**
 * ประเภทข้อมูลบิลที่มี id
 */
export interface BillWithId extends Bill {
  id: string;
}

/**
 * BillsAPI - เป็นส่วนที่จัดการการเข้าถึงข้อมูลบิลทั้งหมด
 * แยกส่วนของ Data Layer ออกจากส่วนอื่นๆ ของแอปพลิเคชัน
 */
export const BillsAPI = {
  /**
   * ดึงบิลตาม ID
   * 
   * @param billId - ID ของบิลที่ต้องการดึง
   * @returns บิลที่มี ID ตามที่ระบุ หรือ null ถ้าไม่พบ
   */
  getBill: async (billId: string): Promise<BillWithId | null> => {
    try {
      // ลองดึงจากแคชก่อน
      const cachedBill = await cachingService.getItem<BillWithId>(`bill_${billId}`);
      if (cachedBill) {
        return cachedBill;
      }
      
      // ดึงข้อมูลจาก Firestore
      const billRef = doc(db, 'bills', billId);
      const billDoc = await getDoc(billRef);
      
      if (!billDoc.exists()) {
        return null;
      }
      
      const bill = { id: billDoc.id, ...billDoc.data() } as BillWithId;
      
      // บันทึกลงแคช
      await cachingService.setItem(`bill_${billId}`, bill);
      
      return bill;
    } catch (error) {
      console.error('Error fetching bill:', error);
      throw new Error('ไม่สามารถดึงข้อมูลบิลได้');
    }
  },
  
  /**
   * ดึงบิลทั้งหมดของผู้ใช้
   * 
   * @param userId - ID ของผู้ใช้
   * @param options - ตัวเลือกในการดึงข้อมูล
   * @returns ข้อมูลบิล, ตำแหน่งล่าสุด, และข้อมูลว่ายังมีบิลเหลืออยู่หรือไม่
   */
  getUserBills: async (
    userId: string, 
    options: { 
      page?: number; 
      perPage?: number; 
      lastVisible?: any;
      orderByField?: string;
      orderDirection?: 'asc' | 'desc';
    } = {}
  ) => {
    try {
      const {
        perPage = 10,
        lastVisible = null,
        orderByField = 'createdAt',
        orderDirection = 'desc'
      } = options;
      
      // ลองดึงจากแคชก่อนถ้าเป็นหน้าแรก
      if (!lastVisible) {
        const cachedBills = await cachingService.getItem<{bills: BillWithId[], lastVisible: any, hasMore: boolean}>(`user_bills_${userId}`);
        if (cachedBills) {
          return cachedBills;
        }
      }
      
      // สร้าง query
      let billsQuery;
      if (lastVisible) {
        billsQuery = query(
          collection(db, 'bills'),
          where('userId', '==', userId),
          orderBy(orderByField, orderDirection),
          startAfter(lastVisible),
          limit(perPage)
        );
      } else {
        billsQuery = query(
          collection(db, 'bills'),
          where('userId', '==', userId),
          orderBy(orderByField, orderDirection),
          limit(perPage)
        );
      }
      
      const snapshot = await getDocs(billsQuery);
      const newLastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
      const bills = snapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          userId: data.userId,
          title: data.title,
          description: data.description || '',
          totalAmount: data.totalAmount || 0,
          participants: data.participants || [],
          items: data.items || [],
          category: data.category || '',
          status: data.status || 'pending',
          paymentMethod: data.paymentMethod || '',
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || null,
          // เพิ่มฟิลด์อื่นๆตามที่จำเป็น
        } as unknown as BillWithId;
      }) as BillWithId[];
      
      const hasMore = bills.length === perPage;
      
      // บันทึกลงแคชเฉพาะหน้าแรก
      if (!lastVisible) {
        await cachingService.setItem(`user_bills_${userId}`, { bills, lastVisible: newLastVisible, hasMore });
      }
      
      return { bills, lastVisible: newLastVisible, hasMore };
    } catch (error) {
      console.error('Error fetching user bills:', error);
      throw new Error('ไม่สามารถดึงข้อมูลบิลได้');
    }
  },
  
  /**
   * สร้างบิลใหม่
   * 
   * @param bill - ข้อมูลบิลที่ต้องการสร้าง (ไม่รวม ID)
   * @returns ID ของบิลที่สร้าง
   */
  createBill: async (bill: Omit<Bill, 'id'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'bills'), {
        ...bill,
        createdAt: new Date()
      });
      
      // ล้างแคชของผู้ใช้
      if (bill.userId) {
        await cachingService.clearCache(`user_bills_${bill.userId}`);
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating bill:', error);
      throw new Error('ไม่สามารถสร้างบิลได้');
    }
  },
  
  /**
   * อัปเดตบิล
   * 
   * @param billId - ID ของบิลที่ต้องการอัปเดต
   * @param data - ข้อมูลที่ต้องการอัปเดต
   */
  updateBill: async (billId: string, data: Partial<Bill>): Promise<void> => {
    try {
      // ดึงบิลเดิมเพื่อตรวจสอบ userId
      const billRef = doc(db, 'bills', billId);
      const billDoc = await getDoc(billRef);
      
      if (!billDoc.exists()) {
        throw new Error('ไม่พบบิลที่ต้องการอัปเดต');
      }
      
      const billData = billDoc.data();
      
      // อัปเดตบิล
      await updateDoc(billRef, {
        ...data,
        updatedAt: new Date()
      });
      
      // ล้างแคช
      await cachingService.removeItem(`bill_${billId}`);
      if (billData.userId) {
        await cachingService.clearCache(`user_bills_${billData.userId}`);
      }
    } catch (error) {
      console.error('Error updating bill:', error);
      throw new Error('ไม่สามารถอัปเดตบิลได้');
    }
  },
  
  /**
   * อัปเดตสถานะการชำระเงินของบิล
   * 
   * @param billId - ID ของบิล
   * @param status - สถานะใหม่
   */
  updateBillStatus: async (billId: string, status: 'paid' | 'pending'): Promise<void> => {
    try {
      const billRef = doc(db, 'bills', billId);
      await updateDoc(billRef, { 
        status,
        updatedAt: new Date()
      });
      
      // ล้างแคช
      await cachingService.removeItem(`bill_${billId}`);
    } catch (error) {
      console.error('Error updating bill status:', error);
      throw new Error('ไม่สามารถอัปเดตสถานะบิลได้');
    }
  },
  
  /**
   * อัปเดตสถานะการชำระเงินของผู้เข้าร่วมในบิล
   * 
   * @param billId - ID ของบิล
   * @param participantId - ID ของผู้เข้าร่วม
   * @param status - สถานะใหม่
   */
  updateParticipantStatus: async (
    billId: string,
    participantId: string,
    status: 'paid' | 'pending'
  ): Promise<void> => {
    try {
      // ดึงบิลเดิม
      const billRef = doc(db, 'bills', billId);
      const billDoc = await getDoc(billRef);
      
      if (!billDoc.exists()) {
        throw new Error('ไม่พบบิลที่ต้องการอัปเดต');
      }
      
      const billData = billDoc.data();
      
      // อัปเดตสถานะของผู้เข้าร่วม
      const participants = billData.participants.map((p: any) => {
        if (p.id === participantId) {
          return { ...p, status };
        }
        return p;
      });
      
      // อัปเดตข้อมูลในฐานข้อมูล
      await updateDoc(billRef, { 
        participants,
        updatedAt: new Date()
      });
      
      // ล้างแคช
      await cachingService.removeItem(`bill_${billId}`);
      if (billData.userId) {
        await cachingService.clearCache(`user_bills_${billData.userId}`);
      }
    } catch (error) {
      console.error('Error updating participant status:', error);
      throw new Error('ไม่สามารถอัปเดตสถานะผู้เข้าร่วมได้');
    }
  },
  
  /**
   * ลบบิล
   * 
   * @param billId - ID ของบิลที่ต้องการลบ
   */
  deleteBill: async (billId: string): Promise<void> => {
    try {
      // ดึงบิลเดิมเพื่อตรวจสอบ userId
      const billRef = doc(db, 'bills', billId);
      const billDoc = await getDoc(billRef);
      
      if (!billDoc.exists()) {
        throw new Error('ไม่พบบิลที่ต้องการลบ');
      }
      
      const billData = billDoc.data();
      
      // ลบบิล
      await deleteDoc(billRef);
      
      // ล้างแคช
      await cachingService.removeItem(`bill_${billId}`);
      if (billData.userId) {
        await cachingService.clearCache(`user_bills_${billData.userId}`);
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
      throw new Error('ไม่สามารถลบบิลได้');
    }
  }
}; 