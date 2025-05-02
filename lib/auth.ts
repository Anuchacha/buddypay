import { redirect } from "next/navigation";
import { auth } from "@/app/lib/firebase";
import { onAuthStateChanged } from 'firebase/auth';

export async function getCurrentUser() {
  // รับ user ปัจจุบันจาก Firebase
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/auth/signin");
  }
  
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  
  // ตรวจสอบสิทธิ์ admin จะต้องมีการดึงข้อมูลเพิ่มเติมจาก Firestore
  // นี่เป็นตัวอย่าง จะไม่ทำงานจริงเนื่องจากต้องมีการดึงข้อมูล role จาก Firestore
  if (!user) {
    redirect("/auth/signin");
  }
  
  // สำหรับตอนนี้ให้ทำงานได้ก่อน
  return user;
} 