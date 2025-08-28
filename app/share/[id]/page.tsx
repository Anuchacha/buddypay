'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ResultStep from '@/app/components/BillSteps/ResultStep';
import { BillState } from '@/app/lib/billTypes';
import { getAppUrl } from '@/app/lib/utils';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { AlertCircle, Clock } from 'lucide-react';
import { useAuthModal } from '@/app/context/AuthModalContext';
import { useAuth } from '@/app/context/AuthContext';

// Firestore
import { db } from '@/app/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface SharedBillData extends BillState {
  expiryDate: string;
  createdAt: string;
  promptPayId?: string;
  qrPayload?: string;
  notes?: string;
  isTemporary?: boolean;
  shareId?: string;
  type?: string;
}

export default function SharedBillPage() {
  const params = useParams();
  const router = useRouter();
  const [billData, setBillData] = useState<SharedBillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { openSignupModal } = useAuthModal();
  const { isAuthenticated, user } = useAuth();
  const shouldSaveBill = useRef(false);

  // โหลดบิลจาก API
  useEffect(() => {
    const fetchSharedBill = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/share/${params.id}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Failed to load shared bill');
        setBillData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchSharedBill();
  }, [params.id]);

  // ฟังก์ชันบันทึกบิลลง Firestore
  const saveBillToFirestore = async (data: SharedBillData) => {
    if (!user) return;
    try {
      const payload = {
        name: data.billName,
        categoryId: data.categoryId || 'uncategorized',
        splitMethod: data.splitMethod,
        foodItems: data.foodItems,
        participants: data.participants,
        discount: Number(data.discount) || 0,
        vat: Number(data.vat) || 0,
        serviceCharge: Number(data.serviceCharge) || 0,
        totalAmount: data.totalAmount,
        splitResults: data.splitResults || [],
        status: 'pending',
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, 'bills'), payload);
      router.push(`/bill/${docRef.id}`);
    } catch (err) {
      console.error('Error saving bill:', err);
      alert('เกิดข้อผิดพลาดในการบันทึกบิล');
    }
  };

  // ถ้า login แล้วและ flag shouldSaveBill เป็น true → บันทึกทันที
  useEffect(() => {
    if (isAuthenticated && shouldSaveBill.current && billData) {
      saveBillToFirestore(billData);
      shouldSaveBill.current = false;
    }
  }, [isAuthenticated, billData]);

  const handleLoginAndSaveBill = () => {
    if (isAuthenticated) {
      if (billData) saveBillToFirestore(billData);
    } else {
      shouldSaveBill.current = true;
      openSignupModal();
    }
  };

  // --- UI state: loading, error, not found ---
  if (loading) return <div className="p-10 text-center">กำลังโหลด...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;
  if (!billData) return <div className="p-10 text-center text-gray-500">ไม่พบข้อมูลบิล</div>;

  // --- Main render ---
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-3">📋 ผลลัพธ์การหารบิล</h1>
              <p className="text-gray-600 mb-4">{billData.billName || 'บิลที่ถูกแชร์'}</p>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  สร้างเมื่อ: {format(new Date(billData.createdAt), 'd MMM yyyy เวลา HH:mm', { locale: th })}
                </div>
                <div className="flex items-center text-orange-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  หมดอายุ: {format(new Date(billData.expiryDate), 'd MMM yyyy', { locale: th })}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm">
            <ResultStep
              state={billData}
              promptPayId={billData.promptPayId || ''}
              qrPayload={billData.qrPayload || ''}
              notes={billData.notes || ''}
              isSharedView={true}
              existingShareUrl={`${getAppUrl()}/share/${params.id}`}
            />
          </div>

          {/* Footer */}
          <div className="text-center mt-8 p-6 bg-white rounded-xl shadow-sm border">
            {billData.isTemporary && (
              <button
                onClick={handleLoginAndSaveBill}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors mr-3"
              >
                🔒 ล็อกอินและเก็บบิล
              </button>
            )}
            <button
              onClick={() => router.push('/share-bill')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {billData.isTemporary ? 'สร้างบิลใหม่' : 'เริ่มใช้ BuddyPay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
