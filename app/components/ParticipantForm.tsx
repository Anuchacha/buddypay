'use client';

import React, { useState, useCallback } from 'react';
import { Participant } from '../lib/schema';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

type ParticipantFormProps = {
  participant: Participant;
  onUpdate: (updatedParticipant: Participant) => void;
  onRemove: (id: string) => void;
};

function ParticipantForm({
  participant,
  onUpdate,
  onRemove,
}: ParticipantFormProps) {
  const [nameError, setNameError] = useState('');

  // ใช้ useCallback เพื่อป้องกันการสร้างฟังก์ชันใหม่ทุกครั้งที่ re-render
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    let error = '';
    
    if (!name) {
      error = 'ต้องระบุชื่อผู้เข้าร่วม';
    }
    
    setNameError(error);
    onUpdate({ ...participant, name });
  }, [participant, onUpdate]);

  // ใช้ useCallback สำหรับการเปลี่ยนสถานะ
  const handleStatusChange = useCallback((status: 'paid' | 'pending') => {
    onUpdate({ ...participant, status });
  }, [participant, onUpdate]);

  return (
    <Card className="border border-border">
      <CardHeader className="py-3 flex flex-row items-center justify-between">
        <h3 className="text-base font-medium">
          {participant.name || 'ผู้เข้าร่วมใหม่'}
        </h3>
        <Button 
          onClick={() => onRemove(participant.id)}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
          aria-label="ลบผู้เข้าร่วม"
        >
          <span className="sr-only">ลบผู้เข้าร่วม</span>
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
        <div>
          <Input
            label="ชื่อผู้เข้าร่วม"
            value={participant.name}
            onChange={handleNameChange}
            placeholder="ชื่อผู้เข้าร่วม"
            error={nameError}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            สถานะการชำระเงิน
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleStatusChange('pending')}
              className={`px-3 py-1.5 text-sm rounded-md border ${
                participant.status === 'pending'
                  ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              รอชำระ
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('paid')}
              className={`px-3 py-1.5 text-sm rounded-md border ${
                participant.status === 'paid'
                  ? 'bg-green-100 border-green-300 text-green-800'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              ชำระแล้ว
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ParticipantForm; 