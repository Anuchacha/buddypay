import React from 'react';
import { 
  getPendingParticipantsFromSplitResults, 
  calculateTotalPendingAmount,
  formatCurrency 
} from '../utils/statistics';

interface PendingParticipantsDisplayProps {
  splitResults: any[];
  title?: string;
  showTotal?: boolean;
  className?: string;
}

/**
 * Component สำหรับแสดงผลผู้ค้างชำระแบบเรียบง่าย
 * ใช้ข้อมูล splitResults จากบิล
 */
export const PendingParticipantsDisplay: React.FC<PendingParticipantsDisplayProps> = ({
  splitResults,
  title = "ผู้ค้างชำระ",
  showTotal = true,
  className = ""
}) => {
  const pendingParticipants = getPendingParticipantsFromSplitResults(splitResults);
  const totalAmount = calculateTotalPendingAmount(splitResults);

  if (pendingParticipants.length === 0) {
    return (
      <div className={`p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <h3 className="text-lg font-semibold text-green-800 mb-2">{title}</h3>
        <p className="text-green-600">✅ ไม่มีผู้ค้างชำระ</p>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        {title} ({pendingParticipants.length} คน)
      </h3>
      
      <div className="space-y-2">
        {pendingParticipants.map((person, index) => (
          <div key={person.id} className="flex justify-between items-center p-2 bg-white rounded border">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded-full text-sm font-bold">
                {index + 1}
              </span>
              <span className="font-medium">{person.name}</span>
            </div>
            <span className="font-bold text-red-600">
              {formatCurrency(person.amount)}
            </span>
          </div>
        ))}
      </div>
      
      {showTotal && (
        <div className="mt-4 pt-3 border-t border-red-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-red-800">ยอดรวม:</span>
            <span className="font-bold text-red-800 text-lg">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Component สำหรับแสดงผลผู้ค้างชำระแบบตาราง
 */
export const PendingParticipantsTable: React.FC<PendingParticipantsDisplayProps> = ({
  splitResults,
  title = "ผู้ค้างชำระ",
  showTotal = true,
  className = ""
}) => {
  const pendingParticipants = getPendingParticipantsFromSplitResults(splitResults);
  const totalAmount = calculateTotalPendingAmount(splitResults);

  if (pendingParticipants.length === 0) {
    return (
      <div className={`p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <h3 className="text-lg font-semibold text-green-800 mb-2">{title}</h3>
        <p className="text-green-600">✅ ไม่มีผู้ค้างชำระ</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold mb-3">
        {title} ({pendingParticipants.length} คน)
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left">ลำดับ</th>
              <th className="border border-gray-300 px-3 py-2 text-left">ชื่อ</th>
              <th className="border border-gray-300 px-3 py-2 text-left">สถานะ</th>
              <th className="border border-gray-300 px-3 py-2 text-right">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody>
            {pendingParticipants.map((person, index) => (
              <tr key={person.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2">{index + 1}</td>
                <td className="border border-gray-300 px-3 py-2 font-medium">{person.name}</td>
                <td className="border border-gray-300 px-3 py-2">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                    {person.status}
                  </span>
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-bold text-red-600">
                  {formatCurrency(person.amount)}
                </td>
              </tr>
            ))}
          </tbody>
          {showTotal && (
            <tfoot>
              <tr className="bg-gray-100 font-bold">
                <td colSpan={3} className="border border-gray-300 px-3 py-2 text-right">
                  ยอดรวม:
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right text-red-800">
                  {formatCurrency(totalAmount)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}; 