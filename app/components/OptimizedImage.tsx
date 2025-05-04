'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useImagePreloader } from '../hooks/useProgressiveLoading';

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
 * OptimizedImage component ที่มีระบบ progressive loading และ error handling
 * โหลดรูปภาพแบบค่อยเป็นค่อยไปพร้อมแสดง placeholder
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholderColor = '#f9fafb',
  fallbackText = ''
}: OptimizedImageProps) {
  const { isLoaded, error } = useImagePreloader(src);
  const [displayError, setDisplayError] = useState(false);
  
  // สร้าง SVG placeholder URL
  const placeholderUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='${placeholderColor.replace('#', '%23')}'/%3E%3Ctext x='${width/2}' y='${height/2}' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%236b7280'%3E${fallbackText || alt}%3C/text%3E%3C/svg%3E`;
  
  const loadingStyles = {
    opacity: isLoaded && !displayError ? 1 : 0.6,
    transition: 'opacity 0.3s ease-in-out'
  };
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setDisplayError(true);
    e.currentTarget.src = placeholderUrl;
  };
  
  if (error || displayError) {
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
    <div className="relative" style={{ width, height }}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={loadingStyles}
        loading="lazy"
        onError={handleError}
      />
    </div>
  );
} 