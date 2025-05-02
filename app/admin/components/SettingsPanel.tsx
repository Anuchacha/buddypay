'use client';

import { useState, useEffect } from 'react';
import { Save, Lock, Bell, Globe, Shield, Users, Database } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useAuth } from '@/app/context/AuthContext';

export default function SettingsPanel() {
  const { user } = useAuth();
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'LastBuddyPay',
    siteDescription: 'แพลตฟอร์มจัดการค่าใช้จ่ายระหว่างเพื่อน',
    notificationsEnabled: true,
    maintenanceMode: false,
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    loginAttempts: '5',
    passwordComplexity: 'high',
    sessionTimeout: '30',
  });
  
  const [emailSettings, setEmailSettings] = useState({
    enableEmailNotifications: true,
    enableWelcomeEmail: true,
    enablePaymentReminders: true,
    enableAdminAlerts: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // โหลดการตั้งค่าจาก Firestore
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const settingsDoc = await getDoc(doc(db, 'settings', 'appSettings'));
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data();
          
          // ตรวจสอบและตั้งค่าการตั้งค่าทั่วไป
          if (data.general) {
            setGeneralSettings({
              siteName: data.general.siteName || 'LastBuddyPay',
              siteDescription: data.general.siteDescription || 'แพลตฟอร์มจัดการค่าใช้จ่ายระหว่างเพื่อน',
              notificationsEnabled: data.general.notificationsEnabled ?? true,
              maintenanceMode: data.general.maintenanceMode ?? false,
            });
          }
          
          // ตรวจสอบและตั้งค่าการตั้งค่าความปลอดภัย
          if (data.security) {
            setSecuritySettings({
              twoFactorAuth: data.security.twoFactorAuth ?? true,
              loginAttempts: data.security.loginAttempts || '5',
              passwordComplexity: data.security.passwordComplexity || 'high',
              sessionTimeout: data.security.sessionTimeout || '30',
            });
          }
          
          // ตรวจสอบและตั้งค่าการตั้งค่าอีเมล
          if (data.email) {
            setEmailSettings({
              enableEmailNotifications: data.email.enableEmailNotifications ?? true,
              enableWelcomeEmail: data.email.enableWelcomeEmail ?? true,
              enablePaymentReminders: data.email.enablePaymentReminders ?? true,
              enableAdminAlerts: data.email.enableAdminAlerts ?? true,
            });
          }
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('ไม่สามารถโหลดการตั้งค่าได้');
      } finally {
        setLoading(false);
      }
    }
    
    loadSettings();
  }, []);

  // บันทึกการตั้งค่าไปยัง Firestore
  const handleSave = async () => {
    if (!user) {
      setError('คุณต้องเข้าสู่ระบบเพื่อบันทึกการตั้งค่า');
      return;
    }

    // ตรวจสอบความถูกต้องของ sessionTimeout
    if (isNaN(Number(securitySettings.sessionTimeout)) || Number(securitySettings.sessionTimeout) <= 0) {
      setError('ระยะเวลาหมดอายุของเซสชันต้องเป็นตัวเลขที่ถูกต้อง');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const settingsData = {
        general: generalSettings,
        security: securitySettings,
        email: emailSettings,
        updatedAt: serverTimestamp(),
        updatedBy: user.email || 'unknown',
      };
      
      const csrfToken = getCsrfToken(); // ฟังก์ชันที่คุณต้องสร้างเพื่อดึง CSRF token
      
      // บันทึกการตั้งค่า
      await setDoc(doc(db, 'settings', 'appSettings'), settingsData, { merge: true });
      
      // บันทึกกิจกรรมการอัปเดตการตั้งค่า
      await setDoc(doc(db, 'activityLogs', `settings_update_${Date.now()}`), {
        action: 'update_settings',
        description: 'อัปเดตการตั้งค่าระบบ',
        userEmail: user.email,
        userName: user.displayName || user.email,
        ip: 'unknown', // ในสภาพแวดล้อมจริงควรมีการบันทึก IP
        timestamp: serverTimestamp(),
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('ไม่สามารถบันทึกการตั้งค่าได้');
    } finally {
      setSaving(false);
    }
  };

  const getCsrfToken = () => {
    // ฟังก์ชันที่ใช้ดึง CSRF token
    return 'your_csrf_token'; // เปลี่ยนเป็นวิธีการดึง token ที่ถูกต้อง
  };

  if (loading) {
    return (
      <div className="w-full space-y-8">
        <div className="flex justify-center py-10">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {saveSuccess && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md mb-4">
          บันทึกการตั้งค่าเรียบร้อยแล้ว
        </div>
      )}
      
      {/* การตั้งค่าทั่วไป */}
      <section className="bg-white border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">การตั้งค่าทั่วไป</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="siteName">
                ชื่อเว็บไซต์
              </label>
              <input
                id="siteName"
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                value={generalSettings.siteName}
                onChange={(e) => setGeneralSettings({...generalSettings, siteName: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="siteDescription">
                คำอธิบายเว็บไซต์
              </label>
              <input
                id="siteDescription"
                type="text"
                className="w-full px-3 py-2 border rounded-md"
                value={generalSettings.siteDescription}
                onChange={(e) => setGeneralSettings({...generalSettings, siteDescription: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              id="notificationsEnabled"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={generalSettings.notificationsEnabled}
              onChange={(e) => setGeneralSettings({...generalSettings, notificationsEnabled: e.target.checked})}
            />
            <label className="text-sm" htmlFor="notificationsEnabled">
              เปิดใช้งานการแจ้งเตือนทั่วไป
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              id="maintenanceMode"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={generalSettings.maintenanceMode}
              onChange={(e) => setGeneralSettings({...generalSettings, maintenanceMode: e.target.checked})}
            />
            <label className="text-sm" htmlFor="maintenanceMode">
              เปิดโหมดบำรุงรักษา (เฉพาะแอดมินเท่านั้นที่จะเข้าถึงได้)
            </label>
          </div>
        </div>
      </section>
      
      {/* การตั้งค่าความปลอดภัย */}
      <section className="bg-white border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">การตั้งค่าความปลอดภัย</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              id="twoFactorAuth"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={securitySettings.twoFactorAuth}
              onChange={(e) => setSecuritySettings({...securitySettings, twoFactorAuth: e.target.checked})}
            />
            <label className="text-sm" htmlFor="twoFactorAuth">
              บังคับให้ใช้การยืนยันตัวตนสองชั้นสำหรับผู้ดูแลระบบ
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="loginAttempts">
                จำนวนครั้งที่สามารถเข้าสู่ระบบผิดพลาดได้
              </label>
              <select
                id="loginAttempts"
                className="w-full px-3 py-2 border rounded-md"
                value={securitySettings.loginAttempts}
                onChange={(e) => setSecuritySettings({...securitySettings, loginAttempts: e.target.value})}
              >
                <option value="3">3 ครั้ง</option>
                <option value="5">5 ครั้ง</option>
                <option value="10">10 ครั้ง</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="passwordComplexity">
                ความซับซ้อนของรหัสผ่าน
              </label>
              <select
                id="passwordComplexity"
                className="w-full px-3 py-2 border rounded-md"
                value={securitySettings.passwordComplexity}
                onChange={(e) => setSecuritySettings({...securitySettings, passwordComplexity: e.target.value})}
              >
                <option value="low">ต่ำ</option>
                <option value="medium">ปานกลาง</option>
                <option value="high">สูง</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="sessionTimeout">
              ระยะเวลาหมดอายุของเซสชัน (นาที)
            </label>
            <input
              id="sessionTimeout"
              type="number"
              className="w-full px-3 py-2 border rounded-md"
              value={securitySettings.sessionTimeout}
              onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
            />
          </div>
        </div>
      </section>
      
      {/* การตั้งค่าอีเมล */}
      <section className="bg-white border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">การตั้งค่าการแจ้งเตือนและอีเมล</h3>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              id="enableEmailNotifications"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={emailSettings.enableEmailNotifications}
              onChange={(e) => setEmailSettings({...emailSettings, enableEmailNotifications: e.target.checked})}
            />
            <label className="text-sm" htmlFor="enableEmailNotifications">
              เปิดใช้งานการแจ้งเตือนทางอีเมล
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              id="enableWelcomeEmail"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={emailSettings.enableWelcomeEmail}
              onChange={(e) => setEmailSettings({...emailSettings, enableWelcomeEmail: e.target.checked})}
            />
            <label className="text-sm" htmlFor="enableWelcomeEmail">
              ส่งอีเมลต้อนรับสำหรับผู้ใช้ใหม่
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              id="enablePaymentReminders"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={emailSettings.enablePaymentReminders}
              onChange={(e) => setEmailSettings({...emailSettings, enablePaymentReminders: e.target.checked})}
            />
            <label className="text-sm" htmlFor="enablePaymentReminders">
              ส่งการแจ้งเตือนการชำระเงิน
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              id="enableAdminAlerts"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={emailSettings.enableAdminAlerts}
              onChange={(e) => setEmailSettings({...emailSettings, enableAdminAlerts: e.target.checked})}
            />
            <label className="text-sm" htmlFor="enableAdminAlerts">
              ส่งการแจ้งเตือนกิจกรรมสำคัญให้ผู้ดูแลระบบ
            </label>
          </div>
        </div>
      </section>
      
      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          {saving ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              กำลังบันทึก...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              บันทึกการตั้งค่า
            </>
          )}
        </button>
      </div>
    </div>
  );
} 