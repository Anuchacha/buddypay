'use client';

// นำเข้าคอมโพเนนต์ Button จากที่อยู่ที่กำหนด
import { Suspense, lazy, useEffect } from 'react';
import { Button } from '@/app/components/ui/Button';
// นำเข้าคอมโพเนนต์ของ Card ที่ใช้ในหน้า Home
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/Card';
// นำเข้าคอนเท็กซ์สำหรับ Auth Modal เพื่อใช้เปิด modal สำหรับการเข้าสู่ระบบหรือสมัครสมาชิก
import { useAuthModal } from './context/AuthModalContext';
import Image from 'next/image';

// ใช้ Dynamic Import สำหรับคอมโพเนนต์ที่ไม่จำเป็นต้องโหลดทันที
const ChatbotButton = lazy(() => import('./components/ChatbotButton'));
const PopularCategories = lazy(() => import('@/components/PopularCategories').then(mod => ({ default: mod.PopularCategories })));

// กำหนด list ของฟีเจอร์ที่จะแสดงใน Hero Section
const features = [
  { title: 'แบ่งบิลแสนง่าย', description: 'คำนวณค่าอาหาร ค่าเช่า หรือค่าใช้จ่ายต่างๆ ระหว่างเพื่อนได้อย่างรวดเร็ว', icon: '🧮' },
  { title: 'ชำระเงินได้ทันที', description: 'รองรับการชำระเงินผ่าน QR Code เพื่อความสะดวกในการจ่ายเงินให้เพื่อน', icon: '💸' },
  { title: 'บันทึกประวัติครบถ้วน', description: 'เก็บประวัติการแชร์บิลทั้งหมด ดูย้อนหลังได้ตลอดเวลา', icon: '📊' },
  { title: 'แจ้งเตือนยอดค้างชำระ', description: 'ระบบแจ้งเตือนอัตโนมัติเมื่อมียอดค้างชำระ ไม่พลาดการจ่ายอีกต่อไป', icon: '🔔' },
];

// สร้างคอมโพเนนต์ Home ซึ่งเป็นหน้าแรกของแอป
export default function Home() {
  // ดึงฟังก์ชัน openLoginModal และ openSignupModal จาก AuthModalContext
  const { openLoginModal, openSignupModal } = useAuthModal();
  
  // เพิ่ม useEffect เพื่อทำ preload resources ที่จำเป็น
  useEffect(() => {
    // แก้ไขการโหลดรูปภาพล่วงหน้า
    const preloadImage = () => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = '/icon.png';
      document.head.appendChild(link);
    };
    
    preloadImage();
    
    // LCP optimization
    const lcpElement = document.getElementById('main-heading');
    if (lcpElement) {
      // Set high priority to LCP element in browser's rendering engine
      if ('priority' in lcpElement) {
        (lcpElement as any).priority = 'high';
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section: ส่วนส่วนบนของหน้าแสดงข้อมูลหลัก */}
      <section className="bg-gradient-to-r from-primary to-secondary py-20 text-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col-reverse md:flex-row items-center gap-10">
            {/* ส่วนข้อความใน Hero */}
            <div className="md:w-1/2 space-y-6">
              {/* ปรับแต่ง LCP Element ให้โหลดเร็วขึ้น */}
              <h1 
                className="text-4xl md:text-5xl font-bold leading-tight" 
                id="main-heading"
                style={{ contentVisibility: 'auto' }}
              >
                แบ่งบิลกับเพื่อน<br />
                <span className="text-yellow-200">ไม่ยุ่งยากอีกต่อไป</span>
              </h1>
              <noscript>
                <style dangerouslySetInnerHTML={{ __html: '#main-heading { opacity: 1 !important; }' }} />
              </noscript>
              <p className="text-lg md:text-xl opacity-90">
                BuddyPay ช่วยให้คุณคำนวณค่าใช้จ่ายร่วมกับเพื่อน ครอบครัว หรือเพื่อนร่วมงานได้อย่างง่ายดาย ไม่มีความยุ่งยากในการคำนวณอีกต่อไป
              </p>
              <div className="flex flex-wrap gap-4">
                {/* ปุ่มเริ่มคำนวณบิล */}
                <Button 
                  onClick={() => location.href = '/share-bill'} 
                  size="lg" 
                  className="shadow-lg"
                >
                  เริ่มคำนวณบิล
                </Button>
                {/* ปุ่มสำหรับเปิด modal สมัครสมาชิก */}
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={openSignupModal}
                >
                  สมัครสมาชิก
                </Button>
              </div>
            </div>
            {/* ส่วนรูปหรือไอคอนใน Hero */}
            <div className="md:w-1/2 flex justify-center">
              <div className="w-80 h-80 flex flex-col items-center justify-center p-8 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center">
                {/* แสดงไอคอน 💰 */}
                <div className="text-8xl mb-4">💰</div>
               
                <h3 className="text-2xl font-bold mb-2">คำนวณบิลง่ายๆ</h3>
                <p className="opacity-90">แชร์ค่าใช้จ่ายกับเพื่อนอย่างเป็นธรรม ไม่มีใครได้เปรียบเสียเปรียบ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section: ส่วนแสดงฟีเจอร์ต่างๆ ของแอป */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">ทำไมต้อง BuddyPay</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              แอปพลิเคชันที่ออกแบบมาเพื่อช่วยให้การแชร์บิลกับเพื่อนเป็นเรื่องง่ายและสนุก ไม่มีความยุ่งยากในการคำนวณอีกต่อไป
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* วนลูปแสดงฟีเจอร์แต่ละอันในรูปแบบ Card */}
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-t-4 border-t-primary hover:-translate-y-1 transition-all duration-300"
              >
                <CardHeader>
                  <div className="text-3xl mb-2">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ใช้ Suspense สำหรับคอมโพเนนต์อื่นๆ ที่ไม่ใช่ LCP */}
      <Suspense fallback={<div className="py-16 bg-gray-50 text-center">กำลังโหลด...</div>}>
        {/* How it works Section: ส่วนแสดงขั้นตอนการใช้งาน */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">วิธีการใช้งาน</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                เพียง 3 ขั้นตอนง่ายๆ คุณก็สามารถแชร์บิลกับเพื่อนได้อย่างสะดวกและรวดเร็ว
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
              {/* ขั้นตอนที่ 1: เพิ่มรายการ */}
              <Card className="md:w-1/3 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4">1</div>
                  <CardTitle>เพิ่มรายการ</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">เพิ่มรายการค่าใช้จ่ายทั้งหมดของคุณพร้อมราคา</p>
                </CardContent>
              </Card>
              
              {/* ขั้นตอนที่ 2: ระบุผู้ร่วมจ่าย */}
              <Card className="md:w-1/3 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4">2</div>
                  <CardTitle>ระบุผู้ร่วมจ่าย</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">เลือกว่าใครเป็นคนจ่ายแต่ละรายการ และใครเป็นคนร่วมรับผิดชอบ</p>
                </CardContent>
              </Card>
              
              {/* ขั้นตอนที่ 3: ดูสรุปบิล */}
              <Card className="md:w-1/3 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4">3</div>
                  <CardTitle>ดูสรุปบิล</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">รับผลลัพธ์การคำนวณที่แสดงว่าใครต้องจ่ายให้ใครเท่าไร</p>
                </CardContent>
              </Card>
            </div>
            
            {/* ปุ่มสำหรับเริ่มคำนวณบิล */}
            <div className="mt-12 text-center">
              <Button 
                size="lg" 
                className="px-8"
                onClick={() => location.href = '/share-bill'}
              >
                เริ่มคำนวณเลย
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section: Call To Action ส่วนกระตุ้นให้ผู้ใช้ลงมือทำ */}
        <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">พร้อมที่จะแชร์บิลอย่างง่ายดาย?</h2>
              <p className="text-lg max-w-2xl mx-auto mb-8 opacity-90">
                สมัครสมาชิกวันนี้เพื่อบันทึกประวัติการแชร์บิลและใช้งานฟีเจอร์พิเศษทั้งหมด
              </p>
              <div className="flex justify-center gap-4">
                {/* ปุ่มสำหรับสมัครสมาชิก */}
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={openSignupModal}
                >
                  สมัครสมาชิกฟรี
                </Button>
                {/* ปุ่มสำหรับทดลองใช้งาน */}
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={() => location.href = '/share-bill'}
                >
                  ทดลองใช้งานก่อน
                </Button>
              </div>
            </div>
          </div>
        </section>
      </Suspense>

      {/* Footer: ส่วนท้ายของหน้า */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* โลโก้และข้อมูลพื้นฐานของแอป */}
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-white text-primary flex items-center justify-center font-bold">
                  LB
                </div>
                <span className="text-xl font-bold">BuddyPay</span>
              </div>
              <p className="text-gray-400 max-w-sm">
                แอปพลิเคชันคำนวณและแชร์บิลกับเพื่อนที่ง่ายที่สุด
              </p>
            </div>
            
            {/* ลิงก์สำหรับเมนูใน Footer */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {/* คอลัมน์เมนู ฟีเจอร์ */}
              <div>
                <h4 className="font-bold mb-4">ฟีเจอร์</h4>
                <ul className="space-y-2">
                  <li><a href="/share-bill" className="text-gray-400 hover:text-white transition-colors">คำนวณบิล</a></li>
                  <li><a href="/history" className="text-gray-400 hover:text-white transition-colors">ประวัติบิล</a></li>
                  <li><a href="/statistics" className="text-gray-400 hover:text-white transition-colors">สถิติ</a></li>
                </ul>
              </div>
              
              {/* คอลัมน์เมนู บัญชี */}
              <div>
                <h4 className="font-bold mb-4">บัญชี</h4>
                <ul className="space-y-2">
                  <li>
                    <button 
                      onClick={openLoginModal} 
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      เข้าสู่ระบบ
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={openSignupModal} 
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      สมัครสมาชิก
                    </button>
                  </li>
                </ul>
              </div>
              
              {/* คอลัมน์เมนู ช่วยเหลือ */}
              <div>
                <h4 className="font-bold mb-4">ช่วยเหลือ</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">คำถามที่พบบ่อย</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">ติดต่อเรา</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* ส่วนล่างสุดของ Footer */}
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} BuddyPay. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* เพิ่ม ChatbotButton เพื่อช่วยเหลือผู้ใช้ในการสอบถามข้อมูล */}
      <ChatbotButton 
        defaultSystemPrompt="คุณเป็นผู้ช่วยอัจฉริยะของแอพพลิเคชัน BuddyPay ซึ่งช่วยในการแบ่งบิลและคำนวณค่าใช้จ่ายระหว่างเพื่อน คุณสามารถให้ข้อมูลเกี่ยวกับวิธีการแบ่งบิล การชำระเงินผ่าน QR Code และ PromptPay รวมถึงฟีเจอร์ต่างๆ ของแอพพลิเคชัน เช่น การบันทึกประวัติการแชร์บิล การแจ้งเตือนยอดค้างชำระ และอื่นๆ"
        position="bottom-right"
        botName="BuddyPay Helper"
        primaryColor="bg-primary"
      />
    </div>
  );
}
