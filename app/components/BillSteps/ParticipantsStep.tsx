import { useState, useEffect } from 'react';
import { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { BillState } from '../../lib/billTypes';
import ParticipantForm from '../../components/ParticipantForm';

import QuickAddParticipantsModal from '../../components/QuickAddParticipantsModal';
import SaveGroupModal from '../../components/SaveGroupModal';
import SelectGroupModal from '../../components/SelectGroupModal';
import { ParticipantGroup } from '../../lib/types/participantGroup';
import { useAuth } from '../../context/AuthContext';
import { Users, Save, List } from 'lucide-react';

interface ParticipantsStepProps {
  state: BillState;
  handleRemoveParticipant: (id: string) => void;
  onUpdateParticipant: (updated: any) => void;
  savedGroups: ParticipantGroup[];
  onSaveGroup: (name: string, description?: string) => void;
  onSelectGroup: (groupId: string) => void;
}

export default function ParticipantsStep({
  state,
  handleRemoveParticipant,
  onUpdateParticipant,
  savedGroups,
  onSaveGroup,
  onSelectGroup
}: ParticipantsStepProps) {
  const { isAuthenticated } = useAuth();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSaveGroupOpen, setIsSaveGroupOpen] = useState(false);
  const [isSelectGroupOpen, setIsSelectGroupOpen] = useState(false);
  const [error, setError] = useState('');

  // เช็คความถูกต้องของข้อมูล
  useEffect(() => {
    const invalidParticipants = state.participants.filter(p => !p.name || p.name.trim() === '');
    
    if (invalidParticipants.length > 0) {
      setError('กรุณาระบุชื่อผู้เข้าร่วมให้ครบถ้วน');
    } else {
      setError('');
    }
  }, [state.participants]);

  // ฟังก์ชันสำหรับเพิ่มผู้เข้าร่วมอย่างรวดเร็ว
  const handleQuickAdd = (name: string) => {
    onUpdateParticipant({
      id: Date.now().toString(),
      name,
      status: 'pending',
      isNew: true,
    });
  };

  return (
    <>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users size={18} />
            <span>รายชื่อผู้เข้าร่วม</span>
          </CardTitle>
          
          {/* ปุ่มเพิ่มกลุ่มและเลือกกลุ่ม */}
          {isAuthenticated && (
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsSaveGroupOpen(true)}
                disabled={state.participants.length === 0}
                title="บันทึกรายชื่อเป็นกลุ่ม"
              >
                <Save size={16} className="mr-1" />
                <span className="hidden sm:inline">บันทึกกลุ่ม</span>
              </Button>
              
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setIsSelectGroupOpen(true)}
                title="เลือกกลุ่มที่บันทึกไว้"
              >
                <List size={16} className="mr-1" />
                <span className="hidden sm:inline">เลือกกลุ่ม</span>
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-2 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {state.participants.length === 0 ? (
          <div className="text-center p-6 bg-blue-50 rounded-md">
            <p className="mb-2 text-blue-600">ยังไม่มีผู้เข้าร่วม</p>
            <p className="text-sm text-blue-500 mb-4">กดปุ่มเพิ่มผู้เข้าร่วมหรือเลือกจากกลุ่มที่บันทึกไว้</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button 
                onClick={() => setIsQuickAddOpen(true)} 
                variant="outline" 
                size="sm"
              >
                เพิ่มผู้เข้าร่วม
              </Button>
              
              {isAuthenticated && savedGroups?.length > 0 && (
                <Button 
                  onClick={() => setIsSelectGroupOpen(true)} 
                  variant="outline" 
                  size="sm"
                >
                  <List size={16} className="mr-1.5" />
                  เลือกจากกลุ่ม
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-4">
              {state.participants.map(participant => (
                <ParticipantForm
                  key={participant.id}
                  participant={participant}
                  onUpdate={onUpdateParticipant}
                  onRemove={handleRemoveParticipant}
                />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
           
              <Button
                onClick={() => setIsQuickAddOpen(true)}
                variant="outline"
              >
                เพิ่มผู้เข้าร่วม
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {/* Modal เพิ่มผู้เข้าร่วมแบบรวดเร็ว */}
      <QuickAddParticipantsModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAdd={handleQuickAdd}
        currentCount={state.participants.length}
      />
      
      {/* Modal บันทึกกลุ่ม */}
      <SaveGroupModal
        isOpen={isSaveGroupOpen}
        onClose={() => setIsSaveGroupOpen(false)}
        onSave={onSaveGroup}
        participantCount={state.participants.length}
      />
      
      {/* Modal เลือกกลุ่ม */}
      <SelectGroupModal
        isOpen={isSelectGroupOpen}
        onClose={() => setIsSelectGroupOpen(false)}
        groups={savedGroups || []}
        onSelect={onSelectGroup}
      />
    </>
  );
} 