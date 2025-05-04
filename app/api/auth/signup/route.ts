import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/app/lib/firebase';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // ตรวจสอบว่ามีอีเมลนี้ในระบบแล้วหรือไม่
    const userRef = doc(db, 'users', email);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return NextResponse.json(
        { message: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      );
    }

    // เข้ารหัสรหัสผ่าน (Firebase จะจัดการส่วนนี้ให้)
    // สร้างผู้ใช้ใหม่ใน Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // อัปเดตโปรไฟล์ด้วยชื่อ
    await updateProfile(user, { displayName: name });
    
    // เก็บข้อมูลเพิ่มเติมใน Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // ส่ง response กลับ
    return NextResponse.json(
      { 
        message: 'สมัครสมาชิกสำเร็จ', 
        user: {
          id: user.uid,
          name: user.displayName,
          email: user.email,
        } 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in signup:', error);
    const errorMessage = error.code ? 
      (error.code === 'auth/email-already-in-use' ? 'อีเมลนี้ถูกใช้งานแล้ว' : error.message) : 
      'เกิดข้อผิดพลาดในการสมัครสมาชิก';
    
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
} 