import { useState } from 'react';
import { CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BillState } from '../../lib/billTypes';
import ParticipantForm from '../../components/ParticipantForm';

interface ParticipantsStepProps {
  state: BillState;
  addParticipant: () => void;
  handleRemoveParticipant: (id: string) => void;
  onUpdateParticipant: (updated: any) => void;
}

export default function ParticipantsStep({
  state,
  addParticipant,
  handleRemoveParticipant,
  onUpdateParticipant
}: ParticipantsStepProps) {
  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between bg-gray-50 border-b px-6 py-4">
        <CardTitle className="text-xl font-semibold flex items-center">
          <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">1</span>
          ผู้เข้าร่วม
        </CardTitle>
        <Button onClick={addParticipant} size="sm" className="bg-primary hover:bg-primary/90">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          เพิ่มคน
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-4 text-sm text-blue-700">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            เพิ่มชื่อทุกคนที่ร่วมรับประทานอาหาร
          </p>
        </div>
        {state.participants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-muted-foreground">
              ยังไม่มีผู้เข้าร่วม กดปุ่ม 'เพิ่มคน' เพื่อเริ่มต้น
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {state.participants.map((participant) => (
              <ParticipantForm
                key={participant.id}
                participant={participant}
                onUpdate={onUpdateParticipant}
                onRemove={handleRemoveParticipant}
              />
            ))}
          </div>
        )}
      </CardContent>
    </>
  );
} 