import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // ตรวจสอบว่ามีอีเมลนี้ในระบบแล้วหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      );
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await hash(password, 12);

    // สร้างผู้ใช้ใหม่
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // ลบ password ออกจาก response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: 'สมัครสมาชิกสำเร็จ', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in signup:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' },
      { status: 500 }
    );
  }
} 