'use client';

import Image from 'next/image';
import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  placeholderColor?: string;
  fallbackText?: string;
}

/**
 * OptimizedImage component ที่ใช้ next/image เพื่อประสิทธิภาพสูงสุด
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholderColor = '#f9fafb',
  fallbackText = '',
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  // สร้าง blurDataURL สำหรับ placeholder
  const blurDataURL = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='100%25' height='100%25' fill='${placeholderColor.replace('#', '%23')}'/%3E%3C/svg%3E`;

  if (hasError) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-gray-400 text-xs">{fallbackText || 'Image not available'}</div>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      placeholder="blur"
      blurDataURL={blurDataURL}
      onError={() => setHasError(true)}
      style={{ objectFit: 'cover' }}
    />
  );
} 