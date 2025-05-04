'use client';

import { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import { SplitResult } from '../lib/billCalculator';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { 
  Printer, 
  Download, 
  Loader2, 
  User, 
  Users, 
  Receipt, 
  CreditCard, 
  DollarSign, 
  AlertCircle, 
  Calendar, 
  FileText,
  Coffee,
  Utensils
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { BillSummarySkeleton } from './SkeletonLoaders';
import { useProgressiveLoading, useImagePreloader } from '../hooks/useProgressiveLoading';

// เพิ่ม import styles
import '../styles/shared.css';

// แก้ไขการ import virtualization
const FixedSizeList = dynamic<any>(() => 
  import('react-window').then((mod) => mod.FixedSizeList), 
  { ssr: false }
);

// โหลด QRCode component แบบ dynamic เพื่อป้องกันปัญหา SSR
const QRCode = dynamic(() => import('react-qr-code'), { 
  ssr: false,
  loading: () => <div className="qr-loading flex justify-center items-center h-32 w-32 bg-gray-100 rounded-lg mx-auto">
    <Loader2 className="animate-spin text-primary h-8 w-8" />
  </div>
});

// กำหนดประเภทข้อมูลให้ชัดเจน
type HtmlToImageType = {
  toPng: (node: HTMLElement, options?: object) => Promise<string>;
};

// ประกาศ type ของ Item ให้ชัดเจน
type BillItem = {
  name: string;
  amount: number;
  type?: 'food' | 'service'; // กำหนด type ให้ชัดเจนว่าเป็น 'food' หรือ 'service' เท่านั้น
  quantity?: number;
};

type BillSummaryProps = {
  splitResults?: SplitResult[];
  results?: SplitResult[];
  totalAmount?: number;
  billTitle?: string;
  billDate?: Date;
  billId?: string;
  ownerName?: string;
  items?: BillItem[]; // เพิ่ม items สำหรับรายการอาหารทั้งหมด
  vat?: number;
  discount?: number;
  serviceCharge?: number;
  qrCodeUrl?: string; // URL ของ QR code
  promptPayId?: string; // เบอร์หรือเลข promptpay
  qrPayload?: string; // ข้อมูล QR code สำหรับพร้อมเพย์
  notes?: string; // เพิ่มโน๊ต
};

// กำหนด item type
type ReceiptItem = {
  id: string;
  name: string;
  amount: number;
  description?: {
    food: string;
    service: string;
    discount: number;
    vat: number;
  };
};

// แก้ไข SplitResult type ให้รองรับโครงสร้างข้อมูลที่ต้องการใช้
type SplitResultExtended = SplitResult & {
  items?: BillItem[]; // ใช้ BillItem type ที่ประกาศไว้แล้ว
  discount?: number;
  vat?: number;
};

type GroupedFoodItem = {
  name: string;
  amount: number;
  count: number;
  type?: string;
};

export default function BillSummary({
  splitResults,
  results,
  totalAmount: propTotalAmount,
  billTitle = "BUDDYPAY",
  billDate = new Date(),
  billId = "0001",
  ownerName = "",
  items = [], // รายการอาหารทั้งหมด
  vat = 0,
  discount = 0,
  serviceCharge = 0,
  qrCodeUrl, // URL ของ QR code
  promptPayId, // เบอร์หรือเลข promptpay
  qrPayload, // ข้อมูล QR code สำหรับพร้อมเพย์
  notes
}: BillSummaryProps) {
  // ใช้ progressive loading เพื่อแสดง UI ให้เร็วขึ้น
  const { isLoading } = useProgressiveLoading({
    steps: 2,
    delay: 100
  });
  
  const receiptRef = useRef<HTMLDivElement>(null);
  const [htmlToImageModule, setHtmlToImageModule] = useState<HtmlToImageType | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isModuleLoading, setIsModuleLoading] = useState(false);
  const [moduleError, setModuleError] = useState<string | null>(null);
  
  // Preload QR code image หากมี
  const { isLoaded: isQrLoaded } = useImagePreloader(qrCodeUrl);
  
  // ใช้แค่ results หรือ splitResults อันใดอันหนึ่ง โดยจัดลำดับความสำคัญ
  const finalResults = useMemo(() => results || splitResults || [], [results, splitResults]);
  
  // useMemo สำหรับข้อมูลที่คำนวณแล้ว เพื่อป้องกันการคำนวณซ้ำ
  const participantCount = useMemo(() => finalResults.length, [finalResults]);
  
  // ฟอร์แมตวันที่แบบ Memoized
  const formattedDate = useMemo(() => 
    format(billDate, 'd MMMM yyyy', { locale: th }), 
    [billDate]
  );
  
  // แยกรายการอาหารและจัดกลุ่ม - ใช้ useMemo เพื่อลดการคำนวณซ้ำ
  const foodItems = useMemo(() => {
    if (items.length > 0) return items;
    
    return finalResults.flatMap(item => {
      const extendedItem = item as SplitResultExtended;
      return (extendedItem.items || []).map(i => {
        const billItem = i as BillItem;
        return {
          ...billItem,
          type: billItem.type || 'food'
        };
      });
    }).filter(item => item.type !== 'service');
  }, [items, finalResults]);
  
  // จัดกลุ่มอาหารที่ซ้ำกันและรวมราคา - ใช้ useMemo
  const groupedFoodItems = useMemo<GroupedFoodItem[]>(() => {
    const groupedItems: GroupedFoodItem[] = [];
    
    foodItems.forEach(item => {
      const existingItem = groupedItems.find(i => i.name === item.name);
      if (existingItem) {
        existingItem.count += 1;
        existingItem.amount += item.amount;
      } else {
        groupedItems.push({ 
          ...item, 
          count: 1
        });
      }
    });
    
    return groupedItems;
  }, [foodItems]);
  
  // คำนวณยอดรวมทั้งหมด - ใช้ useMemo
  const {
    subtotal,
    vatAmount,
    serviceChargeAmount,
    totalAmount
  } = useMemo(() => {
    const subtotal = groupedFoodItems.reduce((sum, item) => sum + item.amount, 0);
    const vatAmount = subtotal * vat / 100;
    const serviceChargeAmount = subtotal * serviceCharge / 100;
    const calculatedTotal = subtotal + vatAmount + serviceChargeAmount - discount;
    
    return {
      subtotal,
      vatAmount,
      serviceChargeAmount,
      totalAmount: propTotalAmount !== undefined ? propTotalAmount : calculatedTotal
    };
  }, [groupedFoodItems, vat, serviceCharge, discount, propTotalAmount]);
  
  // ข้อมูลผู้ร่วมจ่าย - ใช้ useMemo
  const receiptParticipants = useMemo(() => {
    return finalResults.map((item, index) => {
      const extendedItem = item as SplitResultExtended;
      const serviceAmount = extendedItem.items?.reduce((sum, i) => {
        const billItem = i as BillItem;
        return sum + (billItem.type === 'service' ? billItem.amount : 0);
      }, 0) || 0;
      
      return {
        id: (index + 1).toString().padStart(2, '0'),
        name: item.participant.name,
        amount: Math.round(item.amount),
        discount: extendedItem.discount || 0,
        vat: extendedItem.vat || 0,
        service: serviceAmount
      };
    });
  }, [finalResults]);
  
  // ค่าเฉลี่ยต่อคน
  const averagePerPerson = useMemo(() => 
    participantCount > 0 ? Math.round(totalAmount / participantCount) : 0, 
    [totalAmount, participantCount]
  );
  
  // ปรับปรุงการโหลดโมดูล - โหลดเฉพาะเมื่อต้องการใช้งาน
  const loadHtmlToImageModule = useCallback(async () => {
    if (htmlToImageModule) return htmlToImageModule; // ถ้าโหลดแล้วไม่ต้องโหลดซ้ำ
    
    try {
      setIsModuleLoading(true);
      const imageModule = await import('../utils/htmlToImageWrapper');
      setHtmlToImageModule(imageModule);
      setModuleError(null);
      return imageModule;
    } catch (err) {
      console.error('ไม่สามารถโหลดโมดูล html-to-image:', err);
      setModuleError('ไม่สามารถโหลดเครื่องมือสร้างรูปภาพได้');
      return null;
    } finally {
      setIsModuleLoading(false);
    }
  }, [htmlToImageModule]);

  // ฟังก์ชันพิมพ์ใบเสร็จ - ใช้ useCallback
  const printReceipt = useCallback(() => {
    window.print();
  }, []);

  // ปรับปรุงฟังก์ชันดาวน์โหลดเป็น PNG - ใช้ useCallback
  const downloadAsImage = useCallback(async () => {
    if (!receiptRef.current) {
      alert('ไม่พบองค์ประกอบใบเสร็จ');
      return;
    }
    
    try {
      setIsDownloading(true);
      
      // ใช้ wrapper module ที่สร้างไว้โดยตรง
      const htmlToImageWrapper = await import('../utils/htmlToImageWrapper');
      
      // ใช้ AbortController เพื่อป้องกันการรอนานเกินไป
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      try {
        // ปรับปรุงคุณภาพของรูปภาพและประสิทธิภาพ
        const dataUrl = await htmlToImageWrapper.toPng(receiptRef.current, {
          quality: 0.95,
          backgroundColor: '#ffffff',
          pixelRatio: window.devicePixelRatio || 1,
          skipAutoScale: true,
          canvasWidth: receiptRef.current.offsetWidth * 2,
          canvasHeight: receiptRef.current.offsetHeight * 2
        });
        
        // สร้างลิงก์ดาวน์โหลดและจำลองการคลิก
        const link = document.createElement('a');
        link.download = `receipt-${billId}-${format(new Date(), 'yyyyMMdd')}.png`;
        link.href = dataUrl;
        link.click();
        
        // ทำความสะอาด URL เพื่อป้องกัน memory leak
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('ไม่สามารถสร้างรูปภาพได้:', error);
      setModuleError('เกิดข้อผิดพลาดในการสร้างรูปภาพ โปรดลองอีกครั้ง');
    } finally {
      setIsDownloading(false);
    }
  }, [billId, receiptRef]);

  // แยกส่วนประกอบย่อยเพื่อลดการเรนเดอร์ซ้ำและปรับปรุงการทำงาน

  // ส่วนแสดงสรุปข้อมูลบิล
  const BillSummaryHeader = useCallback(() => (
    <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">{billTitle}</h1>
        <div className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          {formattedDate}
        </div>
      </div>
      
      {/* ข้อมูลผู้สั่ง */}
      {ownerName && (
        <div className="mt-3 flex items-center text-sm bg-white/10 p-2 rounded-lg">
          <User className="w-4 h-4 mr-2" />
          <span>ผู้สั่งอาหาร: <strong>{ownerName}</strong></span>
        </div>
      )}
      
      {/* ข้อมูลสรุป */}
      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="bg-white/10 p-3 rounded-lg">
          <div className="flex justify-center mb-1">
            <Utensils className="w-5 h-5" />
          </div>
          <div className="text-xs opacity-80">รายการอาหาร</div>
          <div className="text-xl font-bold mt-1">{groupedFoodItems.length}</div>
        </div>
        
        <div className="bg-white/10 p-3 rounded-lg">
          <div className="flex justify-center mb-1">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-xs opacity-80">ผู้ร่วมจ่าย</div>
          <div className="text-xl font-bold mt-1">{participantCount}</div>
        </div>
        
        <div className="bg-white/10 p-3 rounded-lg">
          <div className="flex justify-center mb-1">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-xs opacity-80">ยอดรวม</div>
          <div className="text-xl font-bold mt-1">{Math.round(totalAmount)} ฿</div>
        </div>
      </div>
    </div>
  ), [billTitle, formattedDate, ownerName, groupedFoodItems.length, participantCount, totalAmount]);

  // ส่วนแสดงรายการอาหาร
  const FoodItemsList = useCallback(() => {
    // ลด dependency จาก ReactWindowModule
    return (
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <Utensils className="w-5 h-5 mr-2 text-blue-500" />
          รายการอาหารทั้งหมด
        </h2>
        
        <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
          {/* หัวตาราง */}
          <div className="grid grid-cols-12 gap-2 p-3 border-b bg-gray-100 text-sm font-medium text-gray-600">
            <div className="col-span-7">รายการ</div>
            <div className="col-span-2 text-center">จำนวน</div>
            <div className="col-span-3 text-right">ราคา (บาท)</div>
          </div>
          
          {/* รายการอาหาร - ใช้ virtualization เฉพาะเมื่อมีรายการมาก */}
          <div className="divide-y divide-gray-200 max-h-80">
            {groupedFoodItems.length > 0 ? (
              groupedFoodItems.length > 15 && typeof window !== 'undefined' ? (
                // ไม่ใช้ ReactWindow โดยตรง แต่ใช้ dynamic ระหว่าง listing ธรรมดากับ virtualized
                <div className="overflow-auto max-h-80 scrollbar-thin">
                  {groupedFoodItems.map((item, index) => (
                    <div key={`food-${index}`} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-blue-50/50 transition-standard">
                      <div className="col-span-7 font-medium text-gray-800">{item.name}</div>
                      <div className="col-span-2 text-center text-gray-600">
                        {item.count > 1 ? `${item.count} จาน` : '1 จาน'}
                      </div>
                      <div className="col-span-3 text-right font-semibold text-gray-800">
                        {Math.round(item.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-auto max-h-80 scrollbar-thin">
                  {groupedFoodItems.map((item, index) => (
                    <div key={`food-${index}`} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-blue-50/50 transition-standard">
                      <div className="col-span-7 font-medium text-gray-800">{item.name}</div>
                      <div className="col-span-2 text-center text-gray-600">
                        {item.count > 1 ? `${item.count} จาน` : '1 จาน'}
                      </div>
                      <div className="col-span-3 text-right font-semibold text-gray-800">
                        {Math.round(item.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="p-4 text-center text-gray-500">
                ไม่มีรายการอาหาร
              </div>
            )}
          </div>
          
          {/* รายละเอียดเพิ่มเติม */}
          <div className="border-t border-gray-200 divide-y divide-gray-200">
            {vatAmount > 0 && (
              <div className="grid grid-cols-12 gap-2 p-2 bg-gray-50 items-center">
                <div className="col-span-9 text-gray-600 text-sm">ภาษีมูลค่าเพิ่ม {vat}%</div>
                <div className="col-span-3 text-right font-medium text-gray-700">
                  {Math.round(vatAmount)}
                </div>
              </div>
            )}
            
            {serviceChargeAmount > 0 && (
              <div className="grid grid-cols-12 gap-2 p-2 bg-gray-50 items-center">
                <div className="col-span-9 text-gray-600 text-sm">ค่าบริการ {serviceCharge}%</div>
                <div className="col-span-3 text-right font-medium text-gray-700">
                  {Math.round(serviceChargeAmount)}
                </div>
              </div>
            )}
            
            {discount > 0 && (
              <div className="grid grid-cols-12 gap-2 p-2 bg-gray-50 items-center">
                <div className="col-span-9 text-gray-600 text-sm">ส่วนลด</div>
                <div className="col-span-3 text-right font-medium text-red-600">
                  -{Math.round(discount)}
                </div>
              </div>
            )}
            
            {/* ยอดรวม */}
            <div className="grid grid-cols-12 gap-2 p-3 bg-blue-50 items-center">
              <div className="col-span-9 font-semibold text-blue-800">ยอดรวมทั้งสิ้น</div>
              <div className="col-span-3 text-right font-bold text-blue-800 text-lg">
                {Math.round(totalAmount)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [groupedFoodItems, vat, vatAmount, serviceCharge, serviceChargeAmount, discount, totalAmount]);

  // ส่วนแสดงผู้ร่วมจ่าย
  const ParticipantList = useCallback(() => (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
        <Users className="w-5 h-5 mr-2 text-blue-500" />
        แบ่งชำระค่าอาหาร
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {receiptParticipants.map((participant) => (
          <div 
            key={participant.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* ข้อมูลรายบุคคล */}
            <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold ${participant.name === ownerName ? 'bg-green-100 text-green-600' : ''}`}>
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <span className="ml-2 font-medium text-gray-800">{participant.name}</span>
              </div>
              
              {participant.name === ownerName && (
                <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                  ผู้สั่ง
                </div>
              )}
            </div>
            
            {/* ส่วนแบ่ง */}
            <div className="p-4 text-center">
              <div className="text-sm text-gray-500 mb-1">ส่วนแบ่งที่ต้องชำระ</div>
              <div className="text-2xl font-bold text-blue-600">{participant.amount} ฿</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ), [receiptParticipants, ownerName]);

  // ส่วนแสดง QR Code
  const PaymentSection = useCallback(() => (
    (qrPayload || qrCodeUrl) ? (
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
          วิธีการชำระเงิน
        </h2>
        
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row items-center justify-center">
          {/* QR Code - ใช้ Suspense และ lazy loading พร้อม placeholder */}
          <div className="md:mr-6 mb-4 md:mb-0">
            <p className="text-center mb-2 text-sm font-medium text-gray-700">สแกนเพื่อชำระเงิน</p>
            <div className="bg-white p-2 rounded-lg shadow-sm inline-block min-h-[150px] min-w-[150px] flex items-center justify-center">
              {qrPayload ? (
                <Suspense fallback={<Loader2 className="animate-spin text-primary h-8 w-8" />}>
                  <QRCode
                    value={qrPayload}
                    size={150}
                    level="M"
                    className="mx-auto"
                  />
                </Suspense>
              ) : qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code Payment" 
                  className="mx-auto"
                  width={150}
                  height={150}
                  loading="lazy"
                  onError={(e) => {
                    // แสดง placeholder เมื่อโหลดรูปไม่สำเร็จ
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f9fafb'/%3E%3Ctext x='75' y='75' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%236b7280'%3EQR Code%3C/text%3E%3C/svg%3E";
                  }}
                  style={{ 
                    opacity: isQrLoaded ? 1 : 0.5, 
                    transition: 'opacity 0.3s ease-in-out'
                  }}
                />
              ) : null}
            </div>
          </div>
          
          {/* รายละเอียด */}
          <div className="text-center md:text-left">
            {promptPayId && (
              <div className="mb-2">
                <div className="text-sm text-gray-600 mb-1">พร้อมเพย์:</div>
                <div className="font-semibold text-gray-800">{promptPayId}</div>
              </div>
            )}
            
            <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg mt-3 flex items-start">
              <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
              <span>กรุณาตรวจสอบชื่อและเลขบัญชีก่อนโอนเงิน</span>
            </div>
          </div>
        </div>
      </div>
    ) : null
  ), [qrPayload, qrCodeUrl, promptPayId, isQrLoaded]);

  // ส่วนแสดงโน๊ต
  const NotesSection = useCallback(() => (
    notes ? (
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-500" />
          โน๊ต
        </h2>
        
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
          <div className="text-gray-700 text-sm whitespace-pre-wrap">{notes}</div>
        </div>
      </div>
    ) : null
  ), [notes]);

  // สรุปการคำนวณ
  const SummarySection = useCallback(() => (
    <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 mt-6">
      <h3 className="font-semibold text-blue-800 mb-2 flex items-center text-sm">
        <Receipt className="w-4 h-4 mr-2" />
        สรุปการคำนวณ
      </h3>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-gray-600">จำนวนรายการอาหาร:</div>
        <div className="text-gray-800 font-medium">{groupedFoodItems.length} รายการ</div>
        
        <div className="text-gray-600">จำนวนผู้ร่วมจ่าย:</div>
        <div className="text-gray-800 font-medium">{participantCount} คน</div>
        
        <div className="text-gray-600">ยอดรวมทั้งสิ้น:</div>
        <div className="text-gray-800 font-medium">{Math.round(totalAmount)} บาท</div>
        
        <div className="text-gray-600">ค่าเฉลี่ยต่อคน:</div>
        <div className="text-gray-800 font-medium">{averagePerPerson} บาท</div>
      </div>
    </div>
  ), [groupedFoodItems.length, participantCount, totalAmount, averagePerPerson]);

  // แบ่งการโหลด component ย่อยเพื่อให้หน้าแสดงได้เร็วขึ้น
  if (isLoading) {
    return <BillSummarySkeleton />;
  }
  
  return (
    <div className="max-w-2xl mx-auto p-4 font-sans">
      {/* ปุ่มดำเนินการ */}
      <div className="flex justify-end gap-3 mb-4 print:hidden">
        <button 
          onClick={printReceipt} 
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          aria-label="พิมพ์ใบเสร็จ"
        >
          <Printer size={16} />
          <span>พิมพ์</span>
        </button>
        
        <button 
          onClick={downloadAsImage} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
          disabled={isDownloading || isModuleLoading || !!moduleError}
          aria-label="ดาวน์โหลดใบเสร็จเป็นรูปภาพ"
        >
          {isDownloading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>กำลังดาวน์โหลด...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>บันทึกเป็นรูปภาพ</span>
            </>
          )}
        </button>
      </div>
      
      {/* แสดงข้อผิดพลาด */}
      {moduleError && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="flex items-center">
            <AlertCircle size={16} className="mr-2" />
            {moduleError}
          </p>
        </div>
      )}
      
      {/* สรุปบิล */}
      <div 
        ref={receiptRef} 
        className="bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none"
      >
        {/* ส่วนหัว - ข้อมูลบิล */}
        <BillSummaryHeader />
        
        {/* ส่วนเนื้อหา - แยกเป็นส่วนๆ เพื่อเพิ่มประสิทธิภาพ */}
        <div className="p-5">
          {/* รายการอาหาร */}
          <Suspense fallback={<div className="h-40 bg-gray-50 animate-pulse rounded-lg"></div>}>
            <FoodItemsList />
          </Suspense>
          
          {/* ผู้ร่วมจ่าย */}
          <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse rounded-lg my-6"></div>}>
            <ParticipantList />
          </Suspense>
          
          {/* วิธีการชำระเงิน */}
          <Suspense fallback={<div className="h-24 bg-gray-50 animate-pulse rounded-lg my-6"></div>}>
            <PaymentSection />
          </Suspense>
          
          {/* โน๊ต */}
          <NotesSection />
          
          {/* สรุปรวม */}
          <SummarySection />
        </div>
        
        {/* ฟุตเตอร์ */}
        <div className="p-4 border-t text-center text-gray-500 text-sm bg-gray-50">
          <p>ขอบคุณที่ใช้บริการ</p>
          <p className="text-xs mt-1">สร้างด้วย BUDDYPAY</p>
        </div>
      </div>
      
      {/* สไตล์สำหรับการพิมพ์ */}
      <style jsx>{`
        @media print {
          body {
            background: white;
            margin: 0;
            padding: 0;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
