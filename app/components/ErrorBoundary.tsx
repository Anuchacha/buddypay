'use client';

import React, { Component, ReactNode } from 'react';
import { captureError } from '../lib/errorMonitoring';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: 'low' | 'medium' | 'high' | 'critical';
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

/**
 * Error Boundary เพื่อจับข้อผิดพลาดใน React Components
 */
class ErrorBoundary extends Component<Props, State> {
  private errorCaptured = false; // ป้องกัน recursive error

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // ป้องกัน recursive error
    if (this.errorCaptured) return;
    this.errorCaptured = true;

    const { componentName = 'Unknown' } = this.props;
    
    try {
      // บันทึก error ผ่าน Error Monitoring System
      const errorId = captureError(error, {
        component: `ErrorBoundary-${componentName}`,
        action: 'Component Error',
        page: typeof window !== 'undefined' ? window.location.pathname : '',
        errorInfo: {
          componentStack: errorInfo.componentStack,
          errorBoundary: componentName,
        },
        fromErrorMonitoring: false, // ระบุว่าไม่ใช่จาก Error Monitoring
      });

      this.setState({ errorId });

      // Log ใน development โดยไม่ใช้ console.error เพื่อป้องกัน recursive
      if (process.env.NODE_ENV === 'development') {
        // ใช้ console.warn แทน console.error เพื่อหลีกเลี่ยง error listener
        console.warn('[Error Boundary] Component Error Caught:', {
          message: error.message,
          stack: error.stack,
          componentName,
          errorId,
          componentStack: errorInfo.componentStack,
        });
      }
    } catch (monitoringError) {
      // Silent fail เพื่อป้องกัน recursive error
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Error Boundary] Failed to capture error:', monitoringError);
      }
    }
  }

  private handleRetry = () => {
    this.errorCaptured = false; // Reset flag เมื่อ retry
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  private handleReport = () => {
    const { error, errorId } = this.state;
    
    if (!error) return;

    try {
      // ส่ง user report
      const userReport = {
        errorId,
        userDescription: 'User reported error from Error Boundary',
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server',
      };

      // ส่งไป API (non-blocking)
      fetch('/api/user-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userReport),
      }).catch(() => {
        // Silent fail
      });

      // แสดงข้อความยืนยัน
      if (typeof window !== 'undefined') {
        alert('รายงานข้อผิดพลาดถูกส่งแล้ว ขอบคุณสำหรับการแจ้ง');
      }
    } catch (reportError) {
      // Silent fail
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Error Boundary] Failed to report error:', reportError);
      }
    }
  };

  render() {
    if (this.state.hasError) {
      // แสดง fallback UI ที่กำหนดเอง
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // แสดง default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              เกิดข้อผิดพลาด
            </h1>
            <p className="text-gray-600 mb-6">
              ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-left">
                <p className="text-sm text-red-800 font-mono">
                  {this.state.error.message}
                </p>
                {this.state.errorId && (
                  <p className="text-xs text-red-600 mt-2">
                    Error ID: {this.state.errorId}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={this.handleRetry}
                className="flex-1"
                variant="primary"
              >
                ลองใหม่
              </Button>
              <Button
                onClick={this.handleReport}
                className="flex-1"
                variant="outline"
              >
                รายงานปัญหา
              </Button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
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

    return this.props.children;
  }
}

export default ErrorBoundary; 