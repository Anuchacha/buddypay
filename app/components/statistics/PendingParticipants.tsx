import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { PendingParticipant } from '@/app/hooks/useStatistics';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { formatCurrency } from '@/app/utils/statistics';

interface PendingParticipantsProps {
  pendingParticipants: PendingParticipant[];
  totalPendingAmount: number;
}

export function PendingParticipants({ 
  pendingParticipants, 
  totalPendingAmount
}: PendingParticipantsProps) {
  if (pendingParticipants.length === 0) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            สถานะการชำระเงิน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-lg font-semibold text-green-600 mb-2">ไม่มีผู้ค้างชำระ</h3>
            <p className="text-muted-foreground">ทุกคนชำระเงินครบถ้วนแล้ว</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-red-600">⚠️</span>
          ผู้ที่ค้างชำระ ({pendingParticipants.length} คน)
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          จำนวนเงินที่ค้างชำระทั้งหมด: <span className="font-semibold text-red-600">{formatCurrency(totalPendingAmount)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {pendingParticipants.map((participant, index) => (
            <Disclosure key={participant.name + index}>
              {({ open }) => (
                <div className="py-2">
                  <Disclosure.Button className="flex w-full justify-between items-center px-2 py-3 text-left hover:bg-red-50 rounded transition">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full font-bold">{index + 1}</span>
                      <span className="font-semibold">{participant.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">ค้างชำระ {participant.pendingBills} บิล</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-600">{formatCurrency(participant.totalPendingAmount)}</span>
                      <ChevronUpIcon className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </div>
                  </Disclosure.Button>
                  <Disclosure.Panel className="px-8 pb-4">
                    <div className="text-sm font-medium mb-1">รายการบิลที่ค้างชำระ:</div>
                    <ul className="space-y-1">
                      {participant.bills.map((bill) => (
                        <li key={bill.id} className="flex justify-between bg-gray-50 p-2 rounded">
                          <span>{bill.title} <span className="text-xs text-muted-foreground ml-2">{bill.date.toLocaleDateString('th-TH')}</span></span>
                          <span className="font-semibold text-red-600">{formatCurrency(bill.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  </Disclosure.Panel>
                </div>
              )}
            </Disclosure>
          ))}
        </div>
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-600">📊</span>
            <h4 className="font-semibold text-red-800">สรุป</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">จำนวนคนที่ค้างชำระ:</span>
              <span className="font-semibold ml-2">{pendingParticipants.length} คน</span>
            </div>
            <div>
              <span className="text-muted-foreground">จำนวนเงินรวม:</span>
              <span className="font-semibold text-red-600 ml-2">{formatCurrency(totalPendingAmount)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 