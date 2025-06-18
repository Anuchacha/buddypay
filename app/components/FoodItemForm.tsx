'use client';

import React, { useState } from 'react';
import { FoodItem } from '../lib/schema';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Trash2 } from 'lucide-react';

type FoodItemFormProps = {
  item: FoodItem;
  onUpdate: (updatedItem: FoodItem) => void;
  onRemove: (id: string) => void;
  index: number;
};

export default function FoodItemForm({
  item,
  onUpdate,
  onRemove,
  index,
}: FoodItemFormProps) {
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    let error = '';
    
    if (!name) {
      error = 'ต้องระบุชื่ออาหาร';
    }
    
    setNameError(error);
    onUpdate({ ...item, name });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const price = parseFloat(e.target.value || '0');
    let error = '';
    
    if (price < 0) {
      error = 'ราคาต้องไม่เป็นลบ';
    }
    
    setPriceError(error);
    onUpdate({ ...item, price });
  };

  return (
    <div className="grid grid-cols-12 gap-4 py-4 px-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
      {/* ลำดับที่ */}
      <div className="col-span-1 flex items-center">
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
          {index + 1}
        </div>
      </div>

      {/* ชื่ออาหาร */}
      <div className="col-span-7">
        <Input
          value={item.name}
          onChange={handleNameChange}
          placeholder="ระบุชื่ออาหาร"
          error={nameError}
          className="border-0 shadow-none focus:ring-1 focus:ring-primary/20 bg-transparent"
        />
      </div>

      {/* ราคา */}
      <div className="col-span-3">
        <Input
          type="number"
          value={item.price ? item.price.toString() : ''}
          onChange={handlePriceChange}
          placeholder="0.00"
          min={0}
          step={0.01}
          error={priceError}
          className="border-0 shadow-none focus:ring-1 focus:ring-primary/20 bg-transparent text-right"
        />
      </div>

      {/* ปุ่มลบ */}
      <div className="col-span-1 flex items-center justify-center">
        <Button 
          onClick={() => onRemove(item.id)}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="ลบรายการอาหาร"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 