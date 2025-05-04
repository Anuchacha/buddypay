import { useState, useEffect } from 'react';
import { CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BillState } from '../../lib/billTypes';
import ParticipantForm from '../../components/ParticipantForm';
import { Input } from '../../components/ui/Input';
import QuickAddParticipantsModal from '../../components/QuickAddParticipantsModal';

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
  const [quickAddName, setQuickAddName] = useState('');
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // ตรวจสอบว่ามีผู้เข้าร่วมที่ยังไม่มีชื่อหรือไม่
    const hasInvalidParticipants = state.participants.some(p => !p.name.trim());
    
    if (hasInvalidParticipants) {
      setErrorMessage('มีผู้เข้าร่วมที่ยังไม่ได้ระบุชื่อ กรุณาแก้ไขหรือลบออก');
    } else {
      setErrorMessage('');
    }
  }, [state.participants]);

  // เปิด modal อัตโนมัติเมื่อมาถึง step นี้และยังไม่มีผู้เข้าร่วม
  useEffect(() => {
    // ตรวจสอบว่าไม่มีผู้เข้าร่วมและเปิด modal
    if (state.participants.length === 0) {
      setIsQuickAddModalOpen(true);
    }
  }, []); // เรียกทำงานเพียงครั้งเดียวเมื่อ component ถูกโหลด

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickAddName.trim()) {
      // เพิ่มผู้เข้าร่วมใหม่
      addParticipant();
      
      // อัปเดตชื่อของผู้เข้าร่วมที่เพิ่งเพิ่ม (คนล่าสุดในอาร์เรย์)
      if (state.participants.length > 0) {
        const latestParticipant = state.participants[state.participants.length - 1];
        onUpdateParticipant({
          ...latestParticipant,
          name: quickAddName.trim()
        });
      }
      
      // ล้างฟอร์ม
      setQuickAddName('');
    }
  };

  // ฟังก์ชันเพิ่มรายชื่อผ่าน modal
  const handleQuickAddFromModal = (name: string) => {
    // เพิ่มผู้เข้าร่วมใหม่จาก modal โดยส่งชื่อไปด้วยเลย
    // วิธีแก้ปัญหา: ให้สร้างผู้เข้าร่วมใหม่ด้วยชื่อที่กำหนดเลย โดยไม่ต้องรอ state update
    
    // 1. สร้าง participant object ใหม่ด้วยชื่อที่ผู้ใช้กรอก
    const participantId = crypto.randomUUID(); // สร้าง ID ใหม่
    const newParticipant = {
      id: participantId,
      name: name.trim(),
      status: 'pending' as const
    };
    
    // 2. เรียกใช้ dispatch เพื่อเพิ่มผู้เข้าร่วมใหม่พร้อมชื่อเลย
    onUpdateParticipant({
      ...newParticipant,
      isNew: true // แอดแฟล็กพิเศษเพื่อให้ reducer รู้ว่าต้องเพิ่มใหม่
    });
  };

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between bg-gray-50 border-b px-6 py-4">
        <CardTitle className="text-xl font-semibold flex items-center">
          <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">1</span>
          ผู้เข้าร่วม
        </CardTitle>
        
        {/* เพิ่มปุ่มเปิด QuickAdd Modal */}
        <Button 
          onClick={() => setIsQuickAddModalOpen(true)}
          size="sm" 
          className="bg-primary hover:bg-primary/90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          เพิ่มหลายคน
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            <p className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errorMessage}
            </p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-md p-3 mb-4 text-sm text-blue-700">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            เพิ่มชื่อทุกคนที่ร่วมรับประทานอาหาร
          </p>
        </div>

        {/* ฟอร์มเพิ่มรายชื่อแบบเร็ว */}
        <form onSubmit={handleQuickAdd} className="flex items-center space-x-2 mb-4">
          <div className="flex-1">
            <Input
              placeholder="ใส่ชื่อผู้เข้าร่วม"
              value={quickAddName}
              onChange={(e) => setQuickAddName(e.target.value)}
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90"
            disabled={!quickAddName.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            เพิ่มคน
          </Button>
        </form>

        {state.participants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-muted-foreground">
              ยังไม่มีผู้เข้าร่วม กรุณาป้อนชื่อและกดปุ่ม "เพิ่มคน"
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

      {/* Modal เพิ่มรายชื่อแบบต่อเนื่อง */}
      <QuickAddParticipantsModal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        onAdd={handleQuickAddFromModal}
        currentCount={state.participants.length}
      />
    </>
  );
} 