import { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../ui/Badge';
import { BillState } from '../../lib/billTypes';
import { Users, UtensilsCrossed, Info, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FoodParticipantsStepProps {
  state: BillState;
  dispatch: React.Dispatch<any>;
}

export default function FoodParticipantsStep({
  state,
  dispatch
}: FoodParticipantsStepProps) {
  
  // ตรวจสอบว่ารายการอาหารไหนยังไม่มีผู้กิน
  const getItemStatus = (item: any) => {
    if (!item.participants || item.participants.length === 0) {
      return { status: 'incomplete', message: 'ยังไม่มีผู้กิน' };
    }
    return { status: 'complete', message: `${item.participants.length} คน` };
  };

  const incompleteItems = state.foodItems.filter(item => (item.participants || []).length === 0);
  const allItemsAssigned = incompleteItems.length === 0 && state.foodItems.length > 0;

  // helpers
  const allParticipantIds = state.participants.map(p => p.id);

  const handleSelectAllForItem = (item: any) => {
    dispatch({
      type: 'UPDATE_FOOD_ITEM',
      payload: { ...item, participants: allParticipantIds }
    });
  };

  const handleClearForItem = (item: any) => {
    dispatch({
      type: 'UPDATE_FOOD_ITEM',
      payload: { ...item, participants: [] }
    });
  };

  return (
    <>
      <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5 border-b px-6 py-4">
        <CardTitle className="text-xl font-semibold flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary text-white inline-flex items-center justify-center mr-2.5 text-sm shadow-sm">4</div>
          <span className="text-primary">เลือกผู้กินแต่ละรายการ</span>
          {allItemsAssigned ? (
            <div className="ml-3 bg-green-100 text-green-800 rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center">
              <CheckCircle2 size={12} className="mr-1" />
              ครบถ้วน
            </div>
          ) : (
            <div className="ml-3 bg-yellow-100 text-yellow-800 rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center">
              <AlertCircle size={12} className="mr-1" />
              {incompleteItems.length} รายการ
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4 text-sm text-blue-700 flex items-start">
          <Info size={18} className="mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium mb-1">เลือกว่าใครกินรายการอาหารไหนบ้าง</p>
            <p>แต่ละรายการสามารถเลือกได้หลายคน ค่าใช้จ่ายจะแบ่งตามจำนวนคนที่เลือก</p>
          </div>
        </div>

        {/* สถานะโดยรวม */}
        <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <UtensilsCrossed className="w-4 h-4 text-primary" />
            <span className="text-gray-600">รายการทั้งหมด:</span>
            <Badge variant="secondary">{state.foodItems.length} รายการ</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">จัดสรรแล้ว:</span>
            <Badge variant="default" className="bg-green-100 text-green-800">
              {state.foodItems.length - incompleteItems.length} รายการ
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-600">รอจัดสรร:</span>
            <Badge variant={incompleteItems.length > 0 ? "danger" : "secondary"}>
              {incompleteItems.length} รายการ
            </Badge>
          </div>
        </div>

        {state.foodItems.length > 0 ? (
          <div className="space-y-4">
            {state.foodItems.map((item, index) => {
              const itemStatus = getItemStatus(item);
              
              return (
                <div 
                  key={item.id} 
                  className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all ${
                    itemStatus.status === 'complete' 
                      ? 'border-green-200 bg-green-50/30' 
                      : 'border-yellow-200 bg-yellow-50/30'
                  }`}
                >
                  <div className="p-4">
                    {/* หัวรายการ */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {item.name || `รายการที่ ${index + 1}`}
                          </h4>
                          <p className="text-sm text-gray-500">
                            ราคา: {item.price.toLocaleString()} บาท
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={itemStatus.status === 'complete' ? 'default' : 'secondary'}
                          className={
                            itemStatus.status === 'complete' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }
                        >
                          <Users size={12} className="mr-1" />
                          {itemStatus.message}
                        </Badge>
                        {item.participants.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {(item.price / item.participants.length).toLocaleString()} บาท/คน
                          </Badge>
                        )}

                        {/* ปุ่ม เลือกทุกคน / ล้าง ต่อ "รายการอาหาร" */}
                        <div className="hidden sm:flex items-center space-x-1 ml-2">
                          <button
                            type="button"
                            onClick={() => handleSelectAllForItem(item)}
                            className="px-2 py-1 text-xs rounded border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                            title="เลือกทุกคนสำหรับรายการนี้"
                          >
                            เลือกทุกคน
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClearForItem(item)}
                            className="px-2 py-1 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                            title="ล้างผู้กินทั้งหมดของรายการนี้"
                          >
                            ล้าง
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* เลือกผู้เข้าร่วม */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        เลือกผู้ที่รับประทานรายการนี้:
                      </p>

                      {/* ปุ่มสำหรับจอเล็ก (ซ้ำกับด้านบน แต่โชว์บน mobile) */}
                      <div className="flex sm:hidden items-center space-x-2 mb-3">
                        <button
                          type="button"
                          onClick={() => handleSelectAllForItem(item)}
                          className="px-3 py-1.5 text-xs rounded border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                          title="เลือกทุกคนสำหรับรายการนี้"
                        >
                          เลือกทุกคน
                        </button>
                        <button
                          type="button"
                          onClick={() => handleClearForItem(item)}
                          className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                          title="ล้างผู้กินทั้งหมดของรายการนี้"
                        >
                          ล้าง
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {state.participants.map(participant => {
                          const isSelected = (item.participants || []).includes(participant.id);
                          
                          return (
                            <label 
                              key={participant.id} 
                              className={`flex items-center space-x-2 p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-sm ${
                                isSelected 
                                  ? 'bg-primary/5 border-primary/30 text-primary' 
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  const updatedParticipants = e.target.checked
                                    ? [...(item.participants || []), participant.id]
                                    : (item.participants || []).filter((id: string) => id !== participant.id);
                                  
                                  dispatch({
                                    type: 'UPDATE_FOOD_ITEM',
                                    payload: { ...item, participants: updatedParticipants }
                                  });
                                }}
                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                              />
                              <span className="text-sm font-medium">{participant.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <UtensilsCrossed className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">ไม่มีรายการอาหาร</h3>
            <p className="text-gray-500">โปรดย้อนกลับไปเพิ่มรายการอาหารก่อน</p>
          </div>
        )}

        {/* คำแนะนำเพิ่มเติม */}
        {state.foodItems.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">💡 เคล็ดลับ:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• เลือกหลายคนสำหรับรายการที่กินร่วมกัน ค่าใช้จ่ายจะแบ่งเท่าๆ กัน</li>
              <li>• แต่ละรายการต้องมีคนกินอย่างน้อย 1 คน</li>
              <li>• ตัวเลขข้างราคาแสดงค่าใช้จ่ายต่อคนในรายการนั้น</li>
            </ul>
          </div>
        )}
      </CardContent>
    </>
  );
}
