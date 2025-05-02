import { Suspense, lazy } from 'react';
import { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { BillState } from '../../lib/billTypes';

interface ResultStepProps {
  state: BillState;
  promptPayId: string;
  qrPayload: string;
  notes: string;
}

// Lazy load the BillSummary component
const BillSummaryComponent = lazy(() => import('../../components/BillSummary'));

export default function ResultStep({
  state,
  promptPayId,
  qrPayload,
  notes
}: ResultStepProps) {
  return (
    <>
      <CardHeader className="bg-gray-50 border-b px-6 py-4">
        <CardTitle className="text-xl font-semibold flex items-center">
          <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2 text-sm">5</span>
          ผลลัพธ์การหารบิล
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="bg-green-50 border border-green-100 rounded-md p-3 mb-5 text-sm text-green-700">
          <p className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            นี่คือจำนวนเงินที่แต่ละคนต้องจ่าย สามารถบันทึกบิลเพื่อส่งต่อให้เพื่อนได้
          </p>
        </div>
        <Suspense fallback={<div className="text-center py-10">กำลังโหลด...</div>}>
          <BillSummaryComponent
            totalAmount={state.totalAmount}
            splitResults={state.splitResults}
            items={state.foodItems.map(item => ({
              name: item.name,
              amount: item.price,
              type: 'food' as const,
              quantity: 1
            }))}
            billTitle={state.billName}
            billDate={new Date()}
            billId="0001"
            vat={state.vat}
            discount={state.discount}
            serviceCharge={state.serviceCharge}
            ownerName={state.participants.length > 0 ? state.participants[0].name : ''}
            promptPayId={promptPayId}
            qrPayload={qrPayload}
            notes={notes}
          />
        </Suspense>
      </CardContent>
    </>
  );
} 