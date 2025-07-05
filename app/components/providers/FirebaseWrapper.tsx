'use client';

import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';

// กำหนดค่า Firebase config จากตัวแปรสภาพแวดล้อม
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase if not already initialized - ย้ายออกมานอก component
let app: FirebaseApp;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;
let googleProvider: GoogleAuthProvider;

// สร้าง Firebase instances เฉพาะครั้งเดียว
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// สร้าง auth, db, และ provider เฉพาะครั้งเดียว
auth = getAuth(app);
db = getFirestore(app);
googleProvider = new GoogleAuthProvider();

// สร้าง context สำหรับใช้งาน Firebase
interface FirebaseContextType {
  app: ReturnType<typeof initializeApp>;
  db: ReturnType<typeof getFirestore>;
  auth: ReturnType<typeof getAuth>;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getUserRole: (uid: string) => Promise<string>;
  setUserRole: (uid: string, role: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

// คอมโพเนนต์ Loading สำหรับแสดงระหว่างที่รอ Firebase ทำงาน
function LoadingComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

// สร้าง Provider component
export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // ใช้ Firebase instances ที่สร้างไว้แล้วข้างนอก
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      
      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase initialization error:", error);
      setLoading(false);
    }
  }, []);

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error('ระบบ Firebase ยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!auth) throw new Error('ระบบ Firebase ยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
      // Update display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
        
        // เก็บข้อมูลผู้ใช้ในคอลเลกชัน users ใน Firestore พร้อมกำหนด role เป็น 'user'
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: displayName,
          role: 'user',
          createdAt: new Date(),
        });
      }
    } catch (error: any) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) throw new Error('ระบบ Firebase ยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง');
    try {
      const result = await signInWithPopup(auth, googleProvider);
    
      // เก็บข้อมูลผู้ใช้ในคอลเลกชัน users ใน Firestore หากยังไม่มี
      if (result.user) {
        const userRef = doc(db, 'users', result.user.uid);
        const userDoc = await getDoc(userRef);
        
        // ตรวจสอบว่ามีข้อมูลผู้ใช้ในระบบแล้วหรือไม่
        if (userDoc.exists()) {
          if (process.env.NODE_ENV === 'development') {
            console.log('User already exists in Firestore');
          }
          // อัพเดทเฉพาะข้อมูลที่จำเป็น แต่ไม่เปลี่ยน role ที่มีอยู่แล้ว
          await updateDoc(userRef, {
            lastLogin: new Date()
          });
        } else {
          // ถ้ายังไม่มีข้อมูลผู้ใช้ ให้สร้างใหม่พร้อมกำหนด role เป็น 'user'
          if (process.env.NODE_ENV === 'development') {
            console.log('Creating new user in Firestore');
          }
          await setDoc(userRef, {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            role: 'user', // กำหนดค่าเริ่มต้นเป็น user
            status: 'active',
            createdAt: new Date(),
            lastLogin: new Date()
          });
        }
        
        // ดึงข้อมูล role ล่าสุดจาก Firestore
        const updatedUserDoc = await getDoc(userRef);
        if (updatedUserDoc.exists()) {
          if (process.env.NODE_ENV === 'development') {
            console.log('User role after sign in:', updatedUserDoc.data().role);
          }
        }
      }
    } catch (error: any) {
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) throw new Error('ระบบ Firebase ยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง');
    try {
      return await firebaseSignOut(auth);
    } catch (error: any) {
      throw error;
    }
  };

  // ฟังก์ชันดึงข้อมูล role ของผู้ใช้จาก Firestore
  const getUserRole = async (uid: string): Promise<string> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Getting user role for uid:', uid);
      }
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (process.env.NODE_ENV === 'development') {
          console.log('User data from Firestore:', userData);
        }
        return userData.role || 'user';
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('User document not found in Firestore');
        }
      }
      return 'user'; // ถ้าไม่พบข้อมูลให้คืนค่าเป็น user
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'user';
    }
  };

  // ฟังก์ชันอัพเดท role ของผู้ใช้ใน Firestore
  const setUserRole = async (uid: string, role: string): Promise<void> => {
    try {
      await updateDoc(doc(db, 'users', uid), { role });
    } catch (error) {
      console.error('Error setting user role:', error);
      throw new Error('ไม่สามารถอัพเดทสิทธิ์ผู้ใช้ได้');
    }
  };

  // ถ้ากำลังเริ่มต้น ให้แสดง loading
  if (loading) return <LoadingComponent />;

  const value = {
    app,
    db,
    auth,
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    getUserRole,
    setUserRole
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

// สร้าง hook สำหรับใช้งาน Firebase
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
} 