'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Bill, Participant, FoodItem } from '../../lib/schema';
import { useParams, useRouter } from 'next/navigation';
import { FirebaseProvider, useFirebase } from '../../components/providers/FirebaseWrapper';
import { useAuthModal } from '../../context/AuthModalContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { CalendarIcon, ArrowLeft, DollarSign, Users, Tag, Clock, CheckCircle2, XCircle, Save } from 'lucide-react';
import { CategoryIcon } from '@/CategorySelect';

type BillWithId = Bill & { id: string };

// แยกเนื้อหาของหน้าออกมาเป็นคอมโพเนนต์ย่อย
function BillDetailContent() {
  const router = useRouter();
  const { id } = useParams();
  const { user, loading } = useFirebase();
  const { openLoginModal } = useAuthModal();
  const [bill, setBill] = useState<BillWithId | null>(null);
  const [originalBill, setOriginalBill] = useState<BillWithId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    // ตรวจสอบสถานะการล็อกอิน
    if (!loading) {
      if (!user) {
        openLoginModal();
      } else {
        fetchBillDetail();
      }
    }
  }, [id, user, loading]);

  const fetchBillDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setUnauthorized(false);
      
      if (!user) {
        setUnauthorized(true);
        return;
      }

      const docRef = doc(db, 'bills', id as string);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError('ไม่พบข้อมูลบิลที่ต้องการ');
        return;
      }

      const billData = docSnap.data();
      
      // ตรวจสอบว่าเป็นบิลของผู้ใช้หรือไม่
      if (billData.userId !== user.uid) {
        console.log('Unauthorized: Bill belongs to', billData.userId, 'but current user is', user.uid);
        setUnauthorized(true);
        return;
      }

      const billWithId: BillWithId = {
        id: docSnap.id,
        ...billData
      } as BillWithId;
      
      setBill(billWithId);
      setOriginalBill(JSON.parse(JSON.stringify(billWithId))); // เก็บสำเนาต้นฉบับไว้เปรียบเทียบการแก้ไข
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการโหลดข้อมูลบิล:', err);
      setError('ไม่สามารถโหลดข้อมูลบิลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันเพื่ออัปเดตรายการผู้เข้าร่วมในรายการอาหาร
  const handleParticipantToggle = (foodItemId: string, participantId: string) => {
    if (!bill) return;
    
    const updatedBill = {...bill};
    const foodItemIndex = updatedBill.foodItems.findIndex(item => item.id === foodItemId);
    
    if (foodItemIndex === -1) return;
    
    const foodItem = updatedBill.foodItems[foodItemIndex];
    
    // เช็คว่าผู้เข้าร่วมอยู่ในรายการหรือไม่
    const participantIndex = foodItem.participants.indexOf(participantId);
    
    if (participantIndex > -1) {
      // ถ้ามีแล้ว ให้ลบออก
      foodItem.participants.splice(participantIndex, 1);
    } else {
      // ถ้ายังไม่มี ให้เพิ่ม
      foodItem.participants.push(participantId);
    }
    
    updatedBill.foodItems[foodItemIndex] = foodItem;
    
    setBill(updatedBill);
    setIsEdited(true); // ตั้งค่าสถานะว่ามีการแก้ไข
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    
    // ตรวจสอบว่าเป็น object ว่างหรือไม่
    if (typeof date === 'object' && Object.keys(date).length === 0) {
      return 'ไม่ระบุวันที่';
    }
    
    // ตรวจสอบว่าเป็น Firestore timestamp หรือไม่
    if (typeof date === 'object' && date !== null && 'seconds' in date && 'nanoseconds' in date) {
      // แปลง Firestore timestamp เป็น Date object
      const timestamp = date as { seconds: number, nanoseconds: number };
      return new Date(timestamp.seconds * 1000).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      
      if (isNaN(dateObj.getTime())) {
        console.error('Invalid date value:', date);
        return 'วันที่ไม่ถูกต้อง';
      }
      
      return dateObj.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  // ฟังก์ชันสำหรับอัพเดตสถานะการชำระเงิน
  const updatePaymentStatus = async (participantId: string, newStatus: 'paid' | 'pending') => {
    if (!bill) return;
    
    try {
      setIsSaving(true);
      
      // สร้างรายการผู้ร่วมบิลที่อัพเดตแล้ว
      const updatedParticipants = bill.participants.map((participant) => {
        if (participant.id === participantId) {
          return { ...participant, status: newStatus };
        }
        return participant;
      });
      
      // ตรวจสอบว่าทุกคนจ่ายแล้วหรือไม่
      const allPaid = updatedParticipants.every((p) => p.status === 'paid');
      const billStatus = allPaid ? 'paid' : 'pending';
      
      // อัพเดตข้อมูลในฐานข้อมูล Firebase
      const billRef = doc(db, 'bills', bill.id);
      await updateDoc(billRef, {
        participants: updatedParticipants,
        status: billStatus
      });
      
      // อัพเดต state
      setBill({
        ...bill,
        participants: updatedParticipants,
        status: billStatus
      });
      setOriginalBill({
        ...bill,
        participants: updatedParticipants,
        status: billStatus
      });
      
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการอัพเดตสถานะการชำระเงิน:', error);
      alert('ไม่สามารถอัพเดตสถานะการชำระเงินได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };
  
  // ฟังก์ชันสำหรับอัพเดตสถานะทั้งบิล
  const updateAllPaymentStatus = async (newStatus: 'paid' | 'pending') => {
    if (!bill) return;
    
    try {
      setIsSaving(true);
      
      // สร้างรายการผู้ร่วมบิลที่อัพเดตแล้ว
      const updatedParticipants = bill.participants.map((participant) => {
        return { ...participant, status: newStatus };
      });
      
      // อัพเดตข้อมูลในฐานข้อมูล Firebase
      const billRef = doc(db, 'bills', bill.id);
      await updateDoc(billRef, {
        participants: updatedParticipants,
        status: newStatus
      });
      
      // อัพเดต state
      setBill({
        ...bill,
        participants: updatedParticipants,
        status: newStatus
      });
      setOriginalBill({
        ...bill,
        participants: updatedParticipants,
        status: newStatus
      });
      
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการอัพเดตสถานะการชำระเงิน:', error);
      alert('ไม่สามารถอัพเดตสถานะการชำระเงินได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  // คำนวณเงินที่แต่ละคนต้องจ่ายตามวิธีการหาร
  const calculateParticipantShares = () => {
    if (!bill) return {};
    
    const shares: Record<string, number> = {};
    const { participants, foodItems, totalAmount, splitMethod, vat, serviceCharge, discount } = bill;
    
    // คำนวณยอดเงินรวมทั้งหมด (รวม VAT, ค่าบริการ, หักส่วนลด)
    const totalFoodCost = foodItems.reduce((sum, item) => sum + item.price, 0);
    const vatAmount = (totalFoodCost * vat) / 100;
    const serviceAmount = (totalFoodCost * serviceCharge) / 100;
    const totalWithAllFees = totalFoodCost + vatAmount + serviceAmount - discount;
    
    // วิธีหารเท่ากันทุกคน
    if (splitMethod === 'equal') {
      const equalShare = totalWithAllFees / participants.length;
      participants.forEach(participant => {
        shares[participant.id] = equalShare;
      });
    } 
    // วิธีหารตามรายการที่สั่ง
    else {
      // คำนวณยอดรวมค่าอาหารแต่ละคน (ยังไม่รวม VAT, ค่าบริการ หรือหักส่วนลด)
      participants.forEach(participant => {
        shares[participant.id] = 0;
      });
      
      foodItems.forEach(item => {
        if (item.participants && item.participants.length > 0) {
          const pricePerPerson = item.price / item.participants.length;
          item.participants.forEach(participantId => {
            shares[participantId] = (shares[participantId] || 0) + pricePerPerson;
          });
        }
      });
      
      // คำนวณสัดส่วนของ VAT, ค่าบริการ และส่วนลดสำหรับแต่ละคน
      const totalParticipantBaseCost = Object.values(shares).reduce((sum, cost) => sum + cost, 0);
      
      // คำนวณอัตราส่วนและเพิ่ม VAT, ค่าบริการ และหักส่วนลดตามสัดส่วนของแต่ละคน
      Object.keys(shares).forEach(participantId => {
        if (totalParticipantBaseCost > 0) {
          const ratio = shares[participantId] / totalParticipantBaseCost;
          const participantVat = vatAmount * ratio;
          const participantService = serviceAmount * ratio;
          const participantDiscount = discount * ratio;
          
          shares[participantId] = shares[participantId] + participantVat + participantService - participantDiscount;
        } else {
          shares[participantId] = 0;
        }
      });
    }
    
    return shares;
  };

  // คำนวณว่ามีผู้ร่วมจ่ายคนใดบ้างที่ยังไม่ถูกเลือกในรายการอาหารใดๆ เลย
  const getUnassignedParticipants = () => {
    if (!bill) return [];
    
    // เฉพาะกรณีที่เป็นวิธีหารตามรายการที่สั่ง
    if (bill.splitMethod === 'itemized') {
      const { participants, foodItems } = bill;
      
      // รวมทุกคนที่ถูกเลือกในรายการอาหารบ้างแล้ว
      const assignedParticipants = new Set<string>();
      foodItems.forEach(item => {
        if (item.participants) {
          item.participants.forEach(participantId => {
            assignedParticipants.add(participantId);
          });
        }
      });
      
      // กรองเอาเฉพาะคนที่ยังไม่ถูกเลือกในรายการใดๆ
      return participants
        .filter(participant => !assignedParticipants.has(participant.id))
        .map(participant => participant.id);
    }
    
    return [];
  };

  // บันทึกการแก้ไขทั้งหมดไปยัง Firebase
  const handleSaveChanges = async () => {
    if (!bill) return;
    
    try {
      setIsSaving(true);
      setSaveMessage(null);
      
      // สร้างค็อปปี้ของ bill และลบ id ออก
      const billToUpdate = {...bill};
      delete billToUpdate.id;
      
      const docRef = doc(db, 'bills', id as string);
      await updateDoc(docRef, billToUpdate);
      
      setIsEdited(false);
      setOriginalBill(JSON.parse(JSON.stringify(bill)));
      setSaveMessage({ type: 'success', text: 'บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว' });
      
      // ซ่อนข้อความหลังจาก 3 วินาที
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (err) {
      console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', err);
      setSaveMessage({ type: 'error', text: 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง' });
    } finally {
      setIsSaving(false);
    }
  };

  // แสดง loading state
  if (loading || (isLoading && user)) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 w-8 mx-auto bg-blue-400 rounded-full mb-4 animate-spin"></div>
          <div className="h-6 w-32 mx-auto bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-48 mx-auto bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // แสดงหน้าล็อกอิน
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">รายละเอียดบิล</h1>
          <p className="text-muted-foreground mb-6">กรุณาเข้าสู่ระบบเพื่อดูรายละเอียดบิล</p>
          <Button onClick={openLoginModal}>เข้าสู่ระบบ</Button>
        </div>
      </div>
    );
  }

  // แสดงหน้า unauthorized
  if (unauthorized) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center">
          <div className="bg-red-100 text-red-800 p-6 rounded-lg mb-6">
            <h1 className="text-3xl font-bold mb-3">ไม่มีสิทธิ์เข้าถึง</h1>
            <p className="mb-0">คุณไม่มีสิทธิ์เข้าถึงข้อมูลบิลนี้</p>
          </div>
          <Button onClick={() => router.push('/bill-history')}>กลับไปหน้าประวัติบิล</Button>
        </div>
      </div>
    );
  }

  // แสดงหน้า error
  if (error || !bill) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center">
          <div className="bg-red-100 text-red-800 p-6 rounded-lg mb-6">
            <h1 className="text-3xl font-bold mb-3">เกิดข้อผิดพลาด</h1>
            <p className="mb-0">{error || 'ไม่พบข้อมูลบิล'}</p>
          </div>
          <Button onClick={() => router.push('/bill-history')}>กลับไปหน้าประวัติบิล</Button>
        </div>
      </div>
    );
  }

  const participantShares = calculateParticipantShares();
  const unassignedParticipants = getUnassignedParticipants();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-8">
        <Button 
          variant="outline" 
          className="mb-4 flex items-center" 
          onClick={() => router.push('/bill-history')}
        >
          <ArrowLeft size={16} className="mr-2" />
          กลับไปหน้าประวัติบิล
        </Button>
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{bill.name}</h1>
          {bill.categoryId && (
            <div className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
              <CategoryIcon id={bill.categoryId} showName={true} size={20} />
            </div>
          )}
        </div>
        <div className="flex items-center text-gray-500 mt-2">
          <CalendarIcon size={16} className="mr-1" />
          <span>{formatDate(bill.createdAt)}</span>
        </div>

        {/* แสดงคำเตือนสำหรับผู้ที่ยังไม่มีรายการอาหาร */}
        {bill.splitMethod === 'itemized' && unassignedParticipants.length > 0 && (
          <div className="mt-4 p-3 rounded-md bg-yellow-100 text-yellow-700">
            <span className="font-semibold">คำเตือน:</span> มีผู้เข้าร่วมบางคนยังไม่ได้เลือกรายการอาหารที่รับประทาน กรุณาเลือกว่าใครกินอะไรบ้าง
          </div>
        )}

        {/* แสดงข้อความเมื่อบันทึกการแก้ไข */}
        {saveMessage && (
          <div className={`mt-4 p-3 rounded-md ${saveMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {saveMessage.text}
          </div>
        )}

        {/* แสดงสถานะบิลและปุ่มบันทึกการแก้ไข */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className={`flex items-center rounded-full px-3 py-1 text-sm ${bill.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              {bill.status === 'paid' ? (
                <>
                  <CheckCircle2 size={16} className="mr-1" />
                  <span>ชำระแล้ว</span>
                </>
              ) : (
                <>
                  <XCircle size={16} className="mr-1" />
                  <span>รอชำระ</span>
                </>
              )}
            </div>
            {/* ปุ่มอัพเดตสถานะทั้งบิล */}
            <div className="ml-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => updateAllPaymentStatus(bill.status === 'paid' ? 'pending' : 'paid')}
                disabled={isSaving}
              >
                {isSaving ? 'กำลังบันทึก...' : (bill.status === 'paid' ? 'เปลี่ยนเป็นรอชำระ' : 'เปลี่ยนเป็นชำระแล้ว')}
              </Button>
            </div>
          </div>
          {/* ปุ่มบันทึกการแก้ไข */}
          {isEdited && (
            <Button
              variant="primary"
              size="sm"
              className="flex items-center"
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              <Save size={16} className="mr-1" />
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>รายการอาหาร</span>
                <span className="text-sm font-normal text-gray-500">
                  วิธีการหาร: {bill.splitMethod === 'equal' ? 'หารเท่ากันหมด' : 'หารตามรายการที่สั่ง'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bill.foodItems?.map((item, index) => (
                  <div key={item.id || index} className="p-3 border rounded-md">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          {item.price.toLocaleString()} บาท
                        </p>
                      </div>
                      <div className="text-right">
                        {/* แสดงผู้ร่วมจ่ายและเพิ่มความสามารถในการเลือก/ยกเลิกการเลือก */}
                        {bill.splitMethod === 'equal' ? (
                          <div className="text-gray-500 italic text-sm">ทุกคนร่วมจ่ายเท่ากัน</div>
                        ) : (
                          <div className="flex flex-wrap justify-end gap-1 mt-2">
                            {bill.participants.map(participant => (
                              <button
                                key={participant.id}
                                type="button"
                                onClick={() => handleParticipantToggle(item.id, participant.id)}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors
                                  ${item.participants?.includes(participant.id) 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                  }`}
                              >
                                {participant.name}
                                {item.participants?.includes(participant.id) && (
                                  <span className="ml-1">
                                    ({(item.price / (item.participants?.length || 1)).toLocaleString('th-TH', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })} บาท)
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>ผู้ร่วมบิล</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bill.participants.map((participant) => (
                  <div 
                    key={participant.id} 
                    className={`flex items-center justify-between border-b pb-2 ${
                      bill.splitMethod === 'itemized' && unassignedParticipants.includes(participant.id)
                        ? 'bg-yellow-50 rounded p-2 -mx-2'
                        : ''
                    }`}
                  >
                    <div>
                      <p className="font-medium">{participant.name}</p>
                      <p className="text-sm text-gray-500">
                        {participantShares[participant.id]?.toLocaleString('th-TH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }) || '0.00'} บาท
                      </p>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        variant={participant.status === 'paid' ? 'outline' : 'primary'}
                        className={`text-xs ${participant.status === 'paid' ? 'border-green-500 text-green-600' : ''}`}
                        onClick={() => updatePaymentStatus(participant.id, participant.status === 'paid' ? 'pending' : 'paid')}
                        disabled={isSaving}
                      >
                        {participant.status === 'paid' ? (
                          <span className="flex items-center">
                            <CheckCircle2 size={14} className="mr-1" />
                            ชำระแล้ว
                          </span>
                        ) : (
                          'ชำระเงิน'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>รายละเอียดค่าใช้จ่าย</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">ยอดรวมค่าอาหาร</span>
                  <span className="font-medium">
                    {bill.foodItems?.reduce((sum: number, item: FoodItem) => sum + item.price, 0).toLocaleString() || 0} บาท
                  </span>
                </div>
                
                {bill.vat > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">VAT ({bill.vat}%)</span>
                    <span className="font-medium">
                      {(bill.foodItems?.reduce((sum: number, item: FoodItem) => sum + item.price, 0) * bill.vat / 100).toLocaleString() || 0} บาท
                    </span>
                  </div>
                )}
                
                {bill.serviceCharge > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ค่าบริการ ({bill.serviceCharge}%)</span>
                    <span className="font-medium">
                      {(bill.foodItems?.reduce((sum: number, item: FoodItem) => sum + item.price, 0) * bill.serviceCharge / 100).toLocaleString() || 0} บาท
                    </span>
                  </div>
                )}
                
                {bill.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">ส่วนลด</span>
                    <span className="font-medium text-green-600">
                      - {bill.discount.toLocaleString()} บาท
                    </span>
                  </div>
                )}
                
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center font-bold">
                    <span>ยอดรวมทั้งสิ้น</span>
                    <span className="text-lg text-primary">
                      {bill.totalAmount.toLocaleString()} บาท
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center">
        <Button 
          variant="outline" 
          className="mr-2" 
          onClick={() => router.push('/bill-history')}
        >
          กลับไปหน้าประวัติบิล
        </Button>
        
        {isEdited && (
          <Button
            variant="primary"
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="ml-2"
          >
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
          </Button>
        )}
      </div>
    </div>
  );
}

// คอมโพเนนต์หลักที่ครอบด้วย FirebaseProvider
export default function BillDetailPage() {
  return (
    <FirebaseProvider>
      <BillDetailContent />
    </FirebaseProvider>
  );
} 