// Utility functions for statistics calculations and formatting

export const renderSafeAmount = (amount: number): string => {
  if (isNaN(amount) || !isFinite(amount)) return '0';
  return amount.toLocaleString();
};

export const calculatePercentage = (a: number, b: number): number => {
  if (!b || isNaN(b) || !isFinite(b)) return 0;
  return Math.round((a / b) * 100);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getMonthName = (monthIndex: number): string => {
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  return months[monthIndex] || 'ไม่ทราบเดือน';
};

export const getMonthAbbr = (monthIndex: number): string => {
  const months = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  return months[monthIndex] || 'ไม่ทราบ';
};

export const createLast6MonthsData = () => {
  const today = new Date();
  const monthData = [];
  const monthLookup: Record<string, number> = {};
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today);
    d.setMonth(d.getMonth() - i);
    const monthIndex = d.getMonth();
    const year = d.getFullYear();
    const yearMonth = `${year}-${monthIndex + 1}`;
    
    const index = 5 - i;
    monthData.push({
      name: getMonthAbbr(monthIndex),
      month: getMonthName(monthIndex),
      value: 0,
      yearMonth
    });
    
    monthLookup[yearMonth] = index;
  }
  
  return { monthData, monthLookup };
};

export const validateBillData = (bill: any): boolean => {
  return (
    bill &&
    typeof bill === 'object' &&
    bill.id &&
    bill.title &&
    typeof bill.totalAmount === 'number' &&
    bill.date instanceof Date
  );
};

export const safeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? defaultValue : num;
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * หาผู้ค้างชำระจากข้อมูล splitResults ของบิลเดียว
 * @param splitResults - ข้อมูลการหารเงินจากบิล
 * @returns รายชื่อผู้ค้างชำระพร้อมจำนวนเงิน
 */
export const getPendingParticipantsFromSplitResults = (splitResults: any[]): Array<{
  name: string;
  amount: number;
  id: string;
  status: string;
}> => {
  if (!splitResults || !Array.isArray(splitResults)) {
    return [];
  }

  return splitResults
    .filter((result) => {
      // ตรวจสอบว่ามี participant และ status เป็น pending
      return result.participant && 
             result.participant.status === 'pending' &&
             (result.amount || 0) > 0;
    })
    .map((result) => ({
      name: result.participant.name,
      amount: Number(result.amount || 0),
      id: result.participant.id,
      status: result.participant.status
    }))
    .sort((a, b) => b.amount - a.amount); // เรียงจากมากไปน้อย
};

/**
 * คำนวณยอดรวมเงินค้างชำระจาก splitResults
 * @param splitResults - ข้อมูลการหารเงินจากบิล
 * @returns ยอดรวมเงินค้างชำระ
 */
export const calculateTotalPendingAmount = (splitResults: any[]): number => {
  const pendingParticipants = getPendingParticipantsFromSplitResults(splitResults);
  return pendingParticipants.reduce((total, person) => total + person.amount, 0);
};

/**
 * สร้างข้อความแสดงผลผู้ค้างชำระ
 * @param splitResults - ข้อมูลการหารเงินจากบิล
 * @returns ข้อความแสดงผล
 */
export const formatPendingParticipantsText = (splitResults: any[]): string => {
  const pendingParticipants = getPendingParticipantsFromSplitResults(splitResults);
  
  if (pendingParticipants.length === 0) {
    return "ไม่มีผู้ค้างชำระ";
  }
  
  const totalAmount = pendingParticipants.reduce((sum, person) => sum + person.amount, 0);
  const participantList = pendingParticipants
    .map((person, index) => `${index + 1}. ${person.name} (${formatCurrency(person.amount)})`)
    .join('\n');
  
  return `ผู้ค้างชำระ ${pendingParticipants.length} คน\nยอดรวม: ${formatCurrency(totalAmount)}\n\n${participantList}`;
}; 