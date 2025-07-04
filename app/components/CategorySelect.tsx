'use client';

import React from 'react';
import { CATEGORIES, getCategoryById } from '../lib/categories';
import { ChevronDown } from 'lucide-react';

interface CategorySelectProps {
  value?: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
  className?: string;
}

export function CategorySelect({
  value,
  onChange,
  placeholder = 'เลือกหมวดหมู่',
  className = ''
}: CategorySelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-10"
      >
        <option value="">{placeholder}</option>
        {CATEGORIES.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

interface CategoryIconProps {
  categoryId: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ categoryId, size = 20, className = '' }: CategoryIconProps) {
  const category = getCategoryById(categoryId);
  
  if (!category) {
    return null;
  }

  const Icon = category.icon;
  
  return (
    <Icon 
      size={size} 
      className={`${category.color} ${className}`}
    />
  );
}

export default CategorySelect; 