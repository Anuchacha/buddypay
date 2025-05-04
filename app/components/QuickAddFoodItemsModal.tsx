'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { X } from 'lucide-react';

interface QuickAddFoodItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, price: number) => void;
  currentCount: number;
}

export default function QuickAddFoodItemsModal({
  isOpen,
  onClose,
  onAdd,
  currentCount,
}: QuickAddFoodItemsModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [count, setCount] = useState(currentCount + 1);
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // เมื่อ modal เปิด ให้ focus ที่ช่องกรอกข้อมูล
    if (isOpen && nameInputRef.current) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
    setCount(currentCount + 1);
  }, [isOpen, currentCount]);

  const validateInput = (): boolean => {
    let isValid = true;
    
    // ตรวจสอบชื่ออาหาร
    if (!name.trim()) {
      setNameError('กรุณาระบุชื่ออาหาร');
      isValid = false;
    } else {
      setNameError('');
    }
    
    // ตรวจสอบราคา
    if (!price.trim()) {
      setPriceError('กรุณาระบุราคา');
      isValid = false;
    } else {
      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue <= 0) {
        setPriceError('ราคาต้องเป็นตัวเลขที่มากกว่า 0');
        isValid = false;
      } else {
        setPriceError('');
      }
    }
    
    return isValid;
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateInput()) {
      onAdd(name.trim(), parseFloat(price));
      setName('');
      setPrice('');
      setCount(prev => prev + 1);
      
      // Focus กลับไปที่ช่องกรอกชื่ออาหารเพื่อให้เพิ่มรายการต่อไปได้เลย
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          className="relative z-10 w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-5 text-white">
            <h2 className="text-xl font-bold">เพิ่มรายการอาหาร</h2>
            <p className="mt-1 text-sm opacity-90">
              เพิ่มรายการอาหารทีละรายการ กดปุ่ม "เพิ่มและไปต่อ" เพื่อเพิ่มรายการถัดไป
            </p>
          </div>
          
          {/* Content */}
          <div className="p-5">
            <form onSubmit={handleAdd} className="space-y-4">
              <Input
                ref={nameInputRef}
                label={`รายการอาหารที่ ${count}`}
                placeholder="ชื่ออาหาร เช่น ข้าวผัดหมู"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={nameError}
                required
              />
              
              <Input
                label="ราคา (บาท)"
                placeholder="ราคา เช่น 80"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                error={priceError}
                required
              />
              
              <div className="flex space-x-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={!name.trim() || !price.trim()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  เพิ่มและไปต่อ
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  เสร็จสิ้น
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 