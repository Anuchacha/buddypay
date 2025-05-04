'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseProgressiveLoadingProps {
  delay?: number;
  steps?: number;
  onComplete?: () => void;
}

/**
 * Hook สำหรับการโหลดแบบค่อยเป็นค่อยไป - แสดง skeleton ไปพลางก่อนแล้วค่อยๆโหลด content จริง
 */
export function useProgressiveLoading({
  delay = 150,
  steps = 3,
  onComplete
}: UseProgressiveLoadingProps = {}) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // เริ่มการโหลดแบบค่อยเป็นค่อยไป
  useEffect(() => {
    let isMounted = true;
    let step = 0;
    
    // ฟังก์ชันเพิ่ม progress ทีละขั้น
    const increaseProgress = () => {
      if (!isMounted) return;
      
      step += 1;
      setProgress(Math.min(100, (step / steps) * 100));
      
      if (step < steps) {
        setTimeout(increaseProgress, delay);
      } else {
        setIsLoading(false);
        if (onComplete) onComplete();
      }
    };
    
    // เริ่มโหลดหลังจาก delay ครั้งแรก
    const timeout = setTimeout(increaseProgress, delay);
    
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [delay, steps, onComplete]);
  
  // ฟังก์ชันสำหรับรีเซ็ตการโหลด
  const reset = useCallback(() => {
    setIsLoading(true);
    setProgress(0);
  }, []);
  
  return { isLoading, progress, reset };
}

/**
 * Hook สำหรับ lazy load รูปภาพพร้อม placeholder
 */
export function useImagePreloader(src?: string) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!src) return;
    
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setIsLoaded(true);
    };
    
    img.onerror = (err) => {
      setError(err as any);
    };
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);
  
  return { isLoaded, error };
} 