import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shareId } = await params;
    
    // ตรวจสอบว่า ID ถูกต้องมั้ย
    if (!shareId || typeof shareId !== 'string' || shareId.length !== 32) {
      return NextResponse.json(
        { error: 'ลิงค์ไม่ถูกต้อง' },
        { status: 400 }
      );
    }
    
    console.log('Fetching share data for ID:', shareId);
    
    // ดึงข้อมูลจาก Firestore temporary_shared_bills
    const shareRef = doc(db, 'temporary_shared_bills', shareId);
    const shareDoc = await getDoc(shareRef);
    
    if (!shareDoc.exists()) {
      return NextResponse.json(
        { error: 'ไม่พบลิงค์ที่ต้องการ หรือลิงค์อาจหมดอายุแล้ว' },
        { status: 404 }
      );
    }
    
    const shareData = shareDoc.data();
    
    // ตรวจสอบว่าหมดอายุแล้วหรือยัง
    if (shareData.expiryDate && new Date() > new Date(shareData.expiryDate)) {
      // ลบข้อมูลที่หมดอายุ
      await deleteDoc(shareRef);
      return NextResponse.json(
        { error: 'ลิงค์หมดอายุแล้ว' },
        { status: 410 }
      );
    }
    
    console.log('Share data retrieved successfully');
    
    return NextResponse.json({
      success: true,
      data: shareData,
      expiryDate: shareData.expiryDate,
      createdAt: shareData.createdAt,
      isTemporary: shareData.isTemporary
    });
    
  } catch (error) {
    console.error('Error retrieving shared bill:', error);
    return NextResponse.json(
      { error: 'ไม่สามารถโหลดข้อมูลได้ ลิงค์อาจไม่ถูกต้องหรือเสียหาย' },
      { status: 500 }
    );
  }
} 