'use client';

import React from 'react';
import { Button, ButtonProps } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends Omit<ButtonProps, 'disabled'> {
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
}

export function LoadingButton({
  loading = false,
  loadingText,
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <Button
      disabled={isDisabled}
      className={cn(
        'relative',
        loading && 'cursor-wait',
        className
      )}
      {...props}
    >
      {loading && (
        <LoadingSpinner 
          size="sm" 
          variant={props.variant === 'outline' ? 'primary' : 'white'}
          className="mr-2" 
        />
      )}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
} 