// นำเข้าประเภท Metadata จาก Next.js เพื่อระบุข้อมูลเมตาของหน้าเว็บ
import type { Metadata } from "next";
// นำเข้า Font "Inter" จาก Google Fonts
import { Inter } from "next/font/google";
// นำเข้าไฟล์สไตล์ globals.css สำหรับกำหนดสไตล์ทั่วโลก
import "./globals.css";
// นำเข้าคอมโพเนนต์ Providers สำหรับครอบคลุม Context ต่างๆ (เช่น authentication, theme, ฯลฯ)
import Providers from './providers';
import { FirebaseProvider } from './components/providers/FirebaseWrapper';
import { AuthProvider } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext';
import AppShell from './components/AppShell';
import ChatbotPopup from './components/ChatbotPopup';

// กำหนดการใช้งานฟอนต์ Inter พร้อมกำหนด subset ของตัวอักษรที่ใช้ (latin)
const inter = Inter({ 
  subsets: ["latin", "latin-ext"], // เพิ่ม latin-ext
  display: 'swap', // เพิ่ม display swap เพื่อให้ข้อความแสดงผลด้วยฟอนต์สำรองก่อน
  preload: true,   // preload ฟอนต์
  fallback: ['system-ui', 'arial', 'sans-serif'] // เพิ่ม fallback fonts
});

// กำหนด metadata ของแอปพลิเคชัน
export const metadata: Metadata = {
  title: {
    default: "BuddyPay - แชร์บิลกับเพื่อนแสนง่าย",
    template: "%s | BuddyPay"
  },
  description: "แอปพลิเคชันแชร์บิลและแบ่งค่าใช้จ่ายระหว่างเพื่อน",
  metadataBase: new URL('https://buddypay.app'), 
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
  },
  alternates: {
    types: {
      'application/rss+xml': '/rss'
    }
  }
};

// revalidate ทุก 24 ชม.
export const revalidate = 86400;

// คอมโพเนนต์ RootLayout เป็นส่วนหลักของแอปที่ครอบคลุมทุกหน้า
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ระบุภาษาเป็น "en" และใช้ suppressHydrationWarning เพื่อป้องกันข้อความ warning ในระหว่าง hydration
    <html lang="th" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://firebaseapp.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/icon.png"
          as="image"
        />
        {/* ปรับปรุง Content Security Policy */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseapp.com;"
        />
        {/* ใช้ style tag แบบ inline ดีกว่าสำหรับ critical CSS */}
        <style dangerouslySetInnerHTML={{ __html: `
          /* Critical CSS for LCP */
          .bg-gradient-to-r.from-primary.to-secondary {
            background-image: linear-gradient(to right, #3b82f6, #4f46e5);
          }
          h1.text-4xl.md\\:text-5xl.font-bold.leading-tight {
            font-size: 2.25rem;
            line-height: 2.5rem;
            font-weight: 700;
            margin-top: 0;
            color: white;
          }
          @media (min-width: 768px) {
            h1.text-4xl.md\\:text-5xl.font-bold.leading-tight {
              font-size: 3rem;
              line-height: 1;
            }
          }
        `}} />
      </head>
      <body className={inter.className}>
        <FirebaseProvider>
          <AuthProvider>
            <AuthModalProvider>
              <Providers>
                <AppShell>{children}</AppShell>
              </Providers>
            </AuthModalProvider>
          </AuthProvider>
        </FirebaseProvider>
        <ChatbotPopup 
          apiKey={process.env.NEXT_PUBLIC_OPENAI_API_KEY}
          defaultSystemPrompt="คุณเป็นผู้ช่วยอัจฉริยะของแอพพลิเคชัน BuddyPay ซึ่งช่วยในการแบ่งบิลและคำนวณค่าใช้จ่ายระหว่างเพื่อน คุณสามารถให้คำแนะนำเกี่ยวกับ: \n\n1. วิธีการใช้งานแอพพลิเคชัน BuddyPay \n2. การแบ่งบิลด้วยวิธีต่างๆ (แบ่งเท่ากัน หรือตามรายการอาหาร) \n3. การใช้งานระบบชำระเงินผ่าน QR Code และ PromptPay \n4. การบันทึกประวัติการแชร์บิล \n5. การแก้ไขปัญหาที่อาจเกิดขึ้นระหว่างการใช้งาน \n6. คำถามทั่วไปเกี่ยวกับการแบ่งบิลและการชำระเงิน \n\nคุณจะให้ข้อมูลที่ถูกต้องและเป็นประโยชน์เสมอ พร้อมทั้งใช้ภาษาที่เป็นมิตรและเข้าใจง่าย"
          position="bottom-right"
          botName="BuddyPay Helper"
          primaryColor="bg-blue-600"
        />
      </body>
    </html>
  );
}
