'use client';

import React from 'react';
import { Button } from './ui/Button';
import { captureError } from '../lib/errorMonitoring';

interface Props {
  error?: Error;
  errorId?: string;
  title?: string;
  message?: string;
  showDetails?: boolean;
  onRetry?: () => void;
  onReport?: () => void;
  componentName?: string;
}

/**
 * Reusable Error Fallback Component
 * ใช้แสดงข้อผิดพลาดในรูปแบบที่เป็นมิตรกับผู้ใช้
 */
export function ErrorFallback({
  error,
  errorId,
  title = 'เกิดข้อผิดพลาด',
  message = 'ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง',
  showDetails = process.env.NODE_ENV === 'development',
  onRetry,
  onReport,
  componentName = 'ErrorFallback',
}: Props) {

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior
      window.location.reload();
    }
  };

  const handleReport = () => {
    if (onReport) {
      onReport();
    } else {
      // Default report behavior
      if (error) {
        captureError(error, {
          component: componentName,
          action: 'User Reported Error',
          userAction: 'Manual Report',
        });
      }
      
      alert('รายงานข้อผิดพลาดถูกส่งแล้ว ขอบคุณสำหรับการแจ้ง');
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center bg-gray-50 p-4 rounded-lg">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        {/* Error Icon */}
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        
        {/* Message */}
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {/* Error Details (Development Only) */}
        {showDetails && error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-left">
            <h3 className="text-sm font-medium text-red-800 mb-2">Error Details:</h3>
            <p className="text-sm text-red-800 font-mono break-all">
              {error.message}
            </p>
            {errorId && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {errorId}
              </p>
            )}
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-red-600 cursor-pointer">
                  Stack Trace
                </summary>
                <pre className="text-xs text-red-800 mt-1 overflow-x-auto">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <Button
            onClick={handleRetry}
            className="flex-1"
            variant="primary"
          >
            🔄 ลองใหม่
          </Button>
          <Button
            onClick={handleReport}
            className="flex-1"
            variant="outline"
          >
            📝 รายงานปัญหา
          </Button>
        </div>

        {/* Go Home Button */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={handleGoHome}
            variant="ghost"
            className="text-sm"
          >
            ← กลับหน้าหลัก
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Mini Error Fallback สำหรับ components เล็กๆ
 */
export function MiniErrorFallback({ 
  error, 
  onRetry, 
  componentName = 'MiniErrorFallback' 
}: {
  error?: Error;
  onRetry?: () => void;
  componentName?: string;
}) {
  const handleReport = () => {
    if (error) {
      captureError(error, {
        component: componentName,
        action: 'Mini Error Reported',
      });
    }
    alert('รายงานข้อผิดพลาดถูกส่งแล้ว');
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <div className="text-red-500 text-2xl mb-2">⚠️</div>
      <p className="text-red-800 text-sm mb-3">เกิดข้อผิดพลาด</p>
      <div className="flex gap-2 justify-center">
        {onRetry && (
          <Button 
            onClick={onRetry} 
            size="sm" 
            variant="primary"
          >
            ลองใหม่
          </Button>
        )}
        <Button 
          onClick={handleReport} 
          size="sm" 
          variant="outline"
        >
          รายงาน
        </Button>
      </div>
    </div>
  );
}

export default ErrorFallback; 