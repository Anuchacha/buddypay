import { useState } from 'react';
import { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { BillState } from '../../lib/billTypes';
import { User, ChevronDown, ChevronUp, Utensils, CreditCard, FileText, DollarSign, AlertCircle, Calendar, Users } from 'lucide-react';
import QRCode from 'react-qr-code';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface ResultStepProps {
  state: BillState;
  promptPayId: string;
  qrPayload: string;
  notes: string;
}

export default function ResultStep({
  state,
  promptPayId,
  qrPayload,
  notes
}: ResultStepProps) {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

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
        </div>
      </CardContent>
    </>
  );
} 