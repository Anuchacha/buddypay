import { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { BillState } from '../../lib/billTypes';

interface SplitMethodStepProps {
  state: BillState;
  dispatch: React.Dispatch<any>;
}

export default function SplitMethodStep({
  state,
  dispatch
}: SplitMethodStepProps) {
  return (
    <>
      <CardHeader className="bg-gray-50 border-b px-6 py-4">
        <CardTitle className="text-xl font-semibold flex items-center">
          <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">3</span>
          วิธีการหารบิล
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-5 text-sm text-blue-700">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            เลือกวิธีการหารบิลที่ต้องการ
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700">
            วิธีการหารบิล
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-start p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                checked={state.splitMethod === 'equal'}
                onChange={() => {
                  dispatch({ type: 'SET_SPLIT_METHOD', payload: 'equal' });
                  if (state.participants.length > 0) {
                    const participantIds = state.participants.map(p => p.id);
                    const updatedFoodItems = state.foodItems.map(item => ({
                      ...item,
                      participants: participantIds
                    }));
                    dispatch({ type: 'SET_FOOD_ITEMS', payload: updatedFoodItems });
                  }
                }}
                className="h-4 w-4 text-primary border-border focus:ring-primary cursor-pointer mt-0.5"
              />
              <div className="ml-3">
                <span className="block text-sm font-medium">หารเท่ากันทุกคน</span>
                <span className="block text-xs text-gray-500 mt-1">แบ่งค่าอาหารเป็นจำนวนเท่าๆ กันตามจำนวนคน ทุกคนจ่ายเท่ากันหมด</span>
              </div>
            </label>
            
            <label className="flex items-start p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                checked={state.splitMethod === 'itemized'}
                onChange={() => {
                  dispatch({ type: 'SET_SPLIT_METHOD', payload: 'itemized' });
                }}
                className="h-4 w-4 text-primary border-border focus:ring-primary cursor-pointer mt-0.5"
              />
              <div className="ml-3">
                <span className="block text-sm font-medium">หารตามรายการที่สั่ง</span>
                <span className="block text-xs text-gray-500 mt-1">แบ่งค่าอาหารตามรายการที่แต่ละคนสั่ง คุณต้องเลือกว่าใครกินอะไรบ้าง</span>
              </div>
            </label>
          </div>
        </div>
        
        {state.splitMethod === 'itemized' && (
          <>
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-md p-3 text-sm text-blue-700">
              <p className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>เลือกว่าใครกินรายการอาหารไหนบ้าง โดยทำเครื่องหมายในช่องผู้ที่กินอาหารในรายการนั้นๆ</span>
              </p>
            </div>
            
            <div className="space-y-4 mt-4">
              <h3 className="text-lg font-medium">รายการอาหารทั้งหมด</h3>
              
              {state.foodItems.length > 0 ? (
                state.foodItems.map((item, index) => (
                  <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{item.name || `รายการที่ ${index + 1}`}</h4>
                        <span className="font-medium">{item.price} บาท</span>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">เลือกผู้ที่รับประทานรายการนี้:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {state.participants.map(participant => (
                            <label key={participant.id} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors">
                              <input
                                type="checkbox"
                                checked={item.participants.includes(participant.id)}
                                onChange={(e) => {
                                  const updatedParticipants = e.target.checked
                                    ? [...item.participants, participant.id]
                                    : item.participants.filter(id => id !== participant.id);
                                  
                                  dispatch({
                                    type: 'UPDATE_FOOD_ITEM',
                                    payload: { ...item, participants: updatedParticipants }
                                  });
                                }}
                                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                              />
                              <span className="text-sm">{participant.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">ไม่มีรายการอาหาร โปรดย้อนกลับไปเพิ่มรายการก่อน</p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </>
  );
} 