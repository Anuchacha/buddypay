'use client';

import React, { useState, useCallback } from 'react';
import { Participant, FoodItem } from '../lib/schema';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

type FoodItemFormProps = {
  item: FoodItem;
  participants: Participant[];
  splitMethod: 'equal' | 'itemized';
  onUpdate: (updatedItem: FoodItem) => void;
  onRemove: (id: string) => void;
};

export default function FoodItemForm({
  item,
  participants,
  splitMethod,
  onUpdate,
  onRemove,
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

  const handleParticipantsChange = (participantId: string) => {
    const isSelected = item.participants.includes(participantId);
    const newParticipants = isSelected
      ? item.participants.filter(id => id !== participantId)
      : [...item.participants, participantId];
    
    onUpdate({ ...item, participants: newParticipants });
  };

  // เมื่อใช้วิธีหารเท่ากัน ให้เลือกผู้เข้าร่วมทุกคนโดยอัตโนมัติ
  const isEqualSplit = splitMethod === 'equal';

  return (
    <Card className="border border-border">
      <CardHeader className="py-3 flex flex-row items-center justify-between">
        <h3 className="text-base font-medium">รายการอาหาร</h3>
        <Button 
          onClick={() => onRemove(item.id)}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
          aria-label="ลบรายการอาหาร"
        >
          <span className="sr-only">ลบรายการอาหาร</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-4 w-4"
          >
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="ชื่ออาหาร"
            value={item.name}
            onChange={handleNameChange}
            placeholder="ระบุชื่ออาหาร"
            error={nameError}
          />

          <Input
            label="ราคา (บาท)"
            type="number"
            value={item.price ? item.price.toString() : ''}
            onChange={handlePriceChange}
            placeholder="0.00"
            min={0}
            step={0.01}
            error={priceError}
          />
        </div>

        {!isEqualSplit && (
          <div className="pt-4 mt-2 border-t border-border">
            <label className="block text-sm font-medium mb-2">
              ผู้ที่กินอาหารจานนี้
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`food-${item.id}-participant-${participant.id}`}
                    checked={isEqualSplit || item.participants.includes(participant.id)}
                    onChange={() => handleParticipantsChange(participant.id)}
                    disabled={isEqualSplit}
                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  />
                  <label
                    htmlFor={`food-${item.id}-participant-${participant.id}`}
                    className={`ml-2 text-sm ${isEqualSplit ? 'text-muted-foreground' : ''}`}
                  >
                    {participant.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 