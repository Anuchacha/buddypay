import { useState, useEffect } from 'react';
import { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { BillState } from '../../lib/billTypes';
import { User, ChevronDown, ChevronUp, Utensils, CreditCard, FileText, DollarSign, AlertCircle, Calendar, Users, Share2, Copy, Check, UserPlus, Save } from 'lucide-react';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';

interface ResultStepProps {
  state: BillState;
  promptPayId: string;
  qrPayload: string;
  notes: string;
  isSharedView?: boolean;
  existingShareUrl?: string;
}

export default function ResultStep({
  state,
  promptPayId,
  qrPayload,
  notes,
  isSharedView = false,
  existingShareUrl = ''
}: ResultStepProps) {
  const { isAuthenticated } = useAuth();
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  
  // States สำหรับการแชร์ลิงค์
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ตั้งค่า shareUrl เมื่ออยู่ในโหมดแชร์
  useEffect(() => {
    if (isSharedView && existingShareUrl) {
      setShareUrl(existingShareUrl);
    }
  }, [isSharedView, existingShareUrl]);

  // Debug logging
  console.log('ResultStep - state:', state);
  console.log('ResultStep - splitResults:', state.splitResults);
  console.log('ResultStep - splitMethod:', state.splitMethod);
  console.log('ResultStep - participants:', state.participants);
  console.log('ResultStep - foodItems:', state.foodItems);

  const toggleCard = (participantId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [participantId]: !prev[participantId]
    }));
  };

  // ฟังก์ชันสร้างลิงค์แชร์
  const handleCreateShareLink = async () => {
    // ถ้าอยู่ในโหมดแชร์ ให้ใช้ลิงค์เดิม
    if (isSharedView && existingShareUrl) {
      setShareUrl(existingShareUrl);
      console.log('Using existing share URL:', existingShareUrl);
      return;
    }
    
    setIsSharing(true);
    try {
      console.log('Creating share link...');
      
      // ตรวจสอบข้อมูลที่จำเป็น
      if (!state.billName || !state.participants || state.participants.length === 0) {
        alert('ข้อมูลบิลไม่สมบูรณ์ กรุณาตรวจสอบข้อมูลอีกครั้ง');
        return;
      }
      
      const dataToSend = {
        ...state,
        promptPayId,
        qrPayload,
        notes
      };
      console.log('Data to send:', dataToSend);
      
      const response = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success && result.shareUrl) {
        setShareUrl(result.shareUrl);
        console.log('Share link created successfully:', result.shareUrl);
        
        // แสดง prompt สำหรับการเก็บบิลถาวร (ถ้าไม่ได้ล็อกอิน)
        if (!isAuthenticated) {
          setShowSavePrompt(true);
        }
      } else {
        console.error('Failed to create share link:', result.error || 'Unknown error');
        throw new Error(result.error || 'ไม่ได้รับ URL แชร์จากเซิร์ฟเวอร์');
      }
    } catch (error) {
      console.error('Error creating share link:', error);
      
      let errorMessage = 'เกิดข้อผิดพลาดในการสร้างลิงค์แชร์';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อเครือข่าย';
      } else if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsSharing(false);
    }
  };

  // ฟังก์ชันคัดลอกลิงค์
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  // ฟังก์ชันบันทึกบิลถาวร
  const handleSavePermanent = async () => {
    setIsSaving(true);
    try {
      // TODO: ต้องใช้ authentication context หรือ modal
      alert('กำลังพัฒนาฟีเจอร์นี้ในอนาคต!');
      setShowSavePrompt(false);
    } catch (error) {
      console.error('Failed to save bill permanently:', error);
      alert('ไม่สามารถบันทึกบิลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  // คำนวณรายละเอียดการจ่ายเงินของแต่ละคน
  const getParticipantDetails = (participantId: string) => {
    const splitResult = state.splitResults?.find(result => result.participant.id === participantId);
    if (!splitResult) {
      console.log('No split result found for participant:', participantId);
      return null;
    }

    const foodItems: Array<{name: string, price: number, sharedWith: number}> = [];
    
    if (state.splitMethod === 'itemized') {
      // สำหรับการหารตามรายการที่สั่ง
      state.foodItems.forEach(item => {
        if (item.participants?.includes(participantId)) {
          const sharedWith = item.participants.length;
          const pricePerPerson = item.price / sharedWith;
          foodItems.push({
            name: item.name,
            price: pricePerPerson,
            sharedWith
          });
        }
      });
    } else {
      // สำหรับการหารเท่ากัน - ทุกคนได้ส่วนแบ่งจากทุกรายการ
      const totalParticipants = state.participants.length;
      state.foodItems.forEach(item => {
        const pricePerPerson = item.price / totalParticipants;
        foodItems.push({
          name: item.name,
          price: pricePerPerson,
          sharedWith: totalParticipants
        });
      });
    }

    // คำนวณส่วนแบ่งของ VAT, Service Charge, Discount
    const subtotal = foodItems.reduce((sum, item) => sum + item.price, 0);
    const totalFoodCost = state.foodItems.reduce((sum, item) => sum + item.price, 0);
    
    let vatShare = 0;
    let serviceShare = 0;
    let discountShare = 0;
    
    if (state.splitMethod === 'itemized') {
      // คำนวณตามสัดส่วนสำหรับการหารตามรายการ
      const ratio = totalFoodCost > 0 ? subtotal / totalFoodCost : 0;
      vatShare = (state.vat * totalFoodCost / 100) * ratio;
      serviceShare = (state.serviceCharge * totalFoodCost / 100) * ratio;
      discountShare = state.discount * ratio;
    } else {
      // คำนวณแบบหารเท่ากันสำหรับการหารเท่ากัน
      const totalParticipants = state.participants.length;
      vatShare = (state.vat * totalFoodCost / 100) / totalParticipants;
      serviceShare = (state.serviceCharge * totalFoodCost / 100) / totalParticipants;
      discountShare = state.discount / totalParticipants;
    }

    return {
      foodItems,
      subtotal,
      vatShare,
      serviceShare,
      discountShare,
      total: splitResult.amount
    };
  };

  return (
    <>
      <CardHeader className="bg-gray-50 border-b px-6 py-4">
        <CardTitle className="text-xl font-semibold flex items-center">
          <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">5</span>
          ผลลัพธ์การหารบิล
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Overview Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-5 text-white mb-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">{state.billName}</h1>
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {format(new Date(), 'd MMMM yyyy', { locale: th })}
            </div>
          </div>
          
          {/* ข้อมูลสรุป */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/10 p-3 rounded-lg">
              <div className="flex justify-center mb-1">
                <Utensils className="w-5 h-5" />
              </div>
              <div className="text-xs opacity-80">รายการอาหาร</div>
              <div className="text-xl font-bold mt-1">{state.foodItems.length}</div>
            </div>
            
            <div className="bg-white/10 p-3 rounded-lg">
              <div className="flex justify-center mb-1">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-xs opacity-80">ผู้ร่วมจ่าย</div>
              <div className="text-xl font-bold mt-1">{state.participants.length}</div>
            </div>
            
            <div className="bg-white/10 p-3 rounded-lg">
              <div className="flex justify-center mb-1">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="text-xs opacity-80">ยอดรวม</div>
              <div className="text-xl font-bold mt-1">{Math.round(state.totalAmount)} ฿</div>
            </div>
          </div>
        </div>



        <div className="bg-green-50 border border-green-100 rounded-md p-3 mb-5 text-sm text-green-700">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            นี่คือจำนวนเงินที่แต่ละคนต้องจ่าย สามารถบันทึกบิลเพื่อส่งต่อให้เพื่อนได้
          </p>
        </div>

        {/* แสดงรายละเอียดการจ่ายเงินของแต่ละคน */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-500" />
            แบ่งชำระค่าอาหาร
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {state.splitResults?.map((result) => {
              const details = getParticipantDetails(result.participant.id);
              if (!details) return null;
              
              const isExpanded = expandedCards[result.participant.id];
              
              return (
                <div 
                  key={result.participant.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* หัว Card - คลิกได้ */}
                  <div 
                    className="p-4 cursor-pointer border-b bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={() => toggleCard(result.participant.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-3">
                          {result.participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{result.participant.name}</h4>
                          <p className="text-sm text-gray-500">{details.foodItems.length} รายการ</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="text-right mr-3">
                          <div className="text-xl font-bold text-blue-600">
                            {Math.round(result.amount)} ฿
                          </div>
                          <div className="text-xs text-gray-500">
                            ต้องจ่าย
                          </div>
                        </div>
                        
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* รายละเอียดค่าใช้จ่าย - เปิดปิดได้ */}
                  {isExpanded && (
                    <div className="p-4 bg-gray-50">
                      {/* รายการอาหาร */}
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">รายการอาหาร</h5>
                        <div className="space-y-1">
                          {details.foodItems.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <div className="flex-1">
                                <span className="text-gray-800">{item.name}</span>
                                {state.splitMethod === 'itemized' && item.sharedWith > 1 && (
                                  <span className="text-gray-500 ml-1 text-xs">
                                    (แบ่ง {item.sharedWith} คน)
                                  </span>
                                )}
                              </div>
                              <span className="font-medium text-gray-700">
                                {Math.round(item.price)} ฿
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* การคำนวณ */}
                      <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">ค่าอาหาร</span>
                          <span className="text-gray-800">{Math.round(details.subtotal)} ฿</span>
                        </div>
                        
                        {details.vatShare > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">VAT ({state.vat}%)</span>
                            <span className="text-gray-800">{Math.round(details.vatShare)} ฿</span>
                          </div>
                        )}
                        
                        {details.serviceShare > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">ค่าบริการ ({state.serviceCharge}%)</span>
                            <span className="text-gray-800">{Math.round(details.serviceShare)} ฿</span>
                          </div>
                        )}
                        
                        {details.discountShare > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">ส่วนลด</span>
                            <span className="text-red-600">-{Math.round(details.discountShare)} ฿</span>
                          </div>
                        )}
                      </div>

                      {/* ยอดรวม */}
                      <div className="border-t border-gray-300 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-800">รวมทั้งสิ้น</span>
                          <span className="text-xl font-bold text-blue-600">{Math.round(details.total)} ฿</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* สรุปบิลทั้งหมด */}
        <div className="border-t border-gray-200 pt-8">
          
          {/* รายการอาหารทั้งหมด */}
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
              <Utensils className="w-5 h-5 mr-2 text-blue-500" />
              รายการอาหารทั้งหมด
            </h4>
            
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              {/* หัวตาราง */}
              <div className="grid grid-cols-12 gap-2 p-3 border-b bg-gray-100 text-sm font-medium text-gray-600">
                <div className="col-span-7">รายการ</div>
                <div className="col-span-2 text-center">จำนวน</div>
                <div className="col-span-3 text-right">ราคา (บาท)</div>
              </div>
              
              {/* รายการอาหาร */}
              <div className="divide-y divide-gray-200 max-h-80 overflow-auto">
                {state.foodItems.length > 0 ? (
                  state.foodItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-blue-50/50 transition-colors">
                      <div className="col-span-7 font-medium text-gray-800">{item.name}</div>
                      <div className="col-span-2 text-center text-gray-600">1 จาน</div>
                      <div className="col-span-3 text-right font-semibold text-gray-800">
                        {Math.round(item.price)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    ไม่มีรายการอาหาร
                  </div>
                )}
              </div>
              
              {/* รายละเอียดเพิ่มเติม */}
              <div className="border-t border-gray-200 divide-y divide-gray-200">
                {state.vat > 0 && (
                  <div className="grid grid-cols-12 gap-2 p-2 bg-gray-50 items-center">
                    <div className="col-span-9 text-gray-600 text-sm">ภาษีมูลค่าเพิ่ม {state.vat}%</div>
                    <div className="col-span-3 text-right font-medium text-gray-700">
                      {Math.round(state.foodItems.reduce((sum, item) => sum + item.price, 0) * state.vat / 100)}
                    </div>
                  </div>
                )}
                
                {state.serviceCharge > 0 && (
                  <div className="grid grid-cols-12 gap-2 p-2 bg-gray-50 items-center">
                    <div className="col-span-9 text-gray-600 text-sm">ค่าบริการ {state.serviceCharge}%</div>
                    <div className="col-span-3 text-right font-medium text-gray-700">
                      {Math.round(state.foodItems.reduce((sum, item) => sum + item.price, 0) * state.serviceCharge / 100)}
                    </div>
                  </div>
                )}
                
                {state.discount > 0 && (
                  <div className="grid grid-cols-12 gap-2 p-2 bg-gray-50 items-center">
                    <div className="col-span-9 text-gray-600 text-sm">ส่วนลด</div>
                    <div className="col-span-3 text-right font-medium text-red-600">
                      -{Math.round(state.discount)}
                    </div>
                  </div>
                )}
                
                {/* ยอดรวม */}
                <div className="grid grid-cols-12 gap-2 p-3 bg-blue-50 items-center">
                  <div className="col-span-9 font-semibold text-blue-800">ยอดรวมทั้งสิ้น</div>
                  <div className="col-span-3 text-right font-bold text-blue-800 text-lg">
                    {Math.round(state.totalAmount)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* วิธีการชำระเงิน และ หมายเหตุ */}
          {((qrPayload || promptPayId) || notes) && (
            <div className="mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* วิธีการชำระเงิน */}
                {(qrPayload || promptPayId) && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
                      วิธีการชำระเงิน
                    </h4>
                    
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                      <div className="flex flex-col items-center justify-center gap-4">
                        {/* QR Code */}
                        {qrPayload && (
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-700 mb-2">สแกนเพื่อชำระเงิน</p>
                            <div className="bg-white p-3 rounded-lg shadow-sm inline-block">
                              <QRCode
                                value={qrPayload}
                                size={120}
                                level="M"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* PromptPay Info */}
                        {promptPayId && (
                          <div className="text-center">
                            <div className="mb-3">
                              <div className="text-sm text-gray-600 mb-1">พร้อมเพย์:</div>
                              <div className="font-semibold text-gray-800 text-lg">{promptPayId}</div>
                            </div>
                            
                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg flex items-start">
                              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                              <span>กรุณาตรวจสอบชื่อและเลขบัญชีก่อนโอนเงิน</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* หมายเหตุ */}
                {notes && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-500" />
                      หมายเหตุ
                    </h4>
                    
                    <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 h-full">
                      <div className="text-gray-700 text-sm whitespace-pre-wrap">{notes}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* ส่วนแชร์ลิงค์ - ตำแหน่งใหม่ (ท้ายสุด) */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center justify-center">
                  <Share2 className="w-6 h-6 mr-2 text-indigo-600" />
                  แชร์ผลลัพธ์ให้เพื่อน
                </h3>
                                 <p className="text-gray-600 mb-6">
                  {isSharedView 
                    ? 'คุณกำลังดูลิงค์แชร์นี้อยู่ สามารถคัดลอกลิงค์เพื่อส่งต่อได้' 
                    : 'ส่งลิงค์ผลลัพธ์การหารบิลให้เพื่อนๆ ดู (หมดอายุอัตโนมัติใน 24 ชั่วโมง)'
                  }
                </p>
                
                {!shareUrl ? (
                  <button
                    onClick={handleCreateShareLink}
                    disabled={isSharing}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg"
                  >
                    {isSharing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        กำลังสร้างลิงค์แชร์...
                      </>
                    ) : (
                      <>
                        <Share2 className="w-5 h-5 mr-3" />
                        {isSharedView ? '🔗 แสดงลิงค์นี้' : '🔗 สร้างลิงค์แชร์'}
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-white rounded-lg p-4 border border-indigo-300">
                    <div className="flex items-center justify-center mb-3">
                      <div className="bg-green-100 rounded-full p-2 mr-3">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="text-green-700 font-medium">✅ ลิงค์แชร์พร้อมใช้งาน!</span>
                    </div>
                    
                    <div className="flex gap-3 mb-3">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none"
                      />
                      <button
                        onClick={handleCopyLink}
                        className={`px-6 py-2 rounded-lg flex items-center transition-all duration-200 font-medium ${
                          copied 
                            ? 'bg-green-600 text-white' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            คัดลอกแล้ว!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            คัดลอกลิงค์
                          </>
                        )}
                      </button>
                    </div>
                    
                                         <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                       💡 <strong>วิธีใช้:</strong> ส่งลิงค์นี้ในแชท Line, Facebook หรือ WhatsApp ให้เพื่อนๆ เพื่อดูผลลัพธ์การหารบิล
                     </div>
                   </div>
                 )}
               </div>
             </div>
             
             {/* Prompt สำหรับการเก็บบิลถาวร */}
             {showSavePrompt && shareUrl && !isAuthenticated && (
               <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                 <div className="text-center">
                   <div className="mb-4">
                     <div className="bg-green-100 rounded-full p-3 inline-block mb-3">
                       <Save className="w-6 h-6 text-green-600" />
                     </div>
                     <h3 className="text-lg font-bold text-gray-800 mb-2">
                       💾 อยากเก็บบิลนี้ไว้มั้ย?
                     </h3>
                     <p className="text-gray-600 mb-4">
                       ลิงค์นี้จะหายไปใน <strong>24 ชั่วโมง</strong><br/>
                       ล็อกอินเพื่อเก็บบิลไว้ในประวัติ <strong>ไม่หายไปไหน!</strong>
                     </p>
                   </div>
                   
                   <div className="flex gap-3 justify-center">
                     <button
                       onClick={handleSavePermanent}
                       disabled={isSaving}
                       className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center transition-colors"
                     >
                       {isSaving ? (
                         <>
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                           กำลังบันทึก...
                         </>
                       ) : (
                         <>
                           <UserPlus className="w-4 h-4 mr-2" />
                           🔒 ล็อกอินและเก็บบิล
                         </>
                       )}
                     </button>
                     
                     <button
                       onClick={() => setShowSavePrompt(false)}
                       className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                     >
                       ไม่เป็นไร ใช้ชั่วคราวพอ
                     </button>
                   </div>
                   
                   <div className="mt-4 text-xs text-gray-500 bg-white/50 p-3 rounded-lg">
                     ⭐ <strong>ข้อดีของการล็อกอิน:</strong> เก็บประวัติบิล, แก้ไขได้, สร้างกลุ่มเพื่อน, ไม่มีวันหมดอายุ
                   </div>
                 </div>
               </div>
             )}
           </div>
        </div>
      </CardContent>
    </>
  );
} 