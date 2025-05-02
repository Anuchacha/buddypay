'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFirebase } from '../components/providers/FirebaseWrapper';
import { Button } from './ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/DropdownMenu';
import { useAuthModal } from '../context/AuthModalContext';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';

// สร้าง Nullable version ของ useFirebase
function useSafeFirebase() {
  // ตรวจสอบว่าอยู่ใน client หรือไม่
  const [isMounted, setIsMounted] = useState(false);
  
  // เรียกใช้ hook ตรงนี้ นอกเงื่อนไข - ต้องเรียกทุกครั้งที่ render
  const firebase = useFirebase();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // ถ้าไม่ได้อยู่ใน client หรือยังโหลดไม่เสร็จ ให้คืนค่า null
  if (!isMounted) {
    return { app: null, db: null, auth: null };
  }
  
  // คืนค่า firebase ที่เรียกไว้แล้วข้างบน
  return firebase;
}

export default function Navbar() {
  const pathname = usePathname();
  const { openLoginModal, openSignupModal } = useAuthModal();
  const { user, isAuthenticated, logout, userRole } = useAuth();
  const firebase = useSafeFirebase();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // ถ้า Firebase ยังไม่พร้อม ให้แสดง skeleton หรือข้อความรอโหลด
  if (!firebase.app || !firebase.db || !firebase.auth) {
    return (
      <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50 animate-pulse">
        <div className="container mx-auto h-full flex items-center justify-between">
          <div className="h-6 w-32 bg-muted rounded"></div>
          <div className="h-8 w-40 bg-muted rounded"></div>
        </div>
      </header>
    );
  }
  
  // เมนูหลักของ Navbar
  const mainNavItems = [
    { href: '/share-bill', label: 'แชร์บิล' },
    { href: '/bill-history', label: 'ประวัติบิล' },
    { href: '/statistics', label: 'สถิติ' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background border-b border-border z-50">
      <div className="container mx-auto h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              LB
            </div>
            <span className="font-semibold text-lg">BuddyPay</span>
          </div>
        </Link>

        {/* เมนูหลักสำหรับเดสก์ท็อป */}
        <nav className="hidden md:flex items-center space-x-6">
          {mainNavItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                pathname === item.href 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              {item.label}
            </Link>
          ))}
          {/* แสดงปุ่มนำทางไปยังหน้า Admin เฉพาะเมื่อผู้ใช้งานมีบทบาทเป็น admin */}
          {userRole === 'admin' && (
            <Link href="/admin" className={`text-sm font-medium transition-colors ${pathname === '/admin' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
              หน้า Admin
            </Link>
          )}
        </nav>

        {/* ส่วนขวาสุดของ Navbar */}
        <div className="flex items-center space-x-4">
          {/* ปุ่มเมนูสำหรับโทรศัพท์มือถือ */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-gray-100" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="เปิด/ปิดเมนู"
          >
            <Menu size={24} />
          </button>
          
          {/* ถ้าล็อกอินแล้ว แสดง Avatar และเมนูผู้ใช้ */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer h-8 w-8">
                  <AvatarImage src={user?.photoURL || ''} />
                  <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.displayName || user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">โปรไฟล์</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/bill-history">ประวัติบิล</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">ตั้งค่า</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>ออกจากระบบ</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex space-x-2">
              <Button
                variant="ghost"
                onClick={openLoginModal}
                className="text-sm font-medium"
              >
                เข้าสู่ระบบ
              </Button>
              <Button 
                onClick={openSignupModal}
                className="text-sm font-medium"
              >
                สมัครสมาชิก
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-3">
              {mainNavItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`text-sm font-medium transition-colors p-2 rounded-md ${
                    pathname === item.href 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {userRole === 'admin' && (
                <Link 
                  href="/admin" 
                  className={`text-sm font-medium transition-colors p-2 rounded-md ${
                    pathname === '/admin' 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  หน้า Admin
                </Link>
              )}
              
              {!isAuthenticated && (
                <div className="flex flex-col space-y-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      openLoginModal();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-sm font-medium"
                  >
                    เข้าสู่ระบบ
                  </Button>
                  <Button 
                    onClick={() => {
                      openSignupModal();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-sm font-medium"
                  >
                    สมัครสมาชิก
                  </Button>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
} 