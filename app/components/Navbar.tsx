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
import { Menu, Bell, Clock, CheckCircle2 } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

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

// Interface สำหรับบิลที่ค้างชำระ
interface PendingBill {
  id: string;
  title: string;
  totalAmount: number;
  createdAt: Date;
  participantName?: string;
  amountOwed?: number;
}

// Custom Hook สำหรับดึงข้อมูลบิลที่ค้างชำระ
function usePendingBills() {
  const [pendingBills, setPendingBills] = useState<PendingBill[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const firebase = useSafeFirebase();

  useEffect(() => {
    if (!isAuthenticated || !user || !firebase.db) return;

    const fetchPendingBills = async () => {
      setLoading(true);
      try {
        // ดึงบิลที่ผู้ใช้เป็นเจ้าของและยังไม่ชำระ
        const ownerQuery = query(
          collection(firebase.db, 'bills'),
          where('userId', '==', user.uid),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const ownerSnapshot = await getDocs(ownerQuery);
        
        // ดึงบิลที่ผู้ใช้เป็นผู้เข้าร่วมและยังไม่ชำระ
        const participantQuery = query(
          collection(firebase.db, 'bills'),
          orderBy('createdAt', 'desc'),
          limit(50) // ดึงมากกว่าเพื่อกรองแล้ว
        );
        const participantSnapshot = await getDocs(participantQuery);
        
        const bills: PendingBill[] = [];
        let count = 0;

        // จัดการบิลที่เป็นเจ้าของ
        ownerSnapshot.docs.forEach(doc => {
          const data = doc.data();
          bills.push({
            id: doc.id,
            title: data.title || 'ไม่มีชื่อบิล',
            totalAmount: data.totalAmount || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
          });
          count++;
        });

        // จัดการบิลที่เป็นผู้เข้าร่วม
        participantSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.userId === user.uid) return; // ข้ามบิลที่เป็นเจ้าของ
          
          // ตรวจสอบว่าผู้ใช้เป็นผู้เข้าร่วมและยังไม่ชำระ
          const userParticipant = data.participants?.find((p: any) => 
            p.email === user.email && p.status === 'pending'
          );
          
          if (userParticipant) {
            bills.push({
              id: doc.id,
              title: data.title || 'ไม่มีชื่อบิล',
              totalAmount: data.totalAmount || 0,
              createdAt: data.createdAt?.toDate() || new Date(),
              participantName: userParticipant.name,
              amountOwed: userParticipant.amount || 0
            });
            count++;
          }
        });

        setPendingBills(bills.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
        setPendingCount(count);
      } catch (error) {
        console.error('Error fetching pending bills:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBills();
    
    // ตั้งค่า interval เพื่อดึงข้อมูลใหม่ทุก 30 วินาที
    const interval = setInterval(fetchPendingBills, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, firebase.db]);

  return { pendingBills, pendingCount, loading };
}

export default function Navbar() {
  const pathname = usePathname();
  const { openLoginModal, openSignupModal } = useAuthModal();
  const { user, isAuthenticated, logout, userRole } = useAuth();
  const firebase = useSafeFirebase();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { pendingBills, pendingCount, loading } = usePendingBills();
  
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

  // ฟังก์ชันสำหรับจัดรูปแบบวันที่
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'เมื่อสักครู่';
    if (diffInHours < 24) return `${diffInHours} ชั่วโมงที่แล้ว`;
    if (diffInHours < 48) return 'เมื่อวาน';
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;
    
    return date.toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

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
        <div className="flex items-center space-x-2">
          {/* ปุ่มเมนูสำหรับโทรศัพท์มือถือ */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-gray-100" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="เปิด/ปิดเมนู"
          >
            <Menu size={24} />
          </button>
          
          {/* ปุ่มแจ้งเตือนยอดค้างชำระ (แสดงเฉพาะเมื่อล็อกอิน) */}
          {isAuthenticated && (
            <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2 hover:bg-gray-100"
                  aria-label="แจ้งเตือนยอดค้างชำระ"
                >
                  <Bell size={20} />
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>แจ้งเตือนยอดค้างชำระ</span>
                  {pendingCount > 0 && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      {pendingCount} รายการ
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {loading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    กำลังโหลด...
                  </div>
                ) : pendingBills.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {pendingBills.map((bill) => (
                      <DropdownMenuItem key={bill.id} asChild>
                        <Link 
                          href={`/bill/${bill.id}`}
                          className="block p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          onClick={() => setNotificationOpen(false)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                              <Clock size={16} className="text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {bill.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {bill.participantName ? (
                                  <>คุณค้างชำระ ฿{bill.amountOwed?.toLocaleString()}</>
                                ) : (
                                  <>ยอดรวม ฿{bill.totalAmount.toLocaleString()}</>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(bill.createdAt)}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <CheckCircle2 size={24} className="mx-auto mb-2 text-green-500" />
                    <div>ไม่มียอดค้างชำระ</div>
                    <div className="text-xs mt-1">ยินดีด้วย! คุณชำระเงินครบทุกบิลแล้ว</div>
                  </div>
                )}
                
                {pendingBills.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link 
                        href="/bill-history" 
                        className="text-center text-sm text-primary hover:text-primary-dark"
                        onClick={() => setNotificationOpen(false)}
                      >
                        ดูประวัติบิลทั้งหมด
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
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