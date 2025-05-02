import { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { BillState } from '../../lib/billTypes';
import { CategorySelect } from '../../../CategorySelect';

interface BillDetailsStepProps {
  state: BillState;
  dispatch: React.Dispatch<any>;
  promptPayId: string;
  setPromptPayId: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
}

export default function BillDetailsStep({
  state,
  dispatch,
  promptPayId,
  setPromptPayId,
  notes,
  setNotes
}: BillDetailsStepProps) {
  return (
    <>
      <CardHeader className="bg-gray-50 border-b px-6 py-4">
        <CardTitle className="text-xl font-semibold flex items-center">
          <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">4</span>
          ข้อมูลบิล
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-5 text-sm text-blue-700">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            ตั้งชื่อบิลและกรอกรายละเอียดเพิ่มเติม
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-700">ชื่อบิล <span className="text-red-500">*</span></label>
          <Input
            placeholder="ชื่อบิล เช่น อาหารกลางวัน, ทานข้าวร้าน ABC"
            value={state.billName}
            onChange={(e) => dispatch({ type: 'SET_BILL_NAME', payload: e.target.value })}
            className="focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-xs text-gray-500 mt-1">ตั้งชื่อบิลให้จำง่าย เช่น "ข้าวมันไก่ตอนเที่ยง" หรือ "ร้าน ABC วันเสาร์"</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-700">หมวดหมู่</label>
          <CategorySelect 
            selectedId={state.categoryId}
            onChange={(id) => dispatch({ type: 'SET_CATEGORY_ID', payload: id })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-700">โน๊ต</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3v4a1 1 0 0 0 1 1h4"></path>
                <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path>
              </svg>
            </span>
            <Input
              placeholder="เพิ่มโน๊ตหรือหมายเหตุเพิ่มเติม (ถ้ามี)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="pl-10 focus:ring-2 focus:ring-primary/20 bg-amber-50 focus:bg-white transition-colors border-dashed"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            เพิ่มข้อความที่ต้องการให้แสดงในใบเสร็จ เช่น "รบกวนนำเงินมาคืนภายในวันที่ XX" 
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">VAT (%)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={state.vat.toString()}
              onChange={(e) => dispatch({ type: 'SET_VAT', payload: parseFloat(e.target.value) || 0 })}
              className="focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-gray-500 mt-1">ภาษีมูลค่าเพิ่ม เช่น 7%</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">ค่าบริการ (%)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={state.serviceCharge.toString()}
              onChange={(e) => dispatch({ type: 'SET_SERVICE_CHARGE', payload: parseFloat(e.target.value) || 0 })}
              className="focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-gray-500 mt-1">ค่าบริการร้าน เช่น 10%</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">ส่วนลด (บาท)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={state.discount.toString()}
              onChange={(e) => dispatch({ type: 'SET_DISCOUNT', payload: parseFloat(e.target.value) || 0 })}
              className="focus:ring-2 focus:ring-primary/20"
            />
            <p className="text-xs text-gray-500 mt-1">ส่วนลดเป็นจำนวนเงิน</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-700">พร้อมเพย์ (ไม่จำเป็นต้องกรอก)</label>
          <Input
            placeholder="กรอกเบอร์โทรศัพท์ (10 หลัก) หรือ เลขบัตรประชาชน (13 หลัก)"
            value={promptPayId}
            onChange={(e) => setPromptPayId(e.target.value)}
            className="w-full focus:ring-2 focus:ring-primary/20"
          />
          {promptPayId && promptPayId.replace(/[^0-9]/g, '').length !== 10 && promptPayId.replace(/[^0-9]/g, '').length !== 13 && (
            <p className="text-xs text-red-500 mt-1">กรุณากรอกเบอร์โทรศัพท์ 10 หลักหรือเลขประจำตัวประชาชน 13 หลัก</p>
          )}
          {promptPayId && (promptPayId.replace(/[^0-9]/g, '').length === 10 || promptPayId.replace(/[^0-9]/g, '').length === 13) && (
            <p className="text-xs text-green-500 mt-1">QR Code สร้างเรียบร้อยแล้ว! จะปรากฏในใบเสร็จ</p>
          )}
        </div>
      </CardContent>
    </>
  );
} 