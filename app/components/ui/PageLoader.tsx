'use client';

import React from 'react';
import { LoadingSpinner, LoadingPulse } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  variant?: 'spinner' | 'pulse' | 'minimal';
  message?: string;
  overlay?: boolean;
  className?: string;
}

export function PageLoader({ 
  variant = 'spinner', 
  message = 'กำลังโหลด...', 
  overlay = false,
  className = ''
}: PageLoaderProps) {
  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-4',
      overlay ? 'fixed inset-0 z-50 bg-white/80 backdrop-blur-sm' : 'py-12',
      className
    )}>
      {variant === 'spinner' && <LoadingSpinner size="xl" />}
      {variant === 'pulse' && <LoadingPulse size="lg" />}
      {variant === 'minimal' && <LoadingSpinner size="lg" variant="muted" />}
      
      {message && (
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  return content;
}

interface FullPageLoaderProps {
  message?: string;
  logo?: React.ReactNode;
}

export function FullPageLoader({ 
  message = 'กำลังเตรียมข้อมูล...', 
  logo 
}: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Logo หรือ Brand */}
      {logo && (
        <div className="mb-8">
          {logo}
        </div>
      )}
      
      {/* Main Loader */}
      <div className="relative">
        <LoadingPulse size="lg" />
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="md" variant="white" />
        </div>
      </div>
      
      {/* Message */}
      <p className="mt-6 text-sm text-muted-foreground font-medium animate-pulse">
        {message}
      </p>
      
      {/* Progress Dots */}
      <div className="flex space-x-2 mt-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 bg-primary rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 0.3}s`,
              animationDuration: '1.5s'
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface InlineLoaderProps {
  size?: 'sm' | 'md';
  message?: string;
  className?: string;
}

export function InlineLoader({ 
  size = 'sm', 
  message, 
  className = '' 
}: InlineLoaderProps) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <LoadingSpinner size={size} />
      {message && (
        <span className="text-sm text-muted-foreground">{message}</span>
      )}
    </div>
  );
}

interface ContentLoaderProps {
  children?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  className?: string;
}

export function ContentLoader({
  children,
  loading = false,
  error = null,
  empty = false,
  emptyMessage = 'ไม่พบข้อมูล',
  errorMessage = 'เกิดข้อผิดพลาด',
  loadingMessage = 'กำลังโหลดข้อมูล...',
  className = ''
}: ContentLoaderProps) {
  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <InlineLoader message={loadingMessage} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)}>
        <div className="text-red-500 mb-2">
          <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">{error || errorMessage}</p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)}>
        <div className="text-muted-foreground mb-2">
          <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V9a4 4 0 00-4-4H9a4 4 0 00-4 4v1.5M4 13v-2a1 1 0 011-1h1m0 0V9a2 2 0 012-2h2a2 2 0 012 2v3.5" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
} 