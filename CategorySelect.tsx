'use client';

import React from 'react';
import { CATEGORIES, Category } from '@/app/lib/categories';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface CategorySelectProps {
  selectedId: string;
  onChange: (categoryId: string) => void;
  className?: string;
}

export function CategorySelect({ selectedId, onChange, className }: CategorySelectProps) {
  const [open, setOpen] = React.useState(false);
  const selectedCategory = CATEGORIES.find((c) => c.id === selectedId) || CATEGORIES[CATEGORIES.length - 1]; // Default to "other"

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        className="flex items-center justify-between w-full px-4 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center">
          <span className={cn("mr-2", selectedCategory.color)}>
            {React.createElement(selectedCategory.icon, { size: 18 })}
          </span>
          <span>{selectedCategory.name}</span>
        </div>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="absolute z-10 w-full mt-1 overflow-auto bg-background border rounded-md shadow-lg max-h-60">
          <div className="py-1 grid grid-cols-1 md:grid-cols-2">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                className={cn(
                  "flex items-center px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800",
                  selectedId === category.id && "bg-gray-100 dark:bg-gray-800"
                )}
                onClick={() => {
                  onChange(category.id);
                  setOpen(false);
                }}
              >
                <span className={cn("mr-2", category.color)}>
                  {React.createElement(category.icon, { size: 18 })}
                </span>
                <span>{category.name}</span>
                {selectedId === category.id && (
                  <Check size={16} className="ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// คอมโพเนนต์แสดงไอคอนหมวดหมู่พร้อมชื่อ
export function CategoryIcon({ id, showName = false, size = 18 }: { id: string; showName?: boolean; size?: number }) {
  const category = CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1]; // Default to "other"
  
  return (
    <div className="flex items-center">
      <span className={cn("inline-block", category.color)}>
        {React.createElement(category.icon, { size })}
      </span>
      {showName && <span className="ml-2">{category.name}</span>}
    </div>
  );
} 