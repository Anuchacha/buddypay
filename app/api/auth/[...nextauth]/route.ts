import { NextResponse } from 'next/server';

// ปิดการทำงานของ NextAuth โดยส่งคืนข้อความแจ้งว่าระบบใช้ Firebase Authentication แทน
export async function GET() {
  return NextResponse.json(
    { message: 'This API is disabled. The application now uses Firebase Authentication.' },
    { status: 200 }
  );
}

export async function POST() {
  return NextResponse.json(
    { message: 'This API is disabled. The application now uses Firebase Authentication.' },
    { status: 200 }
  );
} 