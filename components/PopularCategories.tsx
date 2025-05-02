'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useFirebase } from '@/app/components/providers/FirebaseWrapper';
import { Category, CATEGORIES, getCategoryById } from '@/app/lib/categories';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';

export function PopularCategories() {
  const { user } = useFirebase();
  const [isLoading, setIsLoading] = useState(true);
  const [popularCategories, setPopularCategories] = useState<Category[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCategoryData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchCategoryData = async () => {
    try {
      setIsLoading(true);
      const billsRef = collection(db, 'bills');
      const q = query(billsRef, where('userId', '==', user?.uid));
      const querySnapshot = await getDocs(q);
      
      const counts: Record<string, number> = {};
      const amounts: Record<string, number> = {};
      
      querySnapshot.forEach((doc) => {
        const billData = doc.data();
        const categoryId = billData.categoryId || 'other';
        
        counts[categoryId] = (counts[categoryId] || 0) + 1;
        amounts[categoryId] = (amounts[categoryId] || 0) + billData.totalAmount;
      });
      
      // เรียงลำดับตามจำนวนครั้งที่ใช้
      const sortedCategories = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => getCategoryById(id))
        .filter((category): category is Category => !!category);
      
      setPopularCategories(sortedCategories);
      setCategoryTotals(amounts);
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error fetching category data:', error);
      setError('ไม่สามารถโหลดข้อมูลหมวดหมู่ได้');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>หมวดหมู่ยอดนิยม</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : popularCategories.length === 0 ? (
          <div className="text-center py-4 text-gray-500">ยังไม่มีข้อมูลหมวดหมู่</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {popularCategories.map((category) => (
              <div 
                key={category.id}
                className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div className={`p-2 rounded-full mr-3 ${category.color.replace('text-', 'bg-')}`}>
                  {React.createElement(category.icon, { size: 18, className: 'text-white' })}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-gray-500">
                    {(categoryTotals[category.id] || 0).toLocaleString()} บาท
                  </div>
                </div>
                <div className="text-xs font-medium bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {(categoryCounts?.[category.id] || 0)} บิล
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 