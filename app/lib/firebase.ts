import { FirebaseApp, getApp, initializeApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// คืนค่า Firebase app ที่มีอยู่แล้ว หรือสร้างใหม่
let firebaseApp: FirebaseApp;
let firebaseAuth: Auth;
let firestoreDb: Firestore;
let firebaseStorage: FirebaseStorage;

try {
  firebaseApp = getApp();
} catch (e) {
  firebaseApp = initializeApp(firebaseConfig);
}

// ฟังก์ชันเริ่มต้น Firebase
const initFirebase = () => {
  // ตรวจสอบว่ามีการเริ่มต้น Firebase แล้วหรือไม่
  if (typeof window !== 'undefined' && !firebaseApp) {
    try {
      firebaseApp = getApp();
    } catch (e) {
      firebaseApp = initializeApp(firebaseConfig);
    }
  }

  return firebaseApp;
};

// คืนค่า Firebase Auth
export const getFirebaseAuth = (): Auth => {
  if (!firebaseAuth) {
    firebaseAuth = getAuth(firebaseApp);
  }
  return firebaseAuth;
};

// ส่งออก Firebase app และบริการ
export const app = initFirebase();
export const auth = getFirebaseAuth();
export const db = getFirestore(app);
export const storage = getStorage(app);

// ฟังก์ชันสำหรับตรวจสอบข้อมูลผู้ใช้ในฐานข้อมูล (สำหรับการดีบัก)
export const debugUserRole = async (uid: string) => {
  try {
    if (!db) {
      console.error('Firestore not initialized');
      return null;
    }
    
    const { getDoc, doc } = await import('firebase/firestore');
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (userDoc.exists()) {
      console.log('DEBUG - User data from Firestore:', userDoc.data());
      return userDoc.data();
    } else {
      console.log('DEBUG - User not found in Firestore');
      return null;
    }
  } catch (error) {
    console.error('DEBUG - Error getting user data:', error);
    return null;
  }
};

export default app; 