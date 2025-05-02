'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // ถ้าผู้ใช้ยังไม่ได้ล็อกอิน และไม่กำลังโหลดข้อมูล ให้นำทางไปยังหน้าหลัก
    if (!isAuthenticated && !authLoading) {
      router.push('/');
    }

    // ตั้งค่าชื่อที่แสดงจาก user
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user, isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      if (user) {
        // อัปเดตโปรไฟล์ใน Firebase Authentication
        await updateProfile(user as User, { displayName });

        // อัปเดตข้อมูลใน Firestore ถ้ามี
        if (user.uid) {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            displayName,
            updatedAt: new Date()
          });
        }

        setIsSuccess(true);
        
        // รีเซ็ตสถานะความสำเร็จหลังจาก 3 วินาที
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์');
    } finally {
      setIsLoading(false);
    }
  };

  // แสดงหน้าโหลดถ้ากำลังตรวจสอบสถานะการล็อกอิน
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ถ้าไม่ได้ล็อกอิน ให้แสดงข้อความและปุ่มล็อกอิน
  if (!isAuthenticated) {
    return null; // จะถูกนำทางไปยังหน้าหลักด้วย useEffect
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-6">โปรไฟล์ของฉัน</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* เมนูด้านซ้าย */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>เมนู</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="flex flex-col">
                <Link 
                  href="/profile" 
                  className="px-4 py-2 border-l-2 border-primary bg-primary/5 font-medium"
                >
                  โปรไฟล์
                </Link>
                <Link 
                  href="/bill-history" 
                  className="px-4 py-2 border-l-2 border-transparent hover:border-primary/50 hover:bg-primary/5"
                >
                  ประวัติบิล
                </Link>
                <Link 
                  href="/settings" 
                  className="px-4 py-2 border-l-2 border-transparent hover:border-primary/50 hover:bg-primary/5"
                >
                  ตั้งค่าบัญชี
                </Link>
              </nav>
            </CardContent>
          </Card>
        </div>
        
        {/* คอนเทนต์หลัก */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลส่วนตัว</CardTitle>
              <CardDescription>จัดการข้อมูลส่วนตัวของคุณ</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {/* แสดงข้อความผิดพลาด */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                  </div>
                )}
                
                {/* แสดงข้อความสำเร็จ */}
                {isSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <Check size={18} />
                    <span>อัปเดตข้อมูลสำเร็จ</span>
                  </div>
                )}
                
                <div>
                  <Input
                    label="ชื่อที่แสดง"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="ชื่อที่ต้องการให้แสดง"
                  />
                </div>
                
                <div>
                  <Input
                    label="อีเมล"
                    value={user?.email || ''}
                    disabled
                    placeholder="อีเมล"
                    className="bg-gray-50"
                    helperText="ไม่สามารถเปลี่ยนแปลงอีเมลได้"
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    'บันทึกข้อมูล'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
} 