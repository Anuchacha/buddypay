'use client';

import { useState, useEffect, useRef } from 'react';
import { SplitResult } from '../lib/billCalculator';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Printer, Download, Loader2 } from 'lucide-react';
import styles from './BillSummary.module.css';
import dynamic from 'next/dynamic';

// โหลด QRCode component แบบ dynamic เพื่อป้องกันปัญหา SSR
const QRCode = dynamic(() => import('react-qr-code'), { 
  ssr: false,
  loading: () => <div className="qr-loading">กำลังโหลด QR Code...</div>
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

export default function BillSummary({
  splitResults,
  results,
  totalAmount: propTotalAmount,
  billTitle = "LASTBUDDYPAY",
  billDate = new Date(),
  billId = "0001",
  ownerName = "",
  items = [], // รายการอาหารทั้งหมด
  vat,
  discount,
  serviceCharge,
  qrCodeUrl, // URL ของ QR code
  promptPayId, // เบอร์หรือเลข promptpay
  qrPayload, // ข้อมูล QR code สำหรับพร้อมเพย์
  notes
}: BillSummaryProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [authCode] = useState(Math.floor(100000 + Math.random() * 900000).toString());
  const [htmlToImageModule, setHtmlToImageModule] = useState<HtmlToImageType | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isModuleLoading, setIsModuleLoading] = useState(true);
  const [moduleError, setModuleError] = useState<string | null>(null);
  
  // ปรับปรุงการโหลดโมดูล
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsModuleLoading(true);
      
      import('html-to-image')
        .then((module) => {
          setHtmlToImageModule(module);
          setModuleError(null);
        })
        .catch((err) => {
          console.error('ไม่สามารถโหลดโมดูล html-to-image:', err);
          setModuleError('ไม่สามารถโหลดเครื่องมือสร้างรูปภาพได้');
        })
        .finally(() => {
          setIsModuleLoading(false);
        });
    }
  }, []);
  
  // ปรับปรุงการคำนวณ
  const calculatedTotalEqual = results?.reduce((sum, result) => sum + (result?.amount || 0), 0) || 0;
  const totalEqual = propTotalAmount !== undefined ? propTotalAmount : calculatedTotalEqual;
  
  const formattedDate = format(billDate, 'EEEE, MMMM d, yyyy', { locale: th }).toUpperCase();
  
  // ใช้แค่ results หรือ splitResults อันใดอันหนึ่ง โดยจัดลำดับความสำคัญ
  const finalResults = results || splitResults || [];
  const participantCount = finalResults.length;
  
  // แยกรายการอาหารออกมาแสดงก่อน
  const foodItems = items.length > 0 
    ? items 
    : finalResults.flatMap(item => {
        const extendedItem = item as SplitResultExtended;
        return (extendedItem.items || []).map(i => {
          const billItem = i as BillItem;
          return {
            ...billItem,
            type: billItem.type || 'food'
          };
        });
      }).filter(item => item.type !== 'service');
  
  // จัดกลุ่มอาหารที่ซ้ำกันและรวมราคา
  const groupedFoodItems: { name: string; amount: number; count: number; type?: string }[] = [];
  foodItems.forEach(item => {
    const existingItem = groupedFoodItems.find(i => i.name === item.name);
    if (existingItem) {
      existingItem.count += 1;
      existingItem.amount += item.amount;
    } else {
      groupedFoodItems.push({ 
        ...item, 
        count: 1
      });
    }
  });
  
  // คำนวณยอดรวมทั้งหมด
  const subtotal = groupedFoodItems.reduce((sum, item) => sum + item.amount, 0);
  const vatAmount = subtotal * (vat || 0) / 100;
  const serviceChargeAmount = subtotal * (serviceCharge || 0) / 100;
  const totalAmount = subtotal + vatAmount + serviceChargeAmount - (discount || 0);
  
  // ข้อมูลผู้ร่วมจ่าย
  const receiptParticipants = finalResults.map((item, index) => {
    const extendedItem = item as SplitResultExtended;
    const serviceAmount = extendedItem.items?.reduce((sum, i) => {
      const billItem = i as BillItem;
      return sum + (billItem.type === 'service' ? billItem.amount : 0);
    }, 0) || 0;
    
    return {
      id: (index + 1).toString().padStart(2, '0'),
      name: item.participant.name.toUpperCase(),
      amount: Math.round(item.amount),
      discount: extendedItem.discount || 0,
      vat: extendedItem.vat || 0,
      service: serviceAmount
    };
  });

  // ฟังก์ชันพิมพ์ใบเสร็จ
  const printReceipt = () => {
    window.print();
  };

  // ปรับปรุงฟังก์ชันดาวน์โหลดเป็น PNG
  const downloadAsImage = async () => {
    if (!receiptRef.current) {
      alert('ไม่พบองค์ประกอบใบเสร็จ');
      return;
    }
    
    if (!htmlToImageModule) {
      alert('ไม่สามารถสร้างรูปภาพได้ กรุณาลองใหม่อีกครั้ง');
      return;
    }
    
    try {
      setIsDownloading(true);
      const dataUrl = await htmlToImageModule.toPng(receiptRef.current, {
        quality: 0.95,
        backgroundColor: '#ffffff'
      });
      
      // สร้างลิงก์ดาวน์โหลดและจำลองการคลิก
      const link = document.createElement('a');
      link.download = `receipt-${billId}-${format(new Date(), 'yyyyMMdd')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('ไม่สามารถสร้างรูปภาพได้:', error);
      alert('เกิดข้อผิดพลาดในการสร้างรูปภาพ โปรดลองอีกครั้ง');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="receipt-container">
      <div className="receipt-actions">
        <button 
          onClick={printReceipt} 
          className="receipt-action-button"
          aria-label="พิมพ์ใบเสร็จ"
        >
          <Printer size={16} />
          <span>พิมพ์</span>
        </button>
        
        <button 
          onClick={downloadAsImage} 
          className="receipt-action-button"
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
              <span>ดาวน์โหลด</span>
            </>
          )}
        </button>
        
        {moduleError && (
          <div className="module-error">
            <p>{moduleError}</p>
          </div>
        )}
      </div>
      
      <div className="receipt" ref={receiptRef}>
        <div className="receipt-header">
          <h1>{billTitle}</h1>
          <p>LAST MONTH</p>
          <p>ORDER #{billId}{ownerName ? ` FOR ${ownerName}` : ''}</p>
          <p>{formattedDate}</p>
          <div className="receipt-divider">------------------------------</div>
        </div>
        
        {/* แสดงรายการอาหาร */}
        <div className="receipt-items">
          <div className="receipt-section-title">รายการอาหาร</div>
          <div className="receipt-column-headers">
            <span>ITEM</span>
            <span>QTY</span>
            <span>AMT</span>
          </div>
          <div className="receipt-divider">------------------------------</div>
          
          {groupedFoodItems.length > 0 ? (
            groupedFoodItems.map((item, index) => (
              <div key={`food-${index}`} className="receipt-item">
                <span className="receipt-item-name">
                  {item.name}
                </span>
                <span className="receipt-item-qty">
                  {item.count > 1 ? `x${item.count}` : '-'}
                </span>
                <span className="receipt-item-amount">{Math.round(item.amount)}</span>
              </div>
            ))
          ) : (
            <div className="receipt-item">
              <span className="receipt-item-name">ไม่มีรายการ</span>
              <span className="receipt-item-qty">-</span>
              <span className="receipt-item-amount">-</span>
            </div>
          )}
        </div>
        
        <div className="receipt-divider">------------------------------</div>
        
        {/* แสดงรายละเอียดเพิ่มเติม */}
        <div className="receipt-details">
          {vatAmount > 0 && (
            <div className="receipt-detail-item">
              <span>VAT</span>
              <span>{Math.round(vatAmount)}</span>
            </div>
          )}
          {serviceChargeAmount > 0 && (
            <div className="receipt-detail-item">
              <span>ค่าบริการ</span>
              <span>{Math.round(serviceChargeAmount)}</span>
            </div>
          )}
          {(discount || 0) > 0 && (
            <div className="receipt-detail-item">
              <span>ส่วนลด</span>
              <span>{Math.round(discount || 0)}</span>
            </div>
          )}
          <div className="receipt-detail-item total">
            <span>ยอดรวมต้องชำระ</span>
            <span>{Math.round(totalAmount)}</span>
          </div>
        </div>
        
        <div className="receipt-divider">------------------------------</div>
        
        {/* แสดงรายชื่อผู้ร่วมจ่าย */}
        <div className="receipt-participants">
          <div className="receipt-section-title">รายชื่อผู้ร่วมจ่าย</div>
          <div className="receipt-divider">------------------------------</div>
          
          {receiptParticipants.map((participant) => (
            <div key={participant.id} className="receipt-participant-item">
              <div className="receipt-participant-name">{participant.name}</div>
              <div className="receipt-participant-amount">{participant.amount}</div>
            </div>
          ))}
        </div>
        
        <div className="receipt-divider">------------------------------</div>
        <div className="receipt-summary">
          <p>จำนวนรายการ: {groupedFoodItems.length}</p>
          <p>จำนวนผู้ร่วมจ่าย: {participantCount}</p>
          {totalAmount > 0 && <p>ยอดรวมต้องชำระ: {Math.round(totalAmount)}</p>}
          {receiptParticipants.some(p => p.vat > 0) && (
            <p>VAT: {receiptParticipants.reduce((sum, p) => sum + (p.vat || 0), 0)}</p>
          )}
          {receiptParticipants.some(p => p.discount > 0) && (
            <p>ส่วนลด: {receiptParticipants.reduce((sum, p) => sum + (p.discount || 0), 0)}</p>
          )}
        </div>
        
        {/* แสดง QR code และข้อมูลการชำระเงิน */}
        <div className="receipt-payment">
          {(qrPayload || qrCodeUrl) && (
            <div className="receipt-qrcode">
              <p className="text-center text-sm mb-2">สแกนเพื่อชำระเงิน</p>
              <div className="flex justify-center mb-2">
                {qrPayload ? (
                  <QRCode
                    value={qrPayload}
                    size={150}
                    level="M"
                    className="qr-image"
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                ) : qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code Payment" 
                    className="qr-image"
                    width={150}
                    height={150}
                  />
                ) : null}
              </div>
              {promptPayId && (
                <>
                  <p className="text-center text-xs mb-2">พร้อมเพย์: {promptPayId}</p>
                  <p className="text-center text-xs mb-2 payment-warning">⚠️ กรุณาตรวจสอบชื่อและเลขบัญชีก่อนโอนเงิน</p>
                </>
              )}
            </div>
          )}
        </div>
        
        {notes && (
          <div className="receipt-notes">
            <div className="receipt-section-title note-title">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="note-icon"><path d="M14 3v4a1 1 0 0 0 1 1h4"></path><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"></path></svg>
              โน๊ต
            </div>
            <div className="receipt-note-content">{notes}</div>
          </div>
        )}
        
        <div className="receipt-footer">
          <p>THANK YOU FOR VISITING!</p>
          <div className="receipt-barcode">|||||||||||||||||||||||||||||||</div>
          <p>lastbuddypay.app</p>
        </div>
      </div>
      
      <style jsx>{`
        .receipt-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }
        
        .receipt-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .receipt-action-button {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 12px;
          background: #f0f0f0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }
        
        .receipt-action-button:hover {
          background: #e0e0e0;
        }
        
        .receipt {
          font-family: 'Courier New', monospace;
          width: 300px;
          padding: 20px;
          background-color: white;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
          text-transform: uppercase;
          font-weight: bold;
          transition: transform 0.3s ease;
        }
        
        .receipt::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.05;
          pointer-events: none;
        }
        
        .receipt-header {
          text-align: center;
          margin-bottom: 15px;
        }
        
        .receipt-header h1 {
          font-size: 22px;
          margin: 0 0 5px 0;
        }
        
        .receipt-header p {
          margin: 5px 0;
          font-size: 12px;
        }
        
        .receipt-divider {
          margin: 5px 0;
          opacity: 0.8;
          font-size: 14px;
        }
        
        .receipt-column-headers {
          display: grid;
          grid-template-columns: 1fr 60px 80px;
          font-size: 12px;
          margin-bottom: 5px;
        }
        
        .receipt-item {
          display: grid;
          grid-template-columns: 1fr 60px 80px;
          margin: 8px 0;
          font-size: 12px;
        }
        
        .receipt-item-details {
          display: flex;
          flex-direction: column;
        }
        
        .receipt-item-name {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding-right: 5px;
        }
        
        .receipt-item-qty {
          text-align: center;
          color: #666;
        }
        
        .receipt-item-amount {
          text-align: right;
          font-weight: bold;
        }
        
        .receipt-summary {
          margin: 10px 0;
          font-size: 12px;
        }
        
        .receipt-payment {
          margin: 15px 0;
          font-size: 12px;
        }
        
        .receipt-footer {
          text-align: center;
          margin-top: 15px;
          font-size: 12px;
        }
        
        .receipt-barcode {
          margin: 10px 0;
          letter-spacing: -2px;
          font-size: 16px;
        }
        
        p {
          margin: 5px 0;
        }
        
        @media print {
          .receipt-actions {
            display: none;
          }
          
          .receipt {
            box-shadow: none;
            padding: 0;
          }
          
          body {
            background: white;
          }
        }
        
        @media (max-width: 480px) {
          .receipt {
            width: 100%;
            max-width: 300px;
          }
        }
        
        .receipt:hover {
          transform: translateY(-5px);
        }
        
        .module-error {
          color: #e53e3e;
          margin-top: 8px;
          font-size: 14px;
          text-align: center;
        }
        
        .receipt-action-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #f0f0f0;
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .receipt-section-title {
          text-align: center;
          font-weight: bold;
          margin: 10px 0;
          font-size: 14px;
        }
        
        .receipt-participant-item {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
          font-size: 12px;
        }
        
        .receipt-participant-name {
          font-weight: bold;
        }
        
        .receipt-participant-amount {
          font-weight: bold;
        }
        
        .receipt-qrcode {
          margin: 15px auto;
          padding: 15px;
          border: 1px dashed #ccc;
          border-radius: 8px;
          max-width: 200px;
          background-color: #fcfcfc;
        }
        
        .qr-image {
          border: 3px solid white;
          border-radius: 5px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .receipt-status {
          margin: 10px 0;
          padding: 5px;
          background: #e8f5e9;
          border: 1px solid #a5d6a7;
          border-radius: 4px;
          color: #2e7d32;
          text-align: center;
        }
        
        .receipt-notes {
          margin: 15px 0;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 10px;
          background-color: #fffdf4;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .note-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          color: #555;
          border-bottom: 1px dashed #ddd;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        
        .note-icon {
          margin-right: 4px;
          flex-shrink: 0;
        }
        
        .receipt-note-content {
          font-size: 11px;
          line-height: 1.4;
          word-break: break-word;
          white-space: pre-wrap;
          color: #333;
          text-align: left;
          padding: 4px 0;
        }
        
        .payment-warning {
          color: #d32f2f;
          font-weight: bold;
          margin-top: 5px;
          background-color: #ffebee;
          border-radius: 4px;
          padding: 4px;
        }
      `}</style>
    </div>
  );
}
