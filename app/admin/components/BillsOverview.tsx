'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Printer, Trash } from 'lucide-react';
import { collection, query, getDocs, orderBy, Timestamp, startAfter, limit } from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { th } from 'date-fns/locale';
import { db } from '@/app/lib/firebase';

// กำหนด interface สำหรับค่าใช้จ่าย
interface Bill {
  id: string;
  title: string;
  description?: string;
  amount: number;
  status: 'paid' | 'pending' | 'cancelled';
  owner: string;
  ownerEmail?: string;
  participants: number;
  createdAt: Timestamp;
  date: string;
  paymentDate?: string;
  paidBy?: string;
  tags?: string[];
}

export default function BillsOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState<string>('');

  // โหลดข้อมูลค่าใช้จ่ายจาก Firestore
  useEffect(() => {
    async function fetchBills() {
      try {
        setIsLoading(true);

        // สร้าง query พื้นฐาน
        const billsQuery = query(collection(db, 'bills'), orderBy('createdAt', 'desc'), limit(20));
        
        const snapshot = await getDocs(billsQuery);
        if (snapshot.docs.length > 0) {
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
          setHasMore(snapshot.docs.length === 20);
        } else {
          setHasMore(false);
        }
        
        const billsData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || 'ไม่มีชื่อ',
            description: data.description || '',
            amount: data.amount || 0,
            status: data.status || 'pending',
            owner: data.ownerName || 'ไม่ระบุ',
            ownerEmail: data.ownerEmail || '',
            participants: Array.isArray(data.participants) ? data.participants.length : 0,
            createdAt: data.createdAt || Timestamp.now(),
            date: data.date || format(new Date(), 'yyyy-MM-dd'),
            paymentDate: data.paymentDate || '',
            paidBy: data.paidBy || '',
            tags: data.tags || []
          };
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Bills data loaded:', billsData.length);
        }
        setBills(billsData);
        applyFilters(billsData, statusFilter, searchTerm, dateFilter);
      } catch (err) {
        console.error('Error fetching bills:', err);
        setError('ไม่สามารถโหลดข้อมูลค่าใช้จ่ายได้');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBills();
  }, []);

  // โหลดข้อมูลเพิ่มเติม
  const loadMoreBills = async () => {
    if (!hasMore || isLoading) return;
    
    try {
      setIsLoading(true);
      const billsQuery = query(
        collection(db, 'bills'), 
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(20)
      );
      
      const snapshot = await getDocs(billsQuery);
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === 20);
      } else {
        setHasMore(false);
      }
      
      const newBillsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'ไม่มีชื่อ',
          description: data.description || '',
          amount: data.amount || 0,
          status: data.status || 'pending',
          owner: data.ownerName || 'ไม่ระบุ',
          ownerEmail: data.ownerEmail || '',
          participants: data.participants?.length || 0,
          createdAt: data.createdAt || Timestamp.now(),
          date: data.date || format(new Date(), 'yyyy-MM-dd'),
          paymentDate: data.paymentDate || '',
          paidBy: data.paidBy || '',
          tags: data.tags || []
        };
      });
      
      const updatedBills = [...bills, ...newBillsData];
      setBills(updatedBills);
      applyFilters(updatedBills, statusFilter, searchTerm, dateFilter);
    } catch (err) {
      console.error('Error loading more bills:', err);
      setError('ไม่สามารถโหลดข้อมูลเพิ่มเติมได้');
    } finally {
      setIsLoading(false);
    }
  };

  // ประมวลผลตัวกรอง
  const applyFilters = (
    billsToFilter: Bill[], 
    status: string, 
    search: string,
    date: string
  ) => {
    let result = [...billsToFilter];
    
    // กรองตามสถานะ
    if (status !== 'all') {
      result = result.filter(bill => bill.status === status);
    }
    
    // กรองตามการค้นหา
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(bill => 
        bill.title.toLowerCase().includes(searchLower) ||
        bill.description?.toLowerCase().includes(searchLower) ||
        bill.owner.toLowerCase().includes(searchLower) ||
        bill.ownerEmail?.toLowerCase().includes(searchLower) ||
        (bill.tags && bill.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }
    
    // กรองตามวันที่
    if (date) {
      result = result.filter(bill => bill.date === date);
    }
    
    setFilteredBills(result);
  };

  // การค้นหา
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // ตรวจสอบข้อมูลที่เข้ามา
    if (value.trim() === '') {
      setFilteredBills(bills);
    } else {
      const filtered = bills.filter(
        bill => 
          bill.title.toLowerCase().includes(value.toLowerCase()) || 
          bill.description?.toLowerCase().includes(value.toLowerCase()) ||
          bill.owner.toLowerCase().includes(value.toLowerCase()) ||
          bill.ownerEmail?.toLowerCase().includes(value.toLowerCase()) ||
          (bill.tags && bill.tags.some(tag => tag.toLowerCase().includes(value.toLowerCase())))
      );
      setFilteredBills(filtered);
    }
  };

  // กรองตามสถานะ
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilters(bills, status, searchTerm, dateFilter);
    setShowFilterMenu(false);
  };

  // กรองตามวันที่
  const handleDateFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateFilter(value);
    applyFilters(bills, statusFilter, searchTerm, value);
  };

  // รีเซ็ตตัวกรอง
  const resetFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
    setDateFilter('');
    setFilteredBills(bills);
    setShowFilterMenu(false);
  };

  // ส่งออกข้อมูลเป็น CSV
  const exportToCSV = () => {
    if (filteredBills.length === 0) return;
    
    const headers = ['ชื่อค่าใช้จ่าย', 'คำอธิบาย', 'จำนวนเงิน', 'สถานะ', 'เจ้าของ', 'จำนวนผู้ร่วมจ่าย', 'วันที่', 'วันที่ชำระ', 'ชำระโดย', 'แท็ก'];
    
    // แปลงสถานะเป็นภาษาไทย
    const translateStatus = (status: string) => {
      switch (status) {
        case 'paid': return 'ชำระแล้ว';
        case 'pending': return 'รอชำระ';
        case 'cancelled': return 'ยกเลิก';
        default: return status;
      }
    };
    
    // แปลงวันที่เป็น format ที่อ่านง่าย
    const formatDateString = (dateString: string) => {
      try {
        if (!dateString) return '';
        return format(parseISO(dateString), 'd MMM yyyy', { locale: th });
      } catch (err) {
        return dateString;
      }
    };
    
    const csvRows = filteredBills.map(bill => {
      return [
        bill.title,
        bill.description || '',
        bill.amount.toString(),
        translateStatus(bill.status),
        bill.owner,
        bill.participants.toString(),
        formatDateString(bill.date),
        bill.paymentDate ? formatDateString(bill.paymentDate) : '',
        bill.paidBy || '',
        bill.tags ? bill.tags.join(', ') : ''
      ];
    });
    
    // เพิ่ม headers
    csvRows.unshift(headers);
    
    // แปลงเป็น CSV format
    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    // สร้าง Blob
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // สร้าง link เพื่อ download
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ค่าใช้จ่าย_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // แปลงสถานะเป็นข้อความภาษาไทย
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ชำระแล้ว
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            รอชำระ
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ยกเลิก
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ไม่ทราบสถานะ
          </span>
        );
    }
  };

  // แปลงวันที่
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'ไม่ระบุวันที่';
    try {
      return format(timestamp.toDate(), 'd MMM yyyy', { locale: th });
    } catch (err) {
      return 'วันที่ไม่ถูกต้อง';
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาชื่อบิล, ผู้สร้าง, รายละเอียด..."
            className="w-full py-2 pl-10 pr-4 border rounded-md"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2">
            <label htmlFor="date-filter" className="text-sm whitespace-nowrap">วันที่:</label>
            <input
              id="date-filter"
              type="date"
              className="border rounded-md py-2 px-3 text-sm"
              value={dateFilter}
              onChange={handleDateFilter}
            />
          </div>
          
          <div className="relative">
            <button 
              className="flex items-center gap-2 border rounded-md px-4 py-2 text-sm"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
            >
              <Filter className="h-4 w-4" />
              <span>
                สถานะ: {
                  statusFilter === 'all' ? 'ทั้งหมด' :
                  statusFilter === 'paid' ? 'ชำระแล้ว' :
                  statusFilter === 'pending' ? 'รอชำระ' :
                  statusFilter === 'cancelled' ? 'ยกเลิก' : 'ทั้งหมด'
                }
              </span>
            </button>
            
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${statusFilter === 'all' ? 'bg-primary/10 font-medium' : ''}`}
                    onClick={() => handleStatusFilter('all')}
                  >
                    ทั้งหมด
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${statusFilter === 'pending' ? 'bg-primary/10 font-medium' : ''}`}
                    onClick={() => handleStatusFilter('pending')}
                  >
                    รอชำระ
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${statusFilter === 'paid' ? 'bg-primary/10 font-medium' : ''}`}
                    onClick={() => handleStatusFilter('paid')}
                  >
                    ชำระแล้ว
                  </button>
                  <button 
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${statusFilter === 'cancelled' ? 'bg-primary/10 font-medium' : ''}`}
                    onClick={() => handleStatusFilter('cancelled')}
                  >
                    ยกเลิก
                  </button>
                  <div className="border-t my-1"></div>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-primary"
                    onClick={resetFilters}
                  >
                    รีเซ็ตตัวกรอง
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button 
            className="flex items-center gap-2 border rounded-md px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200"
            onClick={exportToCSV}
          >
            <Download className="h-4 w-4" />
            <span>ส่งออก CSV</span>
          </button>
        </div>
      </div>
      
      {isLoading && bills.length === 0 ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left py-3 px-4 font-medium">ชื่อบิล</th>
                  <th className="text-right py-3 px-4 font-medium">จำนวนเงิน</th>
                  <th className="text-left py-3 px-4 font-medium">สถานะ</th>
                  <th className="text-left py-3 px-4 font-medium">เจ้าของ</th>
                  <th className="text-left py-3 px-4 font-medium">ผู้ร่วมจ่าย</th>
                  <th className="text-left py-3 px-4 font-medium">วันที่</th>
                  <th className="text-right py-3 px-4 font-medium">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length > 0 ? (
                  filteredBills.map(bill => (
                    <tr key={bill.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{bill.title}</div>
                          {bill.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">{bill.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-medium">฿{parseFloat(bill.amount.toString()).toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusDisplay(bill.status)}
                      </td>
                      <td className="py-3 px-4 text-sm">{bill.owner}</td>
                      <td className="py-3 px-4 text-sm text-center">{bill.participants}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {formatDate(bill.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="พิมพ์"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                          <button 
                            className="p-1 rounded-md hover:bg-red-100 text-red-500 hover:text-red-600"
                            title="ลบ"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' || dateFilter ? 
                        'ไม่พบบิลที่ตรงกับเงื่อนไขที่ระบุ' : 
                        'ยังไม่มีบิลในระบบ'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {hasMore && (
            <div className="mt-6 text-center">
              <button 
                className="px-4 py-2 border rounded-md hover:bg-gray-50 text-sm"
                onClick={loadMoreBills}
                disabled={isLoading}
              >
                {isLoading ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 