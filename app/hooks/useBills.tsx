'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useFirebase } from '../components/providers/FirebaseWrapper';
import { useAuthModal } from '../context/AuthModalContext';
import { useRouter } from 'next/navigation';

// ประเภทข้อมูลบิลที่จะส่งออกไป
export interface BillSummary {
  id: string;
  name: string;
  title?: string;
  date: Date;
  totalAmount: number;
  participants: any[];
  status: string;
  createdAt: Date;
  categoryId?: string;
  userId?: string;
}

// ประเภทสำหรับข้อมูลสถานะและการโหลด
export interface BillsState {
  bills: BillSummary[];
  loading: boolean;
  error: string | null;
  unauthorized?: boolean;
}

// ฟังก์ชันเพื่อแปลง Firestore timestamp เป็น Date
const convertTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  if (timestamp.seconds !== undefined) {
    return new Date(timestamp.seconds * 1000);
  }
  
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  return new Date(timestamp);
};

/**
 * Custom hook สำหรับจัดการข้อมูลบิล
 * 
 * @param billId - ID ของบิลที่ต้องการดึงข้อมูล (ถ้ามี)
 * @returns สถานะการโหลดข้อมูล รายการบิล ฟังก์ชันดึงข้อมูล และสถานะผู้ใช้
 */
export const useBills = (billId?: string) => {
  const { user, loading: authLoading } = useFirebase();
  const { openLoginModal } = useAuthModal();
  const router = useRouter();
  
  const [state, setState] = useState<BillsState>({
    bills: [],
    loading: true,
    error: null,
    unauthorized: false
  });
  
  // เรียกใช้ openLoginModal เมื่อจำเป็น
  useEffect(() => {
    if (!authLoading && !user && !state.loading) {
      openLoginModal();
    }
  }, [user, authLoading, state.loading, openLoginModal]);
  
  // ฟังก์ชันดึงข้อมูลบิลทั้งหมดของผู้ใช้
  const fetchAllBills = async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const billsQuery = query(
        collection(db, 'bills'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(billsQuery);
      const fetchedBills: BillSummary[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        fetchedBills.push({
          id: doc.id,
          name: data.name || 'ไม่มีชื่อบิล',
          title: data.name || 'ไม่มีชื่อบิล',
          date: convertTimestamp(data.createdAt),
          totalAmount: data.totalAmount || 0,
          participants: Array.isArray(data.participants) ? data.participants : [],
          status: data.status || 'pending',
          createdAt: convertTimestamp(data.createdAt),
          categoryId: data.categoryId,
          userId: data.userId
        });
      });
      
      setState({
        bills: fetchedBills,
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Error fetching bills:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'ไม่สามารถโหลดข้อมูลบิลได้ กรุณาลองใหม่อีกครั้ง'
      }));
    }
  };
  
  // ฟังก์ชันดึงข้อมูลบิลเฉพาะ
  const fetchSingleBill = async (id: string) => {
    if (!user) {
      setState(prev => ({ 
        ...prev, 
        loading: false,
        unauthorized: true 
      }));
      return;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const docRef = doc(db, 'bills', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'ไม่พบข้อมูลบิลที่ต้องการ'
        }));
        return;
      }
      
      const data = docSnap.data();
      
      // ตรวจสอบว่าเป็นบิลของผู้ใช้หรือไม่
      if (data.userId !== user.uid) {
        setState(prev => ({
          ...prev,
          loading: false,
          unauthorized: true
        }));
        return;
      }
      
      const bill: BillSummary = {
        id: docSnap.id,
        name: data.name || 'ไม่มีชื่อบิล',
        title: data.name || 'ไม่มีชื่อบิล',
        date: convertTimestamp(data.createdAt),
        totalAmount: data.totalAmount || 0,
        participants: Array.isArray(data.participants) ? data.participants : [],
        status: data.status || 'pending',
        createdAt: convertTimestamp(data.createdAt),
        categoryId: data.categoryId,
        userId: data.userId
      };
      
      setState({
        bills: [bill],
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Error fetching bill:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'ไม่สามารถโหลดข้อมูลบิลได้ กรุณาลองใหม่อีกครั้ง'
      }));
    }
  };
  
  // เรียกใช้ฟังก์ชันดึงข้อมูลเมื่อคอมโพเนนต์โหลด
  useEffect(() => {
    if (!authLoading) {
      if (billId) {
        fetchSingleBill(billId);
      } else {
        fetchAllBills();
      }
    }
  }, [billId, user, authLoading]);
  
  // การแสดงข้อมูล Loading
  const renderLoading = () => {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return {
    // สถานะข้อมูล
    bills: state.bills,
    loading: state.loading || authLoading,
    error: state.error,
    unauthorized: state.unauthorized,
    
    // ข้อมูลผู้ใช้
    user,
    isAuthenticated: !!user,
    
    // ฟังก์ชัน
    fetchAllBills,
    fetchSingleBill,
    
    // helper components
    renderLoading,
    
    // actions
    navigateToBill: (id: string) => router.push(`/bill/${id}`),
    navigateToHistory: () => router.push('/history'),
    navigateToCreateBill: () => router.push('/create-bill'),
    handleLogin: openLoginModal
  };
}; 