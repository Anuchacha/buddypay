'use client';

import { useState, useEffect } from 'react';
import { Search, MoreHorizontal, Filter, Trash, Ban, CheckCircle } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, query, orderBy, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { useAuth } from '@/app/context/AuthContext';

// อินเตอร์เฟซสำหรับผู้ใช้
interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  displayName?: string;
  photoURL?: string;
}

// อินเตอร์เฟซสำหรับ currentUser




export default function UserManagement() {
  const { user: currentUser, userRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  // ใช้ useEffect เพื่อตรวจสอบสิทธิ์แทน
  useEffect(() => {
    if (!currentUser) {
      setError('คุณต้องเข้าสู่ระบบเพื่อดำเนินการนี้');
      setHasPermission(false);
    } else if (userRole !== 'admin') {
      setError('คุณไม่มีสิทธิ์เข้าถึงหน้าจัดการผู้ใช้');
      setHasPermission(false);
      if (process.env.NODE_ENV === 'development') {
        console.log('User role check failed:', currentUser, userRole);
      }
    } else {
      setHasPermission(true);
      if (process.env.NODE_ENV === 'development') {
        console.log('Admin access granted:', currentUser, userRole);
      }
    }
  }, [currentUser, userRole]);

  // ดึงข้อมูลผู้ใช้จาก Firestore
  useEffect(() => {
    async function fetchUsers() {
      try {
        setIsLoading(true);
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(usersQuery);
        
        const usersData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            uid: data.uid || doc.id,
            name: data.displayName || 'ไม่ระบุชื่อ',
            email: data.email || '',
            role: data.role || 'user',
            status: data.status || 'active',
            createdAt: data.createdAt?.toDate() || new Date(),
            photoURL: data.photoURL
          };
        });
        
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setIsLoading(false);
      }
    }
    
    if (currentUser && hasPermission) {
      fetchUsers();
    }
  }, [currentUser, hasPermission]);

  // จัดการค้นหาผู้ใช้
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        user => 
          user.name.toLowerCase().includes(value.toLowerCase()) || 
          user.email.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  // เปลี่ยนสิทธิ์ผู้ใช้
  const changeUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    if (!currentUser || userRole !== 'admin') {
      setError('คุณไม่มีสิทธิ์ในการเปลี่ยนแปลงบทบาทผู้ใช้');
      return;
    }
    
    try {
      setActionLoading(true);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole
      });
      
      // บันทึกกิจกรรม
      await logActivity(
        'admin_action',
        `เปลี่ยนสิทธิ์ผู้ใช้เป็น ${newRole === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}`
      );
      
      // อัพเดทข้อมูลผู้ใช้ในสเตท
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setFilteredUsers(filteredUsers.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      // แสดงข้อความสำเร็จ
      setSuccess(`เปลี่ยนสิทธิ์เป็น ${newRole === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'} สำเร็จ`);
      setTimeout(() => setSuccess(null), 3000);
      
      // ปิด Modal
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('ไม่สามารถอัพเดทสิทธิ์ผู้ใช้ได้');
    } finally {
      setActionLoading(false);
    }
  };

  // เปลี่ยนสถานะผู้ใช้
  const changeUserStatus = async (userId: string, newStatus: 'active' | 'inactive' | 'blocked') => {
    if (!currentUser || userRole !== 'admin') {
      setError('คุณต้องเข้าสู่ระบบเพื่อดำเนินการนี้');
      return;
    }
    
    try {
      setActionLoading(true);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: newStatus
      });
      
      // บันทึกกิจกรรม
      let actionDesc = '';
      if (newStatus === 'active') actionDesc = 'เปิดใช้งานบัญชีผู้ใช้';
      else if (newStatus === 'inactive') actionDesc = 'ปิดใช้งานบัญชีผู้ใช้ชั่วคราว';
      else actionDesc = 'บล็อกบัญชีผู้ใช้';
      
      await logActivity('admin_action', actionDesc);
      
      // อัพเดทข้อมูลผู้ใช้ในสเตท
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      setFilteredUsers(filteredUsers.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      // แสดงข้อความสำเร็จ
      setSuccess('อัพเดทสถานะผู้ใช้สำเร็จ');
      setTimeout(() => setSuccess(null), 3000);
      
      // ปิด Modal
      setShowStatusModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('ไม่สามารถอัพเดทสถานะผู้ใช้ได้');
    } finally {
      setActionLoading(false);
    }
  };

  // ลบผู้ใช้ (ใช้วิธีเปลี่ยนสถานะเป็น deleted แทนการลบจริงเพื่อป้องกันปัญหา)
  const deleteUser = async (userId: string) => {
    if (!currentUser || userRole !== 'admin') {
      setError('คุณต้องเข้าสู่ระบบเพื่อดำเนินการนี้');
      return;
    }
    
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้?')) {
      return; // ยกเลิกการลบ
    }

    try {
      setActionLoading(true);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'deleted',
        deletedAt: serverTimestamp(),
        deletedBy: currentUser.email
      });
      
      // บันทึกกิจกรรม
      await logActivity('admin_action', 'ลบบัญชีผู้ใช้');
      
      // ลบผู้ใช้ออกจากสเตท
      setUsers(users.filter(user => user.id !== userId));
      setFilteredUsers(filteredUsers.filter(user => user.id !== userId));
      
      // แสดงข้อความสำเร็จ
      setSuccess('ลบผู้ใช้สำเร็จ');
      setTimeout(() => setSuccess(null), 3000);
      
      // ปิด Modal
      setShowDeleteConfirmation(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('ไม่สามารถลบผู้ใช้ได้');
    } finally {
      setActionLoading(false);
    }
  };

  // บันทึกกิจกรรมผู้ดูแลระบบ
  const logActivity = async (action: string, description: string) => {
    if (!currentUser || userRole !== 'admin') return;
    
    try {
      await setDoc(doc(db, 'activityLogs', `admin_${Date.now()}`), {
        action,
        description,
        userEmail: currentUser.email || 'unknown',
        userName: currentUser.displayName || currentUser.email,
        ip: 'unknown', // ในสภาพแวดล้อมจริงควรมีการบันทึก IP
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // เปิด Modal แก้ไขสิทธิ์
  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(true);
    setShowStatusModal(false);
    setShowDeleteConfirmation(false);
  };

  // เปิด Modal แก้ไขสถานะ
  const openStatusModal = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(false);
    setShowStatusModal(true);
    setShowDeleteConfirmation(false);
  };

  // เปิด Modal ยืนยันการลบ
  const openDeleteConfirmation = (user: User) => {
    setSelectedUser(user);
    setShowRoleModal(false);
    setShowStatusModal(false);
    setShowDeleteConfirmation(true);
  };

  // ปิด Modal ทั้งหมด
  const closeAllModals = () => {
    setShowRoleModal(false);
    setShowStatusModal(false);
    setShowDeleteConfirmation(false);
    setSelectedUser(null);
  };

  // ฟอร์แมตวันที่
  const formatDate = (date: Date) => {
    return format(date, 'd MMM yyyy', { locale: th });
  };

  // แสดงสถานะของผู้ใช้
  const getUserStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ใช้งาน
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ไม่ได้ใช้งาน
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ถูกบล็อก
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

  // เช็คเงื่อนไขใน return แทน
  if (!hasPermission) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-red-500 mb-4">ไม่มีสิทธิ์เข้าถึง</h2>
        <p className="text-gray-700 mb-2">คุณไม่มีสิทธิ์เข้าถึงหน้าจัดการผู้ใช้</p>
        <p className="text-gray-500">กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* แสดงข้อผิดพลาด */}
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* แสดงข้อความสำเร็จ */}
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
          {success}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาผู้ใช้..."
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
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left font-medium py-3 px-4">ชื่อ</th>
                <th className="text-left font-medium py-3 px-4">อีเมล</th>
                <th className="text-left font-medium py-3 px-4">บทบาท</th>
                <th className="text-left font-medium py-3 px-4">สถานะ</th>
                <th className="text-left font-medium py-3 px-4">วันที่สมัคร</th>
                <th className="text-right font-medium py-3 px-4">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                  <td className="py-3 px-4">
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}
                      onClick={() => openRoleModal(user)}
                      style={{ cursor: 'pointer' }}
                    >
                      {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div 
                      onClick={() => openStatusModal(user)}
                      style={{ cursor: 'pointer' }}
                    >
                      {getUserStatusDisplay(user.status)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{formatDate(user.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        className="p-1 rounded-md hover:bg-muted"
                        onClick={() => openRoleModal(user)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 rounded-md hover:bg-red-100 text-red-600"
                        onClick={() => openDeleteConfirmation(user)}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              ไม่พบผู้ใช้
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-muted-foreground">
          แสดง {filteredUsers.length} จาก {users.length} คน
        </div>
      </div>
      
      {/* Modal แก้ไขสิทธิ์ */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">จัดการผู้ใช้: {selectedUser.name}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">สิทธิ์การใช้งาน</label>
              <div className="flex gap-2">
                <button 
                  className={`px-4 py-2 rounded-md ${
                    selectedUser.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => changeUserRole(selectedUser.id, 'user')}
                  disabled={actionLoading}
                >
                  ผู้ใช้
                </button>
                <button 
                  className={`px-4 py-2 rounded-md ${
                    selectedUser.role === 'admin' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => changeUserRole(selectedUser.id, 'admin')}
                  disabled={actionLoading}
                >
                  ผู้ดูแลระบบ
                </button>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
                onClick={closeAllModals}
                disabled={actionLoading}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal แก้ไขสถานะ */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">จัดการสถานะผู้ใช้: {selectedUser.name}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">สถานะการใช้งาน</label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  className={`flex items-center px-4 py-2 rounded-md ${
                    selectedUser.status === 'active' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                  onClick={() => changeUserStatus(selectedUser.id, 'active')}
                  disabled={actionLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  ใช้งาน (สามารถเข้าสู่ระบบได้)
                </button>
                
                <button 
                  className={`flex items-center px-4 py-2 rounded-md ${
                    selectedUser.status === 'inactive' 
                      ? 'bg-gray-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                  onClick={() => changeUserStatus(selectedUser.id, 'inactive')}
                  disabled={actionLoading}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  ปิดการใช้งานชั่วคราว
                </button>
                
                <button 
                  className={`flex items-center px-4 py-2 rounded-md ${
                    selectedUser.status === 'blocked' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-100 hover:bg-red-100 text-gray-900'
                  }`}
                  onClick={() => changeUserStatus(selectedUser.id, 'blocked')}
                  disabled={actionLoading}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  บล็อกผู้ใช้ (ไม่สามารถเข้าสู่ระบบได้)
                </button>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
                onClick={closeAllModals}
                disabled={actionLoading}
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal ยืนยันการลบ */}
      {showDeleteConfirmation && selectedUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">ยืนยันการลบผู้ใช้</h3>
            
            <p className="text-gray-600 mb-4">
              คุณต้องการลบผู้ใช้ <span className="font-semibold">{selectedUser.name}</span> ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </p>
            
            <div className="flex justify-end gap-2 mt-6">
              <button 
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
                onClick={closeAllModals}
                disabled={actionLoading}
              >
                ยกเลิก
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={() => deleteUser(selectedUser.id)}
                disabled={actionLoading}
              >
                {actionLoading ? 'กำลังลบ...' : 'ลบผู้ใช้'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 