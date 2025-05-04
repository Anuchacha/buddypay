import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BillState } from '../../lib/billTypes';
import FoodItemForm from '../../components/FoodItemForm';
import QuickAddFoodItemsModal from '../../components/QuickAddFoodItemsModal';
import { Plus, AlertCircle, FileText, Trash2, Info, Coffee, ShoppingBag, DollarSign, Receipt, Calculator, ChevronRight } from 'lucide-react';

interface FoodItemsStepProps {
  state: BillState;
  addFoodItem: () => void;
  handleRemoveFoodItem: (id: string) => void;
  onUpdateFoodItem: (updated: any) => void;
}

export default function FoodItemsStep({
  state,
  addFoodItem,
  handleRemoveFoodItem,
  onUpdateFoodItem
}: FoodItemsStepProps) {
  const [quickAddName, setQuickAddName] = useState('');
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickAddName.trim()) {
      // เพิ่มรายการอาหารใหม่
      addFoodItem();
      
      // อัปเดตชื่อของรายการอาหารที่เพิ่งเพิ่ม
      if (state.foodItems.length > 0) {
        const latestItem = state.foodItems[state.foodItems.length - 1];
        onUpdateFoodItem({
          ...latestItem,
          name: quickAddName.trim()
        });
      }
      
      // ล้างฟอร์ม
      setQuickAddName('');
    }
  };

  // ฟังก์ชันเพิ่มรายการอาหารผ่าน modal
  const handleQuickAddFromModal = (name: string, price: number) => {
    // สร้างรายการอาหารใหม่ด้วยชื่อและราคาที่กำหนด
    const itemId = crypto.randomUUID();
    const newFoodItem = {
      id: itemId,
      name: name.trim(),
      price: price,
      participants: state.splitMethod === 'equal' 
        ? state.participants.map(p => p.id) 
        : []
    };
    
    // เรียกใช้ dispatch เพื่อเพิ่มรายการอาหารใหม่พร้อมข้อมูลเลย
    onUpdateFoodItem({
      ...newFoodItem,
      isNew: true
    });
  };

  // คำนวณยอดรวมและข้อมูลเพิ่มเติม
  const calculateSummary = () => {
    const subtotal = state.foodItems.reduce((sum, item) => sum + item.price, 0);
    const vatAmount = subtotal * state.vat / 100;
    const serviceChargeAmount = subtotal * state.serviceCharge / 100;
    const totalAmount = subtotal + vatAmount + serviceChargeAmount - state.discount;
    
    return {
      subtotal,
      vatAmount,
      serviceChargeAmount,
      totalAmount,
      itemCount: state.foodItems.length,
    };
  };

  const summary = calculateSummary();

  // แบ่งเป็นสีส้มเมื่อจำนวนรายการมากกว่า 5
  const getCountClassNames = () => {
    if (state.foodItems.length > 5) {
      return "bg-orange-500 text-white";
    }
    return "bg-primary text-white";
  };

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/20 to-primary/5 border-b px-6 py-4 sticky top-0 z-10">
        <CardTitle className="text-xl font-semibold flex items-center">
          <div className={`w-8 h-8 rounded-full ${getCountClassNames()} inline-flex items-center justify-center mr-2.5 text-sm shadow-sm`}>2</div>
          <span className="text-primary">รายการอาหาร</span>
          {state.foodItems.length > 0 && (
            <div className="ml-3 bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
              {state.foodItems.length} รายการ
            </div>
          )}
        </CardTitle>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={() => setIsQuickAddModalOpen(true)} 
            size="sm" 
            className="bg-primary hover:bg-primary/90 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 transform duration-200"
          >
            <ShoppingBag size={16} className="mr-1.5" />
            เพิ่มหลายรายการ
          </Button>
        </motion.div>
      </CardHeader>
      <CardContent className="p-6 pb-10">
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6 text-sm text-blue-700 flex items-start"
        >
          <Info size={18} className="mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
          <p>เพิ่มรายการอาหารทั้งหมดที่คุณและเพื่อนสั่ง เพื่อคำนวณการแชร์บิลที่ถูกต้อง</p>
        </motion.div>

        {state.foodItems.length > 0 ? (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="grid grid-cols-12 gap-2 py-3 px-4 bg-gray-100 border-b text-sm font-medium text-gray-700">
                <div className="col-span-5">รายการอาหาร</div>
                <div className="col-span-3 text-center">ราคา (บาท)</div>
                <div className="col-span-4 text-center">จัดการ</div>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
                <AnimatePresence>
                  {state.foodItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, overflow: "hidden", y: -20 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.05,
                        layout: { duration: 0.2 } 
                      }}
                      layout
                      className="odd:bg-white even:bg-gray-50 hover:bg-blue-50/50 transition-colors"
                    >
                      <FoodItemForm
                        item={item}
                        participants={state.participants}
                        splitMethod={state.splitMethod}
                        onUpdate={onUpdateFoodItem}
                        onRemove={handleRemoveFoodItem}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            
            {/* สรุปยอดรวม - แสดงเป็น card */}
            <motion.div 
              className="mt-8 bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-medium text-gray-800 flex items-center">
                  <Receipt className="w-5 h-5 mr-2 text-primary" />
                  สรุปยอดรวมค่าอาหาร
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSummary(!showSummary)}
                  className="text-xs text-primary hover:text-primary/80 hover:bg-primary/10 p-2"
                >
                  {showSummary ? 'ซ่อนรายละเอียด' : 'แสดงรายละเอียด'}
                  <ChevronRight className={`w-4 h-4 ml-1 transition-transform duration-200 ${showSummary ? 'rotate-90' : ''}`} />
                </Button>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center text-gray-700 font-medium">
                    <Calculator className="w-4 h-4 mr-1.5 text-primary" />
                    รายการอาหารทั้งหมด
                  </div>
                  <div className="text-gray-800 font-medium">
                    {summary.itemCount} รายการ
                  </div>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b border-dashed border-gray-200">
                  <div className="flex items-center text-gray-700 font-medium">
                    <DollarSign className="w-4 h-4 mr-1.5 text-primary" />
                    ราคารวมค่าอาหาร
                  </div>
                  <div className="text-gray-800 font-semibold">
                    {summary.subtotal.toLocaleString()} บาท
                  </div>
                </div>
                
                <AnimatePresence>
                  {showSummary && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      {summary.vatAmount > 0 && (
                        <div className="flex justify-between items-center mt-3 text-sm">
                          <div className="text-gray-600">ภาษีมูลค่าเพิ่ม {state.vat}%</div>
                          <div className="text-gray-800">+ {summary.vatAmount.toLocaleString()} บาท</div>
                        </div>
                      )}
                      
                      {summary.serviceChargeAmount > 0 && (
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <div className="text-gray-600">ค่าบริการ {state.serviceCharge}%</div>
                          <div className="text-gray-800">+ {summary.serviceChargeAmount.toLocaleString()} บาท</div>
                        </div>
                      )}
                      
                      {state.discount > 0 && (
                        <div className="flex justify-between items-center mt-2 text-sm">
                          <div className="text-gray-600">ส่วนลด</div>
                          <div className="text-red-600">- {state.discount.toLocaleString()} บาท</div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-lg font-medium text-gray-700">ยอดรวมทั้งหมด</div>
                  <div className="text-xl text-primary font-bold">
                    {summary.totalAmount.toLocaleString()} บาท
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* ปุ่มเพิ่มรายการ */}
            <motion.div 
              className="mt-6 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                variant="outline" 
                onClick={() => setIsQuickAddModalOpen(true)} 
                className="border-dashed border-gray-300 hover:border-primary/70 hover:bg-primary/5 transition-all duration-200"
              >
                <Plus size={18} className="mr-1.5 text-primary" />
                เพิ่มรายการอาหาร
              </Button>
            </motion.div>
          </div>
        ) : (
          <motion.div 
            className="text-center py-16 px-6 bg-gray-50 rounded-xl border border-dashed border-gray-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Coffee className="h-16 w-16 mx-auto text-primary/20 mb-4" />
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">ยังไม่มีรายการอาหาร</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                กดปุ่ม 'เพิ่มรายการแรก' เพื่อเริ่มต้นเพิ่มรายการอาหารที่สั่ง
              </p>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => setIsQuickAddModalOpen(true)} 
                  className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 duration-200"
                >
                  <Plus size={18} className="mr-1.5" />
                  เพิ่มรายการแรก
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </CardContent>

      {/* Modal เพิ่มรายการอาหารแบบต่อเนื่อง */}
      <QuickAddFoodItemsModal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        onAdd={handleQuickAddFromModal}
        currentCount={state.foodItems.length}
      />
    </>
  );
} 