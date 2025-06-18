import { useState } from 'react';
import { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { BillState } from '../../lib/billTypes';
import BillSummary from '../../components/BillSummary';
import { ChevronDown, ChevronUp, User, Receipt, DollarSign } from 'lucide-react';

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

  const toggleCard = (participantId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [participantId]: !prev[participantId]
    }));
  };

  // คำนวณรายละเอียดการจ่ายเงินของแต่ละคน
  const getParticipantDetails = (participantId: string) => {
    const splitResult = state.splitResults?.find(result => result.participant.id === participantId);
    if (!splitResult) return null;

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
      // สำหรับการหารเท่ากัน
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
    const ratio = subtotal / totalFoodCost;
    
    const vatShare = (state.vat * totalFoodCost / 100) * ratio;
    const serviceShare = (state.serviceCharge * totalFoodCost / 100) * ratio;
    const discountShare = state.discount * ratio;

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
            รายละเอียดการจ่ายเงินของแต่ละคน
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.splitResults?.map((result) => {
              const details = getParticipantDetails(result.participant.id);
              if (!details) return null;
              
              const isExpanded = expandedCards[result.participant.id];
              
              return (
                <div 
                  key={result.participant.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* หัว Card */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => toggleCard(result.participant.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold mr-3">
                          {result.participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{result.participant.name}</h4>
                          <p className="text-sm text-gray-500">ต้องจ่าย</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="text-right mr-3">
                          <div className="text-xl font-bold text-blue-600">
                            {Math.round(result.amount)} ฿
                          </div>
                          <div className="text-xs text-gray-500">
                            {details.foodItems.length} รายการ
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

                  {/* รายละเอียด (Dropdown) */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      {/* รายการอาหาร */}
                      <div className="mb-4">
                        <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                          <Receipt className="w-4 h-4 mr-1" />
                          รายการอาหาร
                        </h5>
                        <div className="space-y-2">
                          {details.foodItems.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <div className="flex-1">
                                <span className="text-gray-800">{item.name}</span>
                                {state.splitMethod === 'itemized' && item.sharedWith > 1 && (
                                  <span className="text-gray-500 ml-2">
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

                      {/* สรุปค่าใช้จ่าย */}
                      <div className="border-t border-gray-200 pt-3">
                        <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          สรุปค่าใช้จ่าย
                        </h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">ค่าอาหาร</span>
                            <span>{Math.round(details.subtotal)} ฿</span>
                          </div>
                          
                          {details.vatShare > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">VAT ({state.vat}%)</span>
                              <span>{Math.round(details.vatShare)} ฿</span>
                            </div>
                          )}
                          
                          {details.serviceShare > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">ค่าบริการ ({state.serviceCharge}%)</span>
                              <span>{Math.round(details.serviceShare)} ฿</span>
                            </div>
                          )}
                          
                          {details.discountShare > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">ส่วนลด</span>
                              <span className="text-red-600">-{Math.round(details.discountShare)} ฿</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
                            <span className="text-gray-800">รวมทั้งสิ้น</span>
                            <span className="text-blue-600">{Math.round(details.total)} ฿</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* แบ่งเส้น */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">สรุปบิลทั้งหมด</h3>
        </div>

        <BillSummary
          totalAmount={state.totalAmount}
          splitResults={state.splitResults}
          items={state.foodItems.map(item => ({
            name: item.name,
            amount: item.price,
            type: 'food' as const,
            quantity: 1
          }))}
          billTitle={state.billName}
          billDate={new Date()}
          vat={state.vat}
          discount={state.discount}
          serviceCharge={state.serviceCharge}
          ownerName={state.participants.length > 0 ? state.participants[0].name : ''}
          promptPayId={promptPayId}
          qrPayload={qrPayload}
          notes={notes}
        />
      </CardContent>
    </>
  );
} 