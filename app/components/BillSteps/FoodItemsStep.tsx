import { useState, useEffect } from 'react';
import { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { BillState } from '../../lib/billTypes';
import FoodItemForm from '../../components/FoodItemForm';
import QuickAddFoodItemsModal from '../../components/QuickAddFoodItemsModal';

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

  // เปิด modal อัตโนมัติเมื่อมาถึง step นี้และยังไม่มีรายการอาหาร
  useEffect(() => {
    if (state.foodItems.length === 0) {
      setIsQuickAddModalOpen(true);
    }
  }, []); // เรียกทำงานเพียงครั้งเดียวเมื่อ component ถูกโหลด

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

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between bg-gray-50 border-b px-6 py-4">
        <CardTitle className="text-xl font-semibold flex items-center">
          <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">2</span>
          รายการอาหาร
        </CardTitle>
        <Button 
          onClick={() => setIsQuickAddModalOpen(true)} 
          size="sm" 
          className="bg-primary hover:bg-primary/90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /> 
          </svg>
          เพิ่มหลายรายการ
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-5 text-sm text-blue-700">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            เพิ่มรายการอาหารทั้งหมดที่คุณและเพื่อนสั่ง
          </p>
        </div>

        {/* ฟอร์มเพิ่มรายการอาหารแบบเร็ว */}
        <form onSubmit={handleQuickAdd} className="flex items-center space-x-2 mb-5">
          <div className="flex-1">
            <Input
              placeholder="ชื่ออาหาร เช่น ข้าวผัดหมู"
              value={quickAddName}
              onChange={(e) => setQuickAddName(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            เพิ่มรายการ
          </Button>
        </form>
        
        {state.foodItems.length > 0 ? (
          <div className="space-y-4">
            {state.foodItems.map((item) => (
              <FoodItemForm
                key={item.id}
                item={item}
                participants={state.participants}
                splitMethod={state.splitMethod}
                onUpdate={onUpdateFoodItem}
                onRemove={handleRemoveFoodItem}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                ยังไม่มีรายการอาหาร กดปุ่ม 'เพิ่มรายการ' เพื่อเพิ่มอาหารที่สั่ง
              </p>
              <Button 
                onClick={() => setIsQuickAddModalOpen(true)} 
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มรายการแรก
              </Button>
            </div>
          </div>
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