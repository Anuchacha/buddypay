'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPrompt from '../components/LoginPrompt';
import { mockBills } from '../lib/mockData';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/app/components/ui/Card';
import { Users, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CategoryIcon } from '@/CategorySelect';
import { getCategoryById } from '@/app/lib/categories';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  writeBatch,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { Button } from '@/app/components/ui/Button';
import localforage from 'localforage';

const BILLS_PER_PAGE = 9; // จำนวนบิลต่อหน้า

export const dynamic = 'force-dynamic';

export default function BillHistory() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  
  // State สำหรับ pagination
  const [page, setPage] = useState(1);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [bills, setBills] = useState<any[]>([]);
  const [isRealtime, setIsRealtime] = useState(false);
  
  // ฟังก์ชันสำหรับแคชข้อมูลบิล
  const cacheBills = async (bills: any[]) => {
    if (!user) return;
    try {
      await localforage.setItem(`bills_${user.uid}`, {
        timestamp: Date.now(),
        data: bills
      });
    } catch (error) {
      console.error('Error caching bills:', error);
    }
  };
  
  // ฟังก์ชันสำหรับดึงข้อมูลบิลจากแคช
  const getBillsFromCache = async () => {
    if (!user) return null;
    try {
      const cached = await localforage.getItem(`bills_${user.uid}`);
      // ใช้แคชที่มีอายุไม่เกิน 5 นาที
      if (cached && Date.now() - (cached as any).timestamp < 300000) {
        return (cached as any).data;
      }
      return null;
    } catch (error) {
      console.error('Error getting cached bills:', error);
      return null;
    }
  };

  // ฟังก์ชันดึงข้อมูลบิลจาก Firestore แบบ pagination
  const fetchBills = async (resetPagination = false) => {
    if (resetPagination) {
      setPage(1);
      setLastDoc(null);
    }
    
    try {
      setLoading(true);
      
      if (!isAuthenticated || !user) {
        // ถ้าไม่ได้ล็อกอินให้ใช้ข้อมูลตัวอย่าง
        // เตรียมข้อมูลตัวอย่างให้มีรูปแบบที่ถูกต้อง
        const preparedMockBills = mockBills.map(bill => ({
          ...bill,
          userId: 'mock-user-id', // เพิ่ม userId เพื่อให้สามารถใช้งานปุ่มชำระทั้งหมดได้
          createdAt: bill.createdAt instanceof Date ? bill.createdAt : new Date(), // ตรวจสอบความถูกต้องของวันที่
          date: bill.date instanceof Date ? bill.date : new Date() // ตรวจสอบความถูกต้องของวันที่
        }));
        
        setBills(preparedMockBills);
        setLoading(false);
        return preparedMockBills;
      }
      
      // ใช้ข้อมูลจากแคชก่อนถ้ามี (เฉพาะตอนโหลดครั้งแรก)
      if (resetPagination) {
        const cachedBills = await getBillsFromCache();
        if (cachedBills) {
          setBills(cachedBills);
          setLoading(false);
        }
      }
      
      // สร้าง query
      let billsQuery = query(
        collection(db, 'bills'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(BILLS_PER_PAGE)
      );
      
      // ถ้ามีเอกสารล่าสุด ให้ดึงข้อมูลถัดไป
      if (lastDoc && !resetPagination) {
        billsQuery = query(billsQuery, startAfter(lastDoc));
      }
      
      const querySnapshot = await getDocs(billsQuery);
      
      // บันทึกเอกสารล่าสุดสำหรับการทำ pagination
      if (querySnapshot.docs.length > 0) {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === BILLS_PER_PAGE);
      } else {
        setHasMore(false);
      }
      
      const fetchedBills = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // อัพเดต state
      if (resetPagination) {
        setBills(fetchedBills);
        cacheBills(fetchedBills); // บันทึกลงแคช
      } else {
        setBills(prev => [...prev, ...fetchedBills]);
        cacheBills([...bills, ...fetchedBills]); // บันทึกลงแคชรวมกับข้อมูลเดิม
      }
      
      return fetchedBills;
    } catch (error) {
      console.error('Error fetching bills:', error);
      
      // ถ้าเกิดข้อผิดพลาดและเป็นการโหลดครั้งแรก ให้ใช้ข้อมูลตัวอย่าง
      if (resetPagination && bills.length === 0) {
        // เตรียมข้อมูลตัวอย่างให้มีรูปแบบที่ถูกต้อง
        const preparedMockBills = mockBills.map(bill => ({
          ...bill,
          userId: 'mock-user-id', // เพิ่ม userId เพื่อให้สามารถใช้งานปุ่มชำระทั้งหมดได้
          createdAt: bill.createdAt instanceof Date ? bill.createdAt : new Date(), // ตรวจสอบความถูกต้องของวันที่
          date: bill.date instanceof Date ? bill.date : new Date() // ตรวจสอบความถูกต้องของวันที่
        }));
        setBills(preparedMockBills);
      }
      
      if (bills.length > 0) {
        return bills;
      } else {
        // เตรียมข้อมูลตัวอย่างให้มีรูปแบบที่ถูกต้อง
        const preparedMockBills = mockBills.map(bill => ({
          ...bill,
          userId: 'mock-user-id', // เพิ่ม userId เพื่อให้สามารถใช้งานปุ่มชำระทั้งหมดได้
          createdAt: bill.createdAt instanceof Date ? bill.createdAt : new Date(), // ตรวจสอบความถูกต้องของวันที่
          date: bill.date instanceof Date ? bill.date : new Date() // ตรวจสอบความถูกต้องของวันที่
        }));
        return preparedMockBills;
      }
    } finally {
      setLoading(false);
    }
  };
  
  // สร้าง mutation สำหรับอัพเดตสถานะการชำระเงิน
  const updatePaymentMutation = useMutation({
    mutationFn: async ({ billId, participantId, newStatus }: { billId: string, participantId: string, newStatus: 'paid' | 'pending' }) => {
      if (!isAuthenticated) {
        throw new Error("กรุณาเข้าสู่ระบบเพื่อดำเนินการ");
      }
      
      // หาบิลที่ต้องการอัพเดต
      const billToUpdate = bills.find(bill => bill.id === billId);
      if (!billToUpdate) {
        throw new Error("ไม่พบบิลที่ต้องการอัพเดต");
      }
      
      // หาสถานะปัจจุบันของผู้เข้าร่วม
      const participant = billToUpdate.participants.find((p: any) => p.id === participantId);
      if (!participant) {
        throw new Error("ไม่พบผู้เข้าร่วมที่ต้องการอัพเดต");
      }
      
      // ตรวจสอบว่าสถานะเปลี่ยนแปลงจริงหรือไม่
      if (participant.status === newStatus) {
        console.log('Status is already', newStatus);
        return { billId, noChange: true };
      }
      
      // อัพเดตสถานะในฐานข้อมูล
      const billRef = doc(db, 'bills', billId);
      
      // สร้างข้อมูลผู้เข้าร่วมที่มีการอัพเดตสถานะ
      const updatedParticipants = billToUpdate.participants.map((p: any) => {
        if (p.id === participantId) {
          return { ...p, status: newStatus };
        }
        return p;
      });
      
      // ตรวจสอบว่าทุกคนชำระแล้วหรือไม่
      const allPaid = updatedParticipants.every((p: any) => p.status === 'paid');
      const billStatus = allPaid ? 'paid' : 'pending';
      
      // อัพเดตข้อมูลในฐานข้อมูล
      await updateDoc(billRef, {
        participants: updatedParticipants,
        status: billStatus
      });
      
      return { 
        billId, 
        updatedParticipants, 
        billStatus 
      };
    },
    onSuccess: (data: any) => {
      if (data.noChange) return;
      
      // อัพเดตข้อมูลใน state
      setBills(prevBills => prevBills.map(bill => {
        if (bill.id === data.billId) {
          return {
            ...bill,
            participants: data.updatedParticipants,
            status: data.billStatus
          };
        }
        return bill;
      }));
      
      // อัพเดตแคช
      cacheBills(bills);
    },
    onError: (error: Error) => {
      console.error('Error updating payment status:', error);
      alert('เกิดข้อผิดพลาดในการอัพเดตสถานะการชำระเงิน');
    }
  });
  
  // ฟังก์ชันสำหรับ batch update สำหรับอัพเดตสถานะทั้งบิล
  const updateAllParticipants = async (billId: string, newStatus: 'paid' | 'pending') => {
    if (!isAuthenticated) {
      alert("กรุณาเข้าสู่ระบบเพื่อดำเนินการ");
      return;
    }
    
    try {
      setIsSaving(true);
      
      const billToUpdate = bills.find(bill => bill.id === billId);
      if (!billToUpdate) {
        alert("ไม่พบบิลที่ต้องการอัพเดต");
        return;
      }
      
      // ตรวจสอบว่าบิลนี้มีสถานะที่ต้องการอัพเดตอยู่แล้วหรือไม่
      if (billToUpdate.status === newStatus) {
        console.log('Bill status is already', newStatus);
        return;
      }

      // อัพเดตสถานะของผู้เข้าร่วมทุกคน
      const updatedParticipants = billToUpdate.participants.map((p: any) => ({
        ...p,
        status: newStatus
      }));
      
      // ตรวจสอบว่าเป็นการใช้ข้อมูลจำลองหรือไม่
      if (billToUpdate.id.startsWith('mock-') || !user) {
        // กรณีใช้ข้อมูลจำลอง เพียงอัพเดต state โดยตรง
        setBills(prevBills => prevBills.map(bill => {
          if (bill.id === billId) {
            return {
              ...bill,
              participants: updatedParticipants,
              status: newStatus
            };
          }
          return bill;
        }));
      } else {
        // กรณีใช้ข้อมูลจริง อัพเดตลง Firebase
        // ใช้ batch สำหรับการอัพเดตหลายรายการพร้อมกัน
        const batch = writeBatch(db);
        const billRef = doc(db, 'bills', billId);
        
        // เพิ่มการอัพเดตเข้า batch
        batch.update(billRef, {
          participants: updatedParticipants,
          status: newStatus
        });
        
        // ทำการ commit batch
        await batch.commit();
        
        // อัพเดต state หลังจาก commit สำเร็จ
        setBills(prevBills => prevBills.map(bill => {
          if (bill.id === billId) {
            return {
              ...bill,
              participants: updatedParticipants,
              status: newStatus
            };
          }
          return bill;
        }));
        
        // อัพเดตแคช
        cacheBills(bills);
      }
    } catch (error) {
      console.error('Error updating all participants:', error);
      alert('เกิดข้อผิดพลาดในการอัพเดตสถานะการชำระเงิน');
    } finally {
      setIsSaving(false);
    }
  };
  
  // สร้าง debounced function สำหรับอัพเดตสถานะการชำระเงิน
  const debouncedUpdateStatus = useMemo(
    () => debounce(
      (billId: string, participantId: string, newStatus: 'paid' | 'pending') => {
        updatePaymentMutation.mutate({ billId, participantId, newStatus });
      }, 
      500 // 500ms delay
    ), 
    [updatePaymentMutation]
  );
  
  // ใช้ Snapshot Listener เมื่อต้องการฟังการเปลี่ยนแปลงแบบ real-time
  const setupRealtimeListener = () => {
    if (!isAuthenticated || !user) return undefined;
    
    setIsRealtime(true);
    
    const billsQuery = query(
      collection(db, 'bills'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(BILLS_PER_PAGE)
    );
    
    const unsubscribe = onSnapshot(billsQuery, (snapshot) => {
      const billsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setBills(billsData);
      cacheBills(billsData);
      setLoading(false);
    }, (error) => {
      console.error('Error in snapshot listener:', error);
      setLoading(false);
      setIsRealtime(false);
    });
    
    // คืนค่า unsubscribe function เพื่อให้ useEffect cleanup
    return unsubscribe;
  };
  
  // โหลดข้อมูลเมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    // ตัวแปรเก็บสถานะว่า component ยังทำงานอยู่หรือไม่
    let isMounted = true;
    
    // พยายามโหลดจากแคชก่อน
    const loadInitialData = async () => {
      if (!isMounted) return;
      
      const cachedBills = await getBillsFromCache();
      if (cachedBills && isMounted) {
        setBills(cachedBills);
        setLoading(false);
      }
      
      // โหลดข้อมูลใหม่เสมอ
      try {
        if (isMounted) {
          fetchBills(true);
        }
      } catch (error) {
        console.error('Error loading bills:', error);
      }
    };
    
    loadInitialData();
    
    // ตั้งค่า real-time listener
    let unsubscribe: (() => void) | undefined;
    
    if (isRealtime && isMounted) {
      unsubscribe = setupRealtimeListener();
    }
    
    // Cleanup
    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isAuthenticated, user, isRealtime]);
  
  // ฟังก์ชันโหลดข้อมูลเพิ่มเติม
  const loadMore = () => {
    if (loading || !hasMore) return;
    setPage(prev => prev + 1);
    fetchBills(false);
  };
  
  // ฟังก์ชันคำนวณสถานะบิล
  const calculateBillStatus = (bill: any) => {
    if (!bill.participants || bill.participants.length === 0) {
      return 'pending';
    }
    
    const allPaid = bill.participants.every((p: any) => p.status === 'paid');
    return allPaid ? 'paid' : 'pending';
  };
  
  // ฟังก์ชันแปลงวันที่
  const formatDate = (dateInput: string | Date | any) => {
    if (!dateInput) return 'ไม่ระบุวันที่';
    
    // ตรวจสอบว่าเป็น object ว่างหรือไม่
    if (typeof dateInput === 'object') {
      if (Object.keys(dateInput).length === 0) {
        return 'ไม่ระบุวันที่';
      }
      
      // ตรวจสอบว่าเป็น Firestore timestamp หรือไม่
      if (dateInput.seconds !== undefined && dateInput.nanoseconds !== undefined) {
        // แปลง Firestore timestamp เป็น Date object
        const date = new Date(dateInput.seconds * 1000);
        return new Intl.DateTimeFormat('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      }
      
      // ถ้าเป็น Date object
      if (dateInput instanceof Date) {
        if (isNaN(dateInput.getTime())) {
          console.error('Invalid Date object:', dateInput);
          return 'ไม่ระบุวันที่';
        }
        return new Intl.DateTimeFormat('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(dateInput);
      }
    }
    
    // ถ้าเป็น string
    if (typeof dateInput === 'string') {
      try {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) {
          console.error('Invalid date string:', dateInput);
          return 'ไม่ระบุวันที่';
        }
        return new Intl.DateTimeFormat('th-TH', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      } catch (error) {
        console.error('Error parsing date string:', error);
        return 'ไม่ระบุวันที่';
      }
    }
    
    // กรณีอื่นๆ ที่ไม่สามารถแปลงได้
    console.error('Unhandled date format:', dateInput, typeof dateInput);
    return 'ไม่ระบุวันที่';
  };
  
  // Toggle real-time updates


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">ประวัติบิล</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className={`text-xs ${loading ? 'bg-blue-200' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            onClick={() => {
              setLoading(true);
              fetchBills(true);
            }}
            disabled={loading}
          >
            {loading ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
          </Button>
        </div>
      </div>
      
      {!isAuthenticated && (
        <LoginPrompt message="คุณกำลังดูข้อมูลตัวอย่าง" />
      )}

      {loading && bills.length === 0 ? (
        <div className="flex justify-center my-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : bills.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bills.map((bill) => (
              <Card 
                key={bill.id} 
                className={`hover:shadow-md transition-shadow ${isAuthenticated ? 'cursor-pointer' : 'cursor-not-allowed opacity-90'}`}
                onClick={() => {
                  if (isAuthenticated) {
                    router.push(`/bill/${bill.id}`);
                  } else {
                    // แสดงข้อความหรือเปิด login modal
                    alert('กรุณาเข้าสู่ระบบเพื่อดูรายละเอียดบิล');
                  }
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex-1 truncate">{bill.name}</CardTitle>
                    {bill.categoryId && (
                      <CategoryIcon id={bill.categoryId} showName={true} size={20} />
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatDate(bill.createdAt)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users size={16} className="mr-1" />
                      <span>{bill.participants?.length || 0} คน</span>
                    </div>
                    <div className="font-medium text-base">
                      {bill.totalAmount?.toLocaleString() || 0} บาท
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-3">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm">สถานะ:</span>
                    {calculateBillStatus(bill) === 'paid' ? (
                      <span className="text-sm flex items-center text-green-600">
                        <CheckCircle2 size={16} className="mr-1" />
                        ชำระแล้ว
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm flex items-center text-amber-600">
                          <XCircle size={16} className="mr-1" />
                          รอชำระ
                        </span>
                        {isAuthenticated && bill.userId === user?.uid && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateAllParticipants(bill.id, 'paid');
                            }}
                          >
                            ชำระทั้งหมด
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {hasMore && (
            <div className="text-center mt-8">
              <Button 
                variant="outline" 
                className="mx-auto"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม'}
                {loading && <div className="ml-2 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">ไม่พบประวัติบิล</p>
        </div>
      )}

      {loading && <p className="text-center text-gray-500 font-semibold mt-2">กำลังโหลดข้อมูลใหม่...</p>}
    </div>
  );
} 