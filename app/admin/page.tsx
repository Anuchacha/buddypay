'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/Tabs';
import { PageLoader } from '@/app/components/ui/PageLoader';
import { 
  UserRound, 
  LineChart, 
  DollarSign, 
  BarChart3, 
  FileClock, 
  ShieldAlert 
} from 'lucide-react';

import DashboardStats from './components/DashboardStats';
import UserManagement from './components/UserManagement';
import BillsOverview from './components/BillsOverview';
import ActivityLogs from './components/ActivityLogs';
import SettingsPanel from './components/SettingsPanel';
import AdminHeader from './components/AdminHeader';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboardPage() {
  const { user, userRole, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // เรียกใช้ตรวจสอบที่เก็บข้อมูล session ก่อนเพื่อความเร็ว
    const sessionRole = sessionStorage.getItem('userRole');
    const isSessionAdmin = sessionRole === 'admin';
    
    if (!loading) {
            setIsLoading(false);
      if (process.env.NODE_ENV === 'development') {
        console.log('User:', user?.email);
        console.log('User Role from Auth Context:', userRole);
        console.log('User Role from Session Storage:', sessionRole);
      }
      
              if (!user) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Access denied: user is not logged in');
          }
        router.push('/login');
              } else if (userRole !== 'admin' && !isSessionAdmin) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Access denied: user=', user?.email, 'role=', userRole);
          }
        alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
        router.push('/');
              } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('Admin access granted to:', user?.email, 'with role:', userRole || sessionRole);
          }
      }
    }
  }, [user, userRole, loading, router]);

  // เพิ่มการตรวจสอบตั้งแต่ตอนเริ่มต้น
  useEffect(() => {
    // ใช้ตรวจสอบเบื้องต้นจาก Session Storage
    const checkSessionAdmin = () => {
      const sessionRole = sessionStorage.getItem('userRole');
      if (sessionRole !== 'admin') {
        const cookieRole = document.cookie
          .split('; ')
          .find(row => row.startsWith('user-role='))
          ?.split('=')[1];
        
        if (cookieRole !== 'admin') {
          if (process.env.NODE_ENV === 'development') {
            console.log('Initial check - Not admin, redirecting...');
          }
          router.push('/');
          return false;
        }
      }
      return true;
    };
    
    if (!checkSessionAdmin()) {
      return; // ถ้าไม่ใช่ admin จะ redirect ออกไปแล้ว
    }
  }, [router]);

  if (isLoading) {
    return (
      <PageLoader 
        message="กำลังตรวจสอบสิทธิ์..." 
        overlay={true}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-6">
        <h1 className="mb-6 text-3xl font-bold">แผงควบคุมผู้ดูแลระบบ</h1>
        
        <DashboardStats />
        
        <Tabs defaultValue="users" className="mt-8">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UserRound size={16} />
              <span>ผู้ใช้</span>
            </TabsTrigger>
            <TabsTrigger value="bills" className="flex items-center gap-2">
              <DollarSign size={16} />
              <span>บิลทั้งหมด</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 size={16} />
              <span>สถิติ</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <FileClock size={16} />
              <span>กิจกรรม</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <ShieldAlert size={16} />
              <span>ตั้งค่า</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>การจัดการผู้ใช้</CardTitle>
                <CardDescription>ดูและจัดการบัญชีผู้ใช้ทั้งหมดในระบบ</CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bills">
            <Card>
              <CardHeader>
                <CardTitle>ภาพรวมบิลทั้งหมด</CardTitle>
                <CardDescription>ดูและจัดการบิลทั้งหมดในระบบ</CardDescription>
              </CardHeader>
              <CardContent>
                <BillsOverview />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="statistics">
            <Card>
              <CardHeader>
                <CardTitle>สถิติและข้อมูลเชิงลึก</CardTitle>
                <CardDescription>สถิติการใช้งานแพลตฟอร์ม</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>การเติบโตของผู้ใช้</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <LineChart />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>การใช้งานแอพ</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <BarChart3 />
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>บันทึกกิจกรรม</CardTitle>
                <CardDescription>ประวัติการใช้งานและการเปลี่ยนแปลงในระบบ</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityLogs />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>การตั้งค่าระบบ</CardTitle>
                <CardDescription>กำหนดค่าและการตั้งค่าความปลอดภัย</CardDescription>
              </CardHeader>
              <CardContent>
                <SettingsPanel />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 