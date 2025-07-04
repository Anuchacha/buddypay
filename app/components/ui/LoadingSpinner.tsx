'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white' | 'muted';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
};

const variantClasses = {
  primary: 'border-primary border-t-transparent',
  secondary: 'border-secondary border-t-transparent', 
  white: 'border-white border-t-transparent',
  muted: 'border-gray-400 border-t-transparent'
};

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'primary', 
  className = '' 
}: LoadingSpinnerProps) {
  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-2',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="กำลังโหลด"
    >
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}

interface LoadingDotsProps {
  variant?: 'primary' | 'secondary' | 'muted';
  className?: string;
}

export function LoadingDots({ variant = 'primary', className = '' }: LoadingDotsProps) {
  const dotClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    muted: 'bg-gray-400'
  };

  return (
    <div className={cn('flex space-x-1', className)} role="status" aria-label="กำลังโหลด">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'h-2 w-2 rounded-full animate-pulse',
            dotClasses[variant]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}

interface LoadingPulseProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'muted';
  className?: string;
}

export function LoadingPulse({ 
  size = 'md', 
  variant = 'primary', 
  className = '' 
}: LoadingPulseProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const variantClasses = {
    primary: 'bg-primary/20',
    secondary: 'bg-secondary/20',
    muted: 'bg-gray-300'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div 
        className={cn(
          'rounded-full animate-ping',
          sizeClasses[size],
          variantClasses[variant]
        )}
        role="status"
        aria-label="กำลังโหลด"
      >
        <span className="sr-only">กำลังโหลด...</span>
      </div>
    </div>
  );
} 