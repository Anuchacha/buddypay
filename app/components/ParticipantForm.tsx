'use client';

import React, { useState, useCallback } from 'react';
import { Participant } from '../lib/schema';
import { Card, CardHeader } from './ui/Card';
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
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(participant.name);
  const [nameError, setNameError] = useState('');

  // จัดการการเปลี่ยนชื่อ
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    if (!newName) {
      setNameError('ต้องระบุชื่อผู้เข้าร่วม');
    } else {
      setNameError('');
    }
  }, []);

  // บันทึกการแก้ไข
  const handleSave = useCallback(() => {
    if (!name.trim()) {
      setNameError('ต้องระบุชื่อผู้เข้าร่วม');
      return;
    }
    
    onUpdate({ ...participant, name: name.trim() });
    setIsEditing(false);
  }, [name, participant, onUpdate]);

  // ยกเลิกการแก้ไข
  const handleCancel = useCallback(() => {
    setName(participant.name);
    setNameError('');
    setIsEditing(false);
  }, [participant.name]);

  return (
    <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center flex-1">
          {isEditing ? (
            <div className="flex-1 mr-2">
              <Input
                value={name}
                onChange={handleNameChange}
                placeholder="ชื่อผู้เข้าร่วม"
                error={nameError}
                className="w-full"
              />
            </div>
          ) : (
            <h3 className="text-base font-medium">
              {participant.name || 'ผู้เข้าร่วมใหม่'}
            </h3>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {isEditing ? (
            <>
              <Button 
                onClick={handleSave}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </Button>
              <Button 
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-600 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setIsEditing(true)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </Button>
          )}
          
          <Button 
            onClick={() => onRemove(participant.id)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              width="16"
              height="16"
            >
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}

export default ParticipantForm; 