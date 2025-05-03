"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged,
  UserCredential
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useFirebase } from '../components/providers/FirebaseWrapper';
import { getErrorMessage, logErrorToAnalytics } from '../lib/errorMessages';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Cookies from 'js-cookie';
import { useToast } from './ToastContext';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
  userRole: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  loginWithGoogle: async () => {},
  error: null,
  setError: () => {},
  userRole: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const { auth, signIn, signUp, signOut, signInWithGoogle, getUserRole } = useFirebase();
  const { showToast } = useToast();

  // ตรวจสอบสถานะการล็อกอินเมื่อคอมโพเนนต์โหลด
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed. User:", user?.email);
      setUser(user);
      setLoading(false);
      
      if (user) {
        try {
          Cookies.set('firebase-session', 'true', { secure: true, sameSite: 'strict' });
          
          console.log("Fetching role for user:", user.uid);
          const role = await getUserRole(user.uid);
          console.log("Role fetched from Firebase:", role);
          setUserRole(role);
          console.log('Fetched User Role:', role);
          
          sessionStorage.setItem('userRole', role);
          Cookies.set('user-role', role, { secure: true, sameSite: 'strict' });
        } catch (error) {
          console.error('Error getting user role:', error);
          setUserRole('user');
          sessionStorage.setItem('userRole', 'user');
          Cookies.set('user-role', 'user', { secure: true, sameSite: 'strict' });
        }
      } else {
        setUserRole(null);
        sessionStorage.removeItem('userRole');
        Cookies.remove('firebase-session');
        Cookies.remove('user-role');
      }
    });

    return () => unsubscribe();
  }, [auth, getUserRole]);

  // ฟังก์ชันล็อกอินด้วยอีเมลและรหัสผ่าน
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signIn(email, password);
      // หมายเหตุ: บทบาทจะถูกดึงและตั้งค่าในตัวจัดการ onAuthStateChanged
      
      // แสดงการแจ้งเตือน
      showToast('เข้าสู่ระบบสำเร็จ', 'success');
      
      // ดึง returnUrl จาก sessionStorage ถ้ามี
      const returnUrl = sessionStorage.getItem('returnUrl') || '/';
      sessionStorage.removeItem('returnUrl');
      router.push(returnUrl);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      
      // แสดงการแจ้งเตือนข้อผิดพลาด
      showToast(errorMessage, 'error');
      
      // บันทึก error เพื่อการวิเคราะห์
      logErrorToAnalytics(error.code || 'login-error', error.message);
      
      throw error;
    }
  };

  // ฟังก์ชันสมัครสมาชิกด้วยอีเมลและรหัสผ่าน
  const signup = async (email: string, password: string, name: string) => {
    try {
      setError(null);
      await signUp(email, password, name);
      // หมายเหตุ: บทบาทจะถูกดึงและตั้งค่าในตัวจัดการ onAuthStateChanged
      
      // แสดงการแจ้งเตือน
      showToast('สมัครสมาชิกและเข้าสู่ระบบสำเร็จ', 'success');
      
      // ดึง returnUrl จาก sessionStorage ถ้ามี
      const returnUrl = sessionStorage.getItem('returnUrl') || '/';
      sessionStorage.removeItem('returnUrl');
      router.push(returnUrl);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      
      // แสดงการแจ้งเตือนข้อผิดพลาด
      showToast(errorMessage, 'error');
      
      // บันทึก error เพื่อการวิเคราะห์
      logErrorToAnalytics(error.code || 'signup-error', error.message);
      
      throw error;
    }
  };

  // ฟังก์ชันล็อกอินด้วย Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      await signInWithGoogle();
      // หมายเหตุ: บทบาทจะถูกดึงและตั้งค่าในตัวจัดการ onAuthStateChanged
      
      // แสดงการแจ้งเตือน
      showToast('เข้าสู่ระบบด้วย Google สำเร็จ', 'success');
      
      // ดึง returnUrl จาก sessionStorage ถ้ามี
      const returnUrl = sessionStorage.getItem('returnUrl') || '/';
      sessionStorage.removeItem('returnUrl');
      router.push(returnUrl);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      
      // แสดงการแจ้งเตือนข้อผิดพลาด
      showToast(errorMessage, 'error');
      
      // บันทึก error เพื่อการวิเคราะห์
      logErrorToAnalytics(error.code || 'google-login-error', error.message);
      
      throw error;
    }
  };

  // ฟังก์ชันล็อกเอาท์
  const logout = async () => {
    try {
      await signOut();
      
      // แสดงการแจ้งเตือน
      showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
      
      router.push('/');
      router.refresh();
      // ล้าง userRole จาก sessionStorage และ cookies
      sessionStorage.removeItem('userRole');
      Cookies.remove('firebase-session');
      Cookies.remove('user-role');
      setUserRole(null);
    } catch (error: any) {
      console.error(error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      
      // แสดงการแจ้งเตือนข้อผิดพลาด
      showToast(errorMessage, 'error');
      
      // บันทึก error เพื่อการวิเคราะห์
      logErrorToAnalytics(error.code || 'logout-error', error.message);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    loginWithGoogle,
    error,
    setError,
    userRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 