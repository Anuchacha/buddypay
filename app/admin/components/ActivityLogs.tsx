'use client';

import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { collection, query, getDocs, orderBy, limit, startAfter, Timestamp } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

// กำหนด interface สำหรับ activity log
interface ActivityLog {
  id: string;
  action: string;
  description: string;
  user: string;
  userEmail?: string;
  ip: string;
  timestamp: Timestamp | Date;
  formattedTime: string;
}

export default function ActivityLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  // ดึงข้อมูลบันทึกกิจกรรมจาก Firestore
  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const logsQuery = query(
          collection(db, 'activityLogs'),
          orderBy('timestamp', 'desc'),
          limit(10)
        );
        
        const snapshot = await getDocs(logsQuery);
        if (snapshot.docs.length > 0) {
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
          setHasMore(snapshot.docs.length === 10);
        } else {
          setHasMore(false);
        }
        
        const logsData = snapshot.docs.map(doc => {
          const data = doc.data();
          // แสดง IP จริงหรือใช้ IP จากคุกกี้
          let ipAddress = data.ip;
          if (!ipAddress || ipAddress === 'unknown') {
            // ใช้ IP เครื่องลูกข่ายเป็นค่าเริ่มต้น (หมายเหตุ: ในการใช้งานจริงควรใช้ server-side)
            ipAddress = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
          }
          
          return {
            id: doc.id,
            action: data.action || 'unknown',
            description: data.description || 'ไม่มีคำอธิบาย',
            user: data.userName || data.userEmail || 'ไม่ระบุผู้ใช้',
            userEmail: data.userEmail,
            ip: ipAddress,
            timestamp: data.timestamp || new Date(),
            formattedTime: formatDate(data.timestamp)
          };
        });
        
        setLogs(logsData);
        setFilteredLogs(logsData);
      } catch (err) {
        console.error('Error fetching activity logs:', err);
        setError('ไม่สามารถโหลดข้อมูลกิจกรรมได้');
      } finally {
        setLoading(false);
      }
    }
    
    fetchLogs();
  }, []);

  // ฟังก์ชันโหลดข้อมูลเพิ่มเติม
  const loadMoreLogs = async () => {
    if (!hasMore || loading) return;
    
    try {
      setLoading(true);
      const logsQuery = query(
        collection(db, 'activityLogs'),
        orderBy('timestamp', 'desc'),
        startAfter(lastDoc),
        limit(10)
      );
      
      const snapshot = await getDocs(logsQuery);
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === 10);
      } else {
        setHasMore(false);
      }
      
      const newLogsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          action: data.action || 'unknown',
          description: data.description || 'ไม่มีคำอธิบาย',
          user: data.userName || data.userEmail || 'ไม่ระบุผู้ใช้',
          userEmail: data.userEmail,
          ip: data.ip || 'ไม่ระบุ IP',
          timestamp: data.timestamp || new Date(),
          formattedTime: formatDate(data.timestamp)
        };
      });
      
      setLogs([...logs, ...newLogsData]);
      filterLogs([...logs, ...newLogsData], searchTerm);
    } catch (err) {
      console.error('Error loading more logs:', err);
      setError('ไม่สามารถโหลดข้อมูลกิจกรรมเพิ่มเติมได้');
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันแปลงวันที่
  const formatDate = (dateInput: any) => {
    if (!dateInput) return 'ไม่ระบุวันที่';
    
    try {
      const date = dateInput instanceof Date 
        ? dateInput 
        : dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
      
      return format(date, 'd MMM yyyy, HH:mm:ss', { locale: th });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'ไม่ระบุวันที่';
    }
  };

  // ฟังก์ชันกรองข้อมูลกิจกรรม
  const filterLogs = (logs: ActivityLog[], term: string) => {
    if (!term.trim()) {
      setFilteredLogs(logs);
      return;
    }
    
    const filtered = logs.filter(log => 
      log.description.toLowerCase().includes(term.toLowerCase()) || 
      log.user.toLowerCase().includes(term.toLowerCase()) ||
      log.action.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredLogs(filtered);
  };

  // จัดการค้นหากิจกรรม
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterLogs(logs, value);
  };

  // ฟังก์ชันรับไอคอนตามประเภทกิจกรรม
  const getActionIconClass = (action: string) => {
    switch (action) {
      case 'login':
        return 'bg-green-100 text-green-600';
      case 'logout':
        return 'bg-blue-100 text-blue-600';
      case 'create_bill':
        return 'bg-purple-100 text-purple-600';
      case 'payment':
        return 'bg-indigo-100 text-indigo-600';
      case 'delete_bill':
        return 'bg-red-100 text-red-600';
      case 'update_user':
      case 'admin_action':
        return 'bg-yellow-100 text-yellow-600';
      case 'update_settings':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // ฟังก์ชันรับชื่อกิจกรรม
  const getActionName = (action: string) => {
    switch (action) {
      case 'login':
        return 'เข้าสู่ระบบ';
      case 'logout':
        return 'ออกจากระบบ';
      case 'create_bill':
        return 'สร้างบิล';
      case 'payment':
        return 'ชำระเงิน';
      case 'delete_bill':
        return 'ลบบิล';
      case 'update_user':
        return 'อัปเดตผู้ใช้';
      case 'admin_action':
        return 'แอดมินดำเนินการ';
      case 'update_settings':
        return 'อัปเดตการตั้งค่า';
      default:
        return action;
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
            placeholder="ค้นหากิจกรรม..."
            className="w-full py-2 pl-10 pr-4 border rounded-md"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center justify-center gap-2 border rounded-md px-4 py-2 text-sm">
            <Filter className="h-4 w-4" />
            <span>ตัวกรอง</span>
          </button>
        </div>
      </div>
      
      {loading && logs.length === 0 ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.length > 0 ? (
            filteredLogs.map(log => (
              <div key={log.id} className="p-4 bg-white border rounded-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${getActionIconClass(log.action)}`}>
                    <div className="w-3 h-3 rounded-full bg-current" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <div className="font-medium">{getActionName(log.action)}</div>
                        <div className="text-sm text-muted-foreground">{log.description}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {log.formattedTime}
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-2 md:gap-6 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">ผู้ใช้:</span> {log.user}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">IP:</span> {log.ip}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              ไม่พบข้อมูลกิจกรรมที่ตรงกับเงื่อนไขการค้นหา
            </div>
          )}
          
          {hasMore && (
            <div className="text-center pt-4">
              <button 
                className="px-4 py-2 border rounded-md hover:bg-gray-50 text-sm"
                onClick={loadMoreLogs}
                disabled={loading}
              >
                {loading ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 