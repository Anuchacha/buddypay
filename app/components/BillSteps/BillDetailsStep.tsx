import { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { BillState } from '../../lib/billTypes';
import { CategorySelect } from '../../../CategorySelect';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, FileText, Info, LucideIcon, Receipt, Utensils, Coffee, ShoppingBag, Film, Pizza, Car, Droplet, Martini } from 'lucide-react';

interface BillDetailsStepProps {
  state: BillState;
  dispatch: React.Dispatch<any>;
  promptPayId: string;
  setPromptPayId: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
}

type BillTemplate = {
  name: string;
  icon: LucideIcon;
  color: string;
}

export default function BillDetailsStep({
  state,
  dispatch,
  promptPayId,
  setPromptPayId,
  notes,
  setNotes
}: BillDetailsStepProps) {
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);

  const billTemplates: BillTemplate[] = [
    { name: 'อาหารกลางวัน', icon: Utensils, color: 'text-orange-500' },
    { name: 'อาหารเย็น', icon: Utensils, color: 'text-blue-500' },
    { name: 'ร้านอาหารญี่ปุ่น', icon: Utensils, color: 'text-red-500' },
    { name: 'คาเฟ่', icon: Coffee, color: 'text-amber-600' },
    { name: 'พิซซ่า', icon: Pizza, color: 'text-red-500' },
    { name: 'ค่าเดินทาง', icon: Car, color: 'text-blue-600' },
    { name: 'หนัง', icon: Film, color: 'text-purple-500' },
    { name: 'ค่าน้ำ/ไฟ', icon: Droplet, color: 'text-cyan-500' },
    { name: 'ปาร์ตี้', icon: Martini, color: 'text-pink-500' },
    { name: 'ช้อปปิ้ง', icon: ShoppingBag, color: 'text-green-500' },
  ];

  const handleSelectTemplate = (template: string) => {
    dispatch({ type: 'SET_BILL_NAME', payload: template });
    setIsTemplateOpen(false);
  };

  return (
    <>
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b px-6 py-4">
        <CardTitle className="text-xl font-semibold flex items-center">
          <span className="bg-primary text-white rounded-full w-7 h-7 inline-flex items-center justify-center mr-2.5 text-sm shadow-sm">4</span>
          <span className="text-primary/90">ข้อมูลบิล</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6 text-sm text-blue-700 flex items-start"
        >
          <Info size={18} className="mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
          <p>ตั้งชื่อบิลและกรอกรายละเอียดเพิ่มเติม สามารถเลือกจากตัวเลือกด่านบนได้</p>
        </motion.div>
        
        <div>
          <label className="block text-sm font-medium mb-1.5 text-gray-700">ชื่อบิล <span className="text-red-500">*</span></label>
          
          {/* Template Selector */}
          <div className="mb-3 relative">
            <button
              type="button"
              onClick={() => setIsTemplateOpen(!isTemplateOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm transition-all"
            >
              <div className="flex items-center">
                <Receipt size={16} className="mr-2 text-primary" />
                <span>เลือกชื่อบิลอัตโนมัติ</span>
              </div>
              <ChevronDown size={16} className={`transition-transform duration-200 ${isTemplateOpen ? 'transform rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isTemplateOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg"
                >
                  <div className="grid grid-cols-2 gap-1 p-2 max-h-72 overflow-y-auto">
                    {billTemplates.map((template, index) => {
                      const Icon = template.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => handleSelectTemplate(template.name)}
                          className="flex items-center px-3 py-2 text-sm hover:bg-gray-50 rounded-md transition-colors w-full text-left group"
                        >
                          <span className={`p-1.5 rounded-md mr-2 bg-gray-100 group-hover:bg-gray-200 ${template.color}`}>
                            <Icon size={16} />
                          </span>
                          <span>{template.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <FileText size={16} />
            </span>
            <Input
              placeholder="ชื่อบิล เช่น อาหารกลางวัน, ทานข้าวร้าน ABC"
              value={state.billName}
              onChange={(e) => dispatch({ type: 'SET_BILL_NAME', payload: e.target.value })}
              className="pl-10 focus:ring-2 focus:ring-primary/20"
            />
          </div>
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