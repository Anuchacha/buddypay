'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { setUserContext, clearUserContext } from '../../lib/errorMonitoring';

interface Props {
  children: React.ReactNode;
}

/**
 * Error Monitoring Provider
 * ตั้งค่า Error Monitoring และ User Context
 */
export function ErrorMonitoringProvider({ children }: Props) {
  const { user } = useAuth();

  useEffect(() => {
    // ตั้งค่า User Context เมื่อ user login
    if (user) {
      setUserContext(
        user.uid, 
        user.email || undefined
      );
    } else {
      // ล้าง User Context เมื่อ user logout
      clearUserContext();
    }
  }, [user]);

  // Setup หรือ initialize อื่นๆ สำหรับ Error Monitoring
  useEffect(() => {
    // ตั้งค่า Global Error Handler เพิ่มเติม
    const handleBeforeUnload = () => {
      // บันทึก session end
    };

    const handleVisibilityChange = () => {
      // ตรวจสอบการ focus/blur ของ tab
      if (document.hidden) {
        // บันทึกว่า user switch tab
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return <>{children}</>;
}

export default ErrorMonitoringProvider; 