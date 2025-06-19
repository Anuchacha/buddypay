import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import crypto from 'crypto';

// Generate random ID
const generateShareId = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/share/create - Request received');
    
    // ตรวจสอบ Firebase configuration
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.error('Firebase configuration missing');
      return NextResponse.json(
        { error: 'การตั้งค่า Firebase ไม่สมบูรณ์ กรุณาติดต่อผู้ดูแลระบบ' },
        { status: 500 }
      );
    }
    
    const billData = await request.json();
    console.log('Bill data received:', { 
      billName: billData.billName, 
      participants: billData.participants?.length,
      foodItems: billData.foodItems?.length,
      splitMethod: billData.splitMethod 
    });
    
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!billData.billName || !billData.participants || billData.participants.length === 0) {
      return NextResponse.json(
        { error: 'ข้อมูลบิลไม่สมบูรณ์' },
        { status: 400 }
      );
    }
    
    // สร้าง ID ชั่วคราว
    const shareId = generateShareId();
    
    // เพิ่มข้อมูลวันหมดอายุ (24 ชั่วโมงสำหรับ temp shares)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24); // 24 ชั่วโมง
    
    const shareData = {
      ...billData,
      shareId,
      expiryDate: expiryDate.toISOString(),
      createdAt: new Date().toISOString(),
      isTemporary: true,
      type: 'temp_share'
    };
    
    // เก็บใน Firestore temporary_shared_bills collection
    const shareRef = doc(db, 'temporary_shared_bills', shareId);
    await setDoc(shareRef, shareData);
    
    console.log('Temp share created:', shareId);
    
    // สร้าง URL สำหรับแชร์
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/share/${shareId}`;
    
    return NextResponse.json({
      success: true,
      shareUrl,
      shareId,
      expiryDate: expiryDate.toISOString(),
      isTemporary: true
    });
    
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถสร้างลิงค์แชร์ได้ กรุณาลองใหม่อีกครั้ง' },
      { status: 500 }
    );
  }
} 