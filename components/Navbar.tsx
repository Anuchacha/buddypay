"use client";

import Link from "next/link";
import { useAuth } from "../app/context/AuthContext"; // นำเข้าคอนเท็กซ์สำหรับตรวจสอบสถานะผู้ใช้
import { signOut } from "firebase/auth"; // นำเข้าฟังก์ชันสำหรับออกจากระบบจาก Firebase
import { auth } from "../app/lib/firebase"; // นำเข้าการกำหนดค่า Firebase auth ของแอป
import { useState } from "react";
import { usePathname } from 'next/navigation'; // ใช้สำหรับดึง pathname ปัจจุบัน
import { useRouter } from 'next/navigation'; // ใช้สำหรับการนำทางภายในแอป

export default function Navbar() {
  // ดึงข้อมูลผู้ใช้และสถานะ loading จาก AuthContext
  const { user, loading } = useAuth();
  // สถานะสำหรับควบคุมการเปิด/ปิดเมนูสำหรับมือถือ
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // สถานะสำหรับบ่งบอกว่ากำลังดำเนินการออกจากระบบอยู่หรือไม่
  const [isSigningOut, setIsSigningOut] = useState(false);
  // ดึง pathname ปัจจุบันเพื่อใช้เปรียบเทียบเมนูที่ active
  const pathname = usePathname();
  // ใช้สำหรับการนำทางในแอป
  const router = useRouter();

  // ฟังก์ชันสำหรับออกจากระบบ
  const handleSignOut = async () => {
    // หากกำลังดำเนินการออกจากระบบอยู่แล้วจะไม่ดำเนินการซ้ำ
    if (isSigningOut) return;
    
    try {
      setIsSigningOut(true); // เปลี่ยนสถานะให้แสดงว่ากำลังออกจากระบบ
      await signOut(auth); // เรียกใช้ฟังก์ชันออกจากระบบจาก Firebase
      setIsMobileMenuOpen(false); // ปิดเมนูมือถือ (ถ้ามีการเปิดอยู่)
      router.push('/'); // นำทางกลับไปที่หน้าหลักหลังออกจากระบบ
    } catch (error: any) {
      console.error("เกิดข้อผิดพลาดในการออกจากระบบ:", error.message);
      alert("ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSigningOut(false); // คืนค่าสถานะหลังจากดำเนินการเสร็จ
    }
  };

  // แสดงหน้าระหว่างรอโหลดข้อมูลผู้ใช้
  if (loading) {
    return (
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Placeholder สำหรับโลโก้หรือส่วนซ้าย */}
            <div className="flex items-center">
              <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            </div>
            {/* Placeholder สำหรับปุ่มหรือเมนูด้านขวา */}
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // ฟังก์ชันตรวจสอบว่า path ปัจจุบันตรงกับ path ที่ส่งเข้ามาหรือไม่
  const isActivePath = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white shadow fixed top-0 left-0 right-0 z-50">
      {/* Container หลักของ Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* ส่วนซ้ายของ Navbar */}
          <div className="flex">
            {/* โลโก้และชื่อแอป */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
                Last Buddy Pay
              </Link>
            </div>
            {/* เมนูสำหรับ desktop */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* ลิงก์หน้าแรก */}
              <Link
                href="/"
                className={`${
                  isActivePath('/') 
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
              >
                หน้าหลัก
              </Link>
              {/* แสดงลิงก์เพิ่มเติมหากผู้ใช้ได้เข้าสู่ระบบ */}
              {user && (
                <>
                  <Link
                    href="/history"
                    className={`${
                      isActivePath('/history')
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    ประวัติบิล
                  </Link>
                  <Link
                    href="/statistics"
                    className={`${
                      isActivePath('/statistics')
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    สถิติ
                  </Link>
                </>
              )}
            </div>
          </div>
          {/* ส่วนขวาของ Navbar สำหรับ desktop */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              // ถ้าผู้ใช้เข้าสู่ระบบแล้ว
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className={`bg-red-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 ${
                    isSigningOut ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSigningOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
                </button>
              </div>
            ) : (
              // ถ้ายังไม่ได้เข้าสู่ระบบ
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out transform hover:scale-105"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>

          {/* ปุ่มสำหรับเปิดเมนูในมือถือ */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200"
              aria-expanded="false"
            >
              <span className="sr-only">เปิดเมนู</span>
              {/* แสดงไอคอนเมนูตามสถานะเปิด/ปิด */}
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* เมนูสำหรับมือถือ */}
      <div
        className={`sm:hidden transition-all duration-300 ease-in-out transform ${
          isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="pt-2 pb-3 space-y-1 bg-white shadow-lg">
          {/* ลิงก์หน้าแรก */}
          <Link
            href="/"
            className={`${
              isActivePath('/')
                ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
          >
            หน้าหลัก
          </Link>
          {user && (
            <>
              {/* ลิงก์ประวัติบิล */}
              <Link
                href="/history"
                className={`${
                  isActivePath('/history')
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
              >
                ประวัติบิล
              </Link>
              {/* ลิงก์สถิติ */}
              <Link
                href="/statistics"
                className={`${
                  isActivePath('/statistics')
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200`}
              >
                สถิติ
              </Link>
              {/* ส่วนแสดงอีเมล์และปุ่มออกจากระบบ */}
              <div className="pl-3 pr-4 py-2 border-t border-gray-200">
                <span className="block text-sm text-gray-700 mb-2">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className={`w-full bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 ${
                    isSigningOut ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSigningOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
                </button>
              </div>
            </>
          )}
          {!user && (
            // เมนูสำหรับผู้ที่ยังไม่ได้เข้าสู่ระบบในมือถือ
            <div className="pl-3 pr-4 py-2 space-y-2">
              <Link
                href="/login"
                className="block w-full text-center bg-white text-indigo-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-50 border border-indigo-600 transition-colors duration-200"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/signup"
                className="block w-full text-center bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
