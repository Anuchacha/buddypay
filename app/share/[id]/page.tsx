'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ResultStep from '@/app/components/BillSteps/ResultStep';
import { BillState } from '@/app/lib/billTypes';
import { getAppUrl } from '@/app/lib/utils';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { useAuthModal } from '@/app/context/AuthModalContext';
import { useAuth } from '@/app/context/AuthContext';
import { useRef } from 'react';

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
  const [billData, setBillData] = useState<SharedBillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { openSignupModal } = useAuthModal();
  const { isAuthenticated } = useAuth();
  const shouldSaveBill = useRef(false);

  useEffect(() => {
    const fetchSharedBill = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/share/${params.id}`);
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to load shared bill');
        }
        
        setBillData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchSharedBill();
    }
  }, [params.id]);

  useEffect(() => {
    if (isAuthenticated && shouldSaveBill.current && billData) {
      // TODO: เรียก API หรือฟังก์ชันสำหรับบันทึกบิลอัตโนมัติที่นี่ เช่น saveBill(billData)
      // หลังบันทึกเสร็จอาจ redirect หรือแสดง toast ตามต้องการ
      shouldSaveBill.current = false; // reset flag
    }
  }, [isAuthenticated, billData]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">กำลังโหลดข้อมูลบิล...</h2>
          <p className="text-gray-600">โปรดรอสักครู่</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md mx-auto">
          <div className="bg-red-100 rounded-full p-4 inline-block mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">ไม่สามารถโหลดข้อมูลได้</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700 mb-6">
            <h3 className="font-semibold mb-2">เหตุผลที่เป็นไปได้:</h3>
            <ul className="text-left space-y-1">
              <li>• ลิงค์หมดอายุแล้ว (หมดอายุภายใน 15 วัน)</li>
              <li>• ลิงค์ไม่ถูกต้องหรือเสียหาย</li>
              <li>• ข้อมูลถูกลบไปแล้ว</li>
            </ul>
          </div>

          <button
            onClick={() => window.location.href = '/share-bill'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            สร้างบิลใหม่
          </button>
        </div>
      </div>
    );
  }

  if (!billData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">ไม่พบข้อมูลบิล</p>
        </div>
      </div>
    );
  }

  const handleLoginAndSaveBill = () => {
    if (isAuthenticated) {
      // ถ้า login แล้ว ให้บันทึกบิลทันที
      if (billData) {
        // TODO: เรียก API หรือฟังก์ชันสำหรับบันทึกบิล เช่น saveBill(billData)
      }
    } else {
      // ถ้ายังไม่ login ให้ login แล้วบันทึกหลัง login สำเร็จ
      shouldSaveBill.current = true;
      openSignupModal();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header สำหรับหน้าแชร์ */}
          <div className="text-center mb-6">
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-3 flex items-center justify-center">
                📋 ผลลัพธ์การหารบิล
              </h1>
                             <p className="text-gray-600 mb-4">
                 {billData.billName || 'บิลที่ถูกแชร์'}
               </p>
               
               {/* แสดงสถานะของลิงค์ */}
               {billData.isTemporary && (
                 <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                   <p className="text-orange-700 text-sm font-medium flex items-center">
                     <AlertCircle className="w-4 h-4 mr-2" />
                     นี่เป็นลิงค์ชั่วคราว - จะหมดอายุภายใน 24 ชั่วโมง
                   </p>
                 </div>
               )}
               
               {/* ข้อมูลเวลา */}
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
              
              {/* แสดงเตือนว่าเหลือเวลา */}
              {(() => {
                const daysLeft = Math.ceil((new Date(billData.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                if (daysLeft <= 3) {
                  return (
                    <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-orange-700 text-sm font-medium">
                        ⚠️ ลิงค์นี้จะหมดอายุใน {daysLeft} วัน
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
          
          {/* แสดงผลลัพธ์ */}
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

          {/* Footer สำหรับหน้าแชร์ */}
          <div className="text-center mt-8 p-6 bg-white rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {billData.isTemporary ? 'อยากเก็บบิลไว้ถาวรมั้ย?' : 'ต้องการสร้างบิลของคุณเอง?'}
            </h3>
            <p className="text-gray-600 mb-4">
              {billData.isTemporary 
                ? 'ล็อกอินเพื่อเก็บบิลไว้ในประวัติ ไม่มีวันหมดอายุ!' 
                : 'สร้างและแชร์บิลแบบง่าย ๆ ฟรี!'
              }
            </p>
            <div className="flex gap-3 justify-center">
              {billData.isTemporary && (
                <button
                  onClick={handleLoginAndSaveBill}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  🔒 ล็อกอินและเก็บบิล
                </button>
              )}
              <button
                onClick={() => window.location.href = '/share-bill'}
                className={`${billData.isTemporary ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-3 rounded-lg transition-colors flex items-center`}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {billData.isTemporary ? 'สร้างบิลใหม่' : 'เริ่มใช้ BuddyPay'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 