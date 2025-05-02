'use client';

import { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';
import { Transition } from '@headlessui/react';
import { XCircleIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

// ประเภทข้อมูลของข้อความในแชท
type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// คุณสมบัติของ ChatbotPopup
type ChatbotPopupProps = {
  apiKey?: string; // API Key สำหรับ OpenAI (ถ้าไม่ให้ในนี้จะใช้จาก env)
  defaultSystemPrompt?: string; // System prompt เริ่มต้น
  position?: 'bottom-right' | 'bottom-left'; // ตำแหน่งของ popup
  botName?: string; // ชื่อของแชทบอท
  primaryColor?: string; // สีหลักของ UI
};

export default function ChatbotPopup({
  apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  defaultSystemPrompt = "คุณเป็นผู้ช่วยอัจฉริยะของแอพพลิเคชัน BuddyPay ที่ออกแบบมาเพื่อช่วยผู้ใช้ในทุกขั้นตอนของการแบ่งบิลและจัดการค่าใช้จ่ายร่วมกับเพื่อน\n\n" +
    "## เกี่ยวกับ BuddyPay\n" +
    "BuddyPay คือแอพพลิเคชันที่ช่วยให้การแบ่งบิลและคำนวณค่าใช้จ่ายระหว่างเพื่อน ครอบครัว หรือเพื่อนร่วมงานเป็นเรื่องง่าย ไม่ว่าจะเป็นค่าอาหาร ค่าที่พัก หรือค่าใช้จ่ายร่วมกันอื่นๆ\n\n" +
    "## ฟีเจอร์หลักที่คุณสามารถให้คำแนะนำได้\n" +
    "1. **การแบ่งบิล**: วิธีการแบ่งบิลแบบเท่ากันหรือตามรายการที่แต่ละคนเลือก การคำนวณที่รวม VAT, Service Charge, ส่วนลด\n" +
    "2. **การชำระเงิน**: วิธีการสร้างและใช้งาน QR Code PromptPay สำหรับการชำระเงิน\n" +
    "3. **การบันทึกและจัดการบิล**: วิธีการบันทึก ค้นหา แก้ไข และลบบิลเก่า\n" +
    "4. **ประวัติบิล**: วิธีการดูประวัติการแชร์บิล การกรองข้อมูลตามวันที่ ประเภท หรือผู้ร่วมบิล\n" +
    "5. **สถิติการใช้จ่าย**: วิธีการดูและวิเคราะห์สถิติการใช้จ่าย รายงานรายเดือน/รายปี\n" +
    "6. **การจัดการรายการค่าใช้จ่าย**: วิธีการเพิ่ม แก้ไข ลบรายการในบิล\n" +
    "7. **การจัดการผู้ร่วมจ่าย**: วิธีการเพิ่ม ลบ แก้ไขข้อมูลผู้ร่วมจ่าย\n\n" +
    "## การแก้ไขปัญหาทั่วไป\n" +
    "คุณสามารถช่วยผู้ใช้แก้ไขปัญหาต่างๆ เช่น:\n" +
    "- การสร้าง QR Code ไม่สำเร็จ\n" +
    "- การคำนวณส่วนแบ่งไม่ถูกต้อง\n" +
    "- การเพิ่มผู้ร่วมจ่ายไม่สำเร็จ\n" +
    "- ข้อผิดพลาดในการบันทึกบิล\n" +
    "- ปัญหาการซิงค์ข้อมูลระหว่างอุปกรณ์\n" +
    "- ปัญหาการล็อกอินหรือสมัครสมาชิก\n\n" +
    "## ข้อจำกัดที่ควรแจ้งให้ผู้ใช้ทราบ\n" +
    "- จำเป็นต้องลงทะเบียนเพื่อบันทึกประวัติบิลและใช้งานฟีเจอร์ขั้นสูง\n" +
    "- การชำระเงินผ่าน QR Code/PromptPay ต้องมีแอพธนาคารที่รองรับ\n" +
    "- ข้อมูลบิลจะถูกซิงค์เฉพาะเมื่อมีการเชื่อมต่ออินเทอร์เน็ต\n\n" +
    "## คำแนะนำในการช่วยเหลือผู้ใช้\n" +
    "ตอบคำถามด้วยภาษาที่เป็นมิตร เข้าใจง่าย และชัดเจน ให้คำแนะนำที่เป็นประโยชน์และตรงประเด็น พร้อมเสนอวิธีการใช้งานที่มีประสิทธิภาพและประหยัดเวลา หากมีคำถามที่เกี่ยวข้องกับข้อมูลส่วนตัวหรือทางการเงิน ให้แนะนำมาตรการรักษาความปลอดภัยที่เหมาะสม",
  position = 'bottom-right',
  botName = 'ChatBot GPT',
  primaryColor = 'bg-blue-600',
}: ChatbotPopupProps) {
  // สถานะ
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: defaultSystemPrompt }
  ]);
  const [input, setInput] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(defaultSystemPrompt);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ref สำหรับ auto-scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // สร้าง client OpenAIRoute
  const createOpenAIClient = () => {
    return new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  };

  // auto-scroll ไปที่ข้อความล่าสุด
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // อัปเดต System Prompt
  const updateSystemPrompt = () => {
    // ค้นหาข้อความ system ตัวแรก
    const systemMessageIndex = messages.findIndex(msg => msg.role === 'system');
    
    if (systemMessageIndex !== -1) {
      // อัปเดตข้อความที่มีอยู่
      const updatedMessages = [...messages];
      updatedMessages[systemMessageIndex] = { role: 'system', content: systemPrompt };
      setMessages(updatedMessages);
    } else {
      // สร้างข้อความใหม่ถ้าไม่มี
      setMessages([{ role: 'system', content: systemPrompt }, ...messages]);
    }
    
    setShowSettings(false);
  };

  // ส่งข้อความไปยัง OpenAI API
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    if (!apiKey) {
      setError('API Key ไม่ถูกกำหนด');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // เพิ่มข้อความของผู้ใช้ไปยังรายการข้อความ
      const newUserMessage: Message = { role: 'user', content: message };
      const updatedMessages = [...messages, newUserMessage];
      setMessages(updatedMessages);
      
      // สร้าง client และส่งข้อความไปยัง OpenAI API
      const openai = createOpenAIClient();
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: updatedMessages as any,
      });
      
      // เพิ่มการตอบกลับจาก assistant
      if (response.choices && response.choices[0].message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.choices[0].message.content || 'ไม่มีข้อความตอบกลับ'
        };
        setMessages([...updatedMessages, assistantMessage]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('เกิดข้อผิดพลาดในการส่งข้อความ');
    } finally {
      setLoading(false);
    }
  };

  // สี UI
  const buttonClass = primaryColor;
  const positionClass = position === 'bottom-right' 
    ? 'bottom-6 right-6' 
    : 'bottom-6 left-6';

  return (
    <>
      {/* ปุ่มเปิด/ปิด Chatbot */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${buttonClass} fixed ${positionClass} rounded-full p-3 text-white shadow-lg hover:opacity-90 transition-all z-50`}
        aria-label={isOpen ? 'ปิดแชทบอท' : 'เปิดแชทบอท'}
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
      </button>

      {/* Popup แชทบอท */}
      <Transition
        show={isOpen}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div 
          className={`fixed ${positionClass} -translate-y-16 w-80 sm:w-96 h-[32rem] bg-white rounded-xl shadow-2xl overflow-hidden z-40 flex flex-col border border-gray-200`}
        >
          {/* ส่วนหัว */}
          <div className={`${buttonClass} p-4 text-white flex justify-between items-center`}>
            <h3 className="font-semibold text-black">{botName}</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-gray-200"
                aria-label="การตั้งค่า"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200"
                aria-label="ปิดแชทบอท"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ส่วนแสดงข้อความ */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {/* การตั้งค่า System Prompt */}
            {showSettings && (
              <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border">
                <label className="block mb-2 text-sm font-medium">
                  System Prompt
                </label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm min-h-[100px]"
                  placeholder="กำหนดบริบทสำหรับ GPT..."
                />
                <button
                  onClick={updateSystemPrompt}
                  className={`mt-2 ${buttonClass} text-white px-3 py-1.5 rounded text-sm`}
                >
                  บันทึกการตั้งค่า
                </button>
              </div>
            )}

            {/* แสดงข้อความแชท */}
            <div className="space-y-4">
              {messages.filter(msg => msg.role !== 'system').map((msg, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-100 ml-6 text-black' 
                      : 'bg-white mr-6 shadow-sm border border-gray-100 text-black'
                  }`}
                >
                  <div className="font-medium text-sm mb-1 text-black">
                    {msg.role === 'user' ? 'คุณ' : botName}
                  </div>
                  <div className="text-sm whitespace-pre-wrap text-black">
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {loading && (
                <div className="bg-white p-3 rounded-lg mr-6 shadow-sm border border-gray-100">
                  <div className="font-medium text-sm mb-1">{botName}</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              )}
              
              {/* ref สำหรับ auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
            
            {/* แสดงข้อความข้อผิดพลาด */}
            {error && (
              <div className="mt-4 p-2 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="p-4 bg-gray-100 rounded-lg shadow-md">
              <h4 className="font-semibold text-lg mb-2">คำถามที่แนะนำ</h4>
              <ul className="space-y-2">
                {[
                  { text: "วิธีการใช้งานแอพพลิเคชัน BuddyPay", icon: "📘" },
                  { text: "การแบ่งบิลด้วยวิธีต่างๆ", icon: "💰" },
                  { text: "การใช้งานระบบชำระเงินผ่าน QR Code", icon: "📲" },
                  { text: "การบันทึกประวัติการแชร์บิล", icon: "📝" }
                ].map((item, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-2">{item.icon}</span>
                    <button 
                      onClick={() => sendMessage(item.text)} 
                      className="text-blue-600 hover:underline"
                    >
                      {item.text}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* ส่วนกรอกข้อความ */}
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="พิมพ์ข้อความของคุณที่นี่..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className={`${buttonClass} text-white p-2 rounded-lg disabled:opacity-50`}
                aria-label="ส่งข้อความ"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </Transition>
    </>
  );
} 