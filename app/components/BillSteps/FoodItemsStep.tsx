import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BillState } from '../../lib/billTypes';
import FoodItemForm from '../../components/FoodItemForm';
import QuickAddFoodItemsModal from '../../components/QuickAddFoodItemsModal';
import { Plus, AlertCircle, FileText, Trash2, Info, Coffee, ShoppingBag, DollarSign } from 'lucide-react';

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

  // คำนวณยอดรวม
  const calculateTotal = () => {
    return state.foodItems.reduce((sum, item) => sum + item.price, 0);
  };

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 border-b px-6 py-4">
        <CardTitle className="text-xl font-semibold flex items-center">
          <span className="bg-primary text-white rounded-full w-7 h-7 inline-flex items-center justify-center mr-2.5 text-sm shadow-sm">2</span>
          <span className="text-primary/90">รายการอาหาร</span>
        </CardTitle>
        <Button 
          onClick={() => setIsQuickAddModalOpen(true)} 
          size="sm" 
          className="bg-primary hover:bg-primary/90 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 transform duration-200"
        >
          <ShoppingBag size={16} className="mr-1.5" />
          เพิ่มหลายรายการ
        </Button>
      </CardHeader>
      <CardContent className="p-6">
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
          <div className="space-y-1">
            <div className="grid grid-cols-12 gap-2 mb-3 text-sm font-medium text-gray-600 px-3">
              <div className="col-span-5">รายการอาหาร</div>
              <div className="col-span-3 text-center">ราคา (บาท)</div>
              <div className="col-span-1 text-right"></div>
            </div>
            
            <AnimatePresence>
              {state.foodItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
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
            
            {/* สรุปยอดรวม */}
            <motion.div 
              className="flex justify-between items-center mt-6 pt-4 border-t border-dashed border-gray-200 text-lg font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center text-gray-700">
                <DollarSign size={18} className="mr-1.5 text-primary" />
                ยอดรวมทั้งหมด
              </div>
              <div className="text-xl text-primary font-semibold">
                {calculateTotal().toLocaleString()} บาท
              </div>
            </motion.div>
            
            {/* ปุ่มเพิ่มรายการ */}
            <motion.div 
              className="mt-5 flex justify-center"
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
            className="text-center py-12 px-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Coffee className="h-14 w-14 mx-auto text-primary/30 mb-4" />
            <div className="space-y-3">
              <p className="text-gray-500 max-w-md mx-auto">
                ยังไม่มีรายการอาหาร กดปุ่ม 'เพิ่มรายการ' เพื่อเพิ่มอาหารที่สั่ง
              </p>
              <Button 
                onClick={() => setIsQuickAddModalOpen(true)} 
                className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 duration-200"
              >
                <Plus size={18} className="mr-1.5" />
                เพิ่มรายการแรก
              </Button>
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