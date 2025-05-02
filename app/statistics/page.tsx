"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '../components/providers/FirebaseWrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Users, ShoppingBag, CreditCard, Calendar } from 'lucide-react';
import { useAuthModal } from '../context/AuthModalContext';
import { collection, query, where, getDocs, orderBy, getFirestore } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CategoryIcon } from '@/CategorySelect';
import { CATEGORIES, Category, getCategoryById, getPopularCategories } from '@/app/lib/categories';
import { mockBills} from '@/app/lib/mockData';
import LoginPrompt from '../components/LoginPrompt';

// สีสำหรับกราฟวงกลม
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

// สร้าง mapping ของสี Tailwind CSS ไปเป็นรหัสสี HEX
const TAILWIND_COLORS: Record<string, string> = {
  'orange-500': '#f97316',
  'amber-500': '#f59e0b',
  'amber-600': '#d97706',
  'pink-500': '#ec4899',
  'blue-500': '#3b82f6',
  'slate-600': '#475569',
  'zinc-700': '#3f3f46',
  'purple-600': '#9333ea',
  'green-600': '#16a34a',
  'red-500': '#ef4444',
  'emerald-600': '#059669',
  'rose-500': '#f43f5e',
  'indigo-500': '#6366f1',
  'yellow-500': '#eab308',
  'violet-500': '#8b5cf6',
  'cyan-600': '#0891b2',
  'gray-500': '#6b7280',
};

// ฟังก์ชันแปลงสี Tailwind CSS เป็นรหัสสี HEX (ปรับปรุงเป็น O(1))
const getTailwindColor = (tailwindColor: string): string => {
  const colorWithoutPrefix = tailwindColor.replace('text-', '');
  return TAILWIND_COLORS[colorWithoutPrefix] || '#999999';
};

// กำหนด interface สำหรับข้อมูลรายเดือน
interface MonthlyData {
  name: string;
  value: number;
  month: string;
}

// กำหนด interface สำหรับข้อมูลหมวดหมู่
interface CategoryData {
  name: string;
  value: number;
}

// กำหนด interface สำหรับข้อมูลสถิติ
interface StatisticsData {
  totalBills: number; // จำนวนบิลทั้งหมด
  totalAmount: number; // ยอดรวมทั้งหมด
  averageAmount: number; // ค่าใช้จ่ายเฉลี่ย
  settledBills: number; // จำนวนบิลที่ชำระแล้ว
  pendingBills: number; // จำนวนบิลที่รอชำระ
  mostExpensiveBill: { // ข้อมูลบิลที่มีมูลค่าสูงสุด
    title: string;
    amount: number;
    date: Date;
  };
  mostFrequentCategory: string; // หมวดหมู่ที่ใช้บ่อยที่สุด
  monthlyExpenses: MonthlyData[]; // ข้อมูลค่าใช้จ่ายรายเดือน
  categoryExpenses: CategoryData[]; // ข้อมูลค่าใช้จ่ายตามหมวดหมู่
}

// กำหนด interface สำหรับบิล
interface Bill {
  id: string; // รหัสบิล
  title: string; // ชื่อบิล
  date: Date; // วันที่บิล
  totalAmount: number; // ยอดรวมของบิล
  category: string; // หมวดหมู่ของบิล
  status: 'settled' | 'partial' | 'pending'; // สถานะของบิล
  createdAt: Date; // วันที่สร้างบิล
}

export default function StatisticsPage() {
  const { user, loading } = useFirebase(); // ดึงข้อมูลผู้ใช้จาก Firebase
  const router = useRouter(); // ใช้ router สำหรับการนำทาง
  const { openLoginModal } = useAuthModal(); // ฟังก์ชันเปิดโมดัลล็อกอิน
  const [stats, setStats] = useState<StatisticsData | null>(null); // สถานะสำหรับข้อมูลสถิติ
  const [isLoading, setIsLoading] = useState(true); // สถานะการโหลดข้อมูล
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [popularCategories, setPopularCategories] = useState<any[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  
  // สร้าง cache สำหรับ categories เพื่อลดการเรียกใช้ getCategoryById ซ้ำๆ
  const categoryCache = useMemo(() => new Map<string, Category | { id: string; name: string; color: string; }>(), []);
  
  // ฟังก์ชันดึงข้อมูลหมวดหมู่แบบ cached
  const getCachedCategory = useCallback((id: string) => {
    if (!categoryCache.has(id)) {
      categoryCache.set(id, getCategoryById(id) || { id: 'other', name: 'อื่นๆ', color: 'text-gray-500' });
    }
    return categoryCache.get(id)!;
  }, [categoryCache]);

  // สร้าง memoized constants เพื่อลดการคำนวณซ้ำ
  const monthNames = useMemo(() => [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ], []);
  
  const monthAbbr = useMemo(() => [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ], []);
  
  // ฟังก์ชันสร้างข้อมูลทั้ง 6 เดือนย้อนหลัง (แยกออกมาเป็นฟังก์ชันเพื่อลดการซ้ำซ้อน)
  const createLast6MonthsData = useCallback(() => {
    const today = new Date();
    const monthData = [];
    const monthLookup: Record<string, number> = {};
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today);
      d.setMonth(d.getMonth() - i);
      const monthIndex = d.getMonth();
      const year = d.getFullYear();
      const yearMonth = `${year}-${monthIndex + 1}`;
      
      const index = 5 - i;
      monthData.push({
        name: monthAbbr[monthIndex],
        month: monthNames[monthIndex],
        value: 0,
        yearMonth
      });
      
      monthLookup[yearMonth] = index;
    }
    
    return { monthData, monthLookup };
  }, [monthNames, monthAbbr]);
  
  useEffect(() => {
    // ตรวจสอบสถานะการล็อกอิน
    if (!loading) {
      if (user) {
        // ถ้าล็อกอินแล้ว ดึงข้อมูลจริง
        fetchStatistics();
      } else {
        // ถ้าไม่ได้ล็อกอิน ใช้ข้อมูลตัวอย่าง
        createMockStatistics();
      }
    }
  }, [user, loading]);

  // เพิ่มฟังก์ชันสร้างข้อมูลตัวอย่าง
  const createMockStatistics = () => {
    setIsLoading(true);

    try {
      const bills = mockBills;
      const today = new Date();
      const { monthData, monthLookup } = createLast6MonthsData();
      
      // ใช้การวนลูปเดียวเพื่อคำนวณค่าหลายอย่างพร้อมกัน
      let totalAmount = 0;
      let maxBillAmount = 0;
      let maxBillIndex = -1;
      const categoryCounts: Record<string, number> = {};
      const categoryTotals: Record<string, number> = {};
      const billStatuses: Record<string, number> = {};
      
      // ใช้ค่าที่แตกต่างกันในแต่ละเดือนเพื่อให้กราฟมีความน่าสนใจ
      const mockValues = [900, 500, 1200, 650, 850, 350];
      for (let i = 0; i < monthData.length; i++) {
        monthData[i].value = mockValues[i];
      }
      
      // คำนวณข้อมูลสำคัญในลูปเดียว
      bills.forEach((bill, index) => {
        const amount = bill.totalAmount || bill.total || 0;
        
        // ยอดรวม
        totalAmount += amount;
        
        // บิลที่มีมูลค่าสูงสุด
        if (amount > maxBillAmount) {
          maxBillAmount = amount;
          maxBillIndex = index;
        }
        
        // สถานะบิล
        const status = bill.status === 'paid' ? 'settled' : (bill.status || 'pending');
        billStatuses[status] = (billStatuses[status] || 0) + 1;
        
        // หมวดหมู่
        const category = bill.categoryId || 'other';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      });
      
      // หาหมวดหมู่ที่ใช้บ่อยที่สุด (ปรับปรุงเป็น O(n))
      let mostFrequentCategory = 'other';
      let maxCount = 0;
      
      for (const [category, count] of Object.entries(categoryCounts)) {
        if (count > maxCount) {
          maxCount = count;
          mostFrequentCategory = category;
        }
      }
      
      // แปลงรหัสหมวดหมู่เป็นชื่อที่แสดงผล
      const categoryObj = getCachedCategory(mostFrequentCategory);
      const mostFrequentCategoryName = categoryObj.name;
      
      // สร้างข้อมูลค่าใช้จ่ายตามหมวดหมู่
      const categoryExpenses = Object.entries(categoryTotals)
        .map(([id, value]) => {
          const category = getCachedCategory(id);
          return { 
            name: category.name, 
            value 
          };
        })
        .sort((a, b) => b.value - a.value);
      
      // หาบิลที่มีมูลค่าสูงสุด
      const defaultBill = { name: 'ไม่มีชื่อบิล', totalAmount: 0, total: 0, date: new Date() };
      const mostExpensiveBill = maxBillIndex >= 0 ? bills[maxBillIndex] : defaultBill;
      
      // สร้างข้อมูลสถิติ
      const calculatedStats: StatisticsData = {
        totalBills: bills.length,
        totalAmount,
        averageAmount: bills.length > 0 ? Math.round(totalAmount / bills.length) : 0,
        settledBills: billStatuses['settled'] || 0,
        pendingBills: billStatuses['pending'] || 0,
        mostExpensiveBill: {
          title: mostExpensiveBill.name || 'ไม่มีชื่อบิล',
          amount: mostExpensiveBill.totalAmount || mostExpensiveBill.total || 0,
          date: new Date(mostExpensiveBill.date || Date.now())
        },
        mostFrequentCategory: mostFrequentCategoryName,
        monthlyExpenses: monthData,
        categoryExpenses: categoryExpenses.slice(0, 6),
      };
      
      setStats(calculatedStats);
      
      // สร้างข้อมูลสำหรับกราฟหมวดหมู่
      const categoryStatsData = Object.entries(categoryTotals)
        .map(([id, amount]) => {
          const category = getCachedCategory(id);
          return {
            id,
            name: category.name,
            value: amount,
            color: getTailwindColor(category.color)
          };
        })
        .sort((a, b) => b.value - a.value);
      
      setCategoryStats(categoryStatsData);
      setCategoryTotals(categoryTotals);
      
      // สร้างข้อมูลหมวดหมู่ยอดนิยม
      const popularCats = getPopularCategories(categoryCounts);
      
      // เพิ่มข้อมูลจำนวนครั้งเข้าไปในแต่ละหมวดหมู่
      const popularCatsWithCount = popularCats.map(category => ({
        ...category,
        count: categoryCounts[category.id] || 0
      }));
      
      setPopularCategories(popularCatsWithCount);
    } catch (error) {
      console.error('Error creating mock statistics:', error);
      setError('ไม่สามารถสร้างข้อมูลตัวอย่างได้');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      setIsLoading(true);
      
      // ดึงข้อมูลจริงจาก Firebase เมื่อล็อกอินแล้วเท่านั้น
      if (!user?.uid) {
        throw new Error('ไม่พบข้อมูลผู้ใช้');
      }
      
      const db = getFirestore();
      const billsRef = collection(db, 'bills');
      // ปรับปรุง query เพื่อจำกัดข้อมูลที่ดึงมาให้เหมาะสม
      const q = query(
        billsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
        // ถ้ามีข้อมูลมากควรใส่ limit เพื่อเพิ่มประสิทธิภาพ
        // limit(100)
      );

      const querySnapshot = await getDocs(q);
      
      // ตรวจสอบว่ามีข้อมูลหรือไม่
      if (querySnapshot.empty) {
        setStats({
          totalBills: 0,
          totalAmount: 0,
          averageAmount: 0,
          settledBills: 0,
          pendingBills: 0,
          mostExpensiveBill: {
            title: 'ไม่มีข้อมูล',
            amount: 0,
            date: new Date()
          },
          mostFrequentCategory: 'ไม่มีข้อมูล',
          monthlyExpenses: [],
          categoryExpenses: []
        });
        setIsLoading(false);
        return;
      }
      
      // แปลงข้อมูลจาก Firestore เป็นอาร์เรย์
      const bills: Bill[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const billDate = data.createdAt?.toDate() || new Date();
        
        // ใช้ defaulting สำหรับข้อมูลที่อาจขาดหายไป
        return {
          id: doc.id,
          title: data.name || 'ไม่มีชื่อบิล',
          date: billDate,
          totalAmount: data.totalAmount || 0,
          // ใช้ categoryId แทน category ถ้ามี
          category: data.categoryId || data.category || (data.foodItems?.length ? 'food' : 'other'),
          status: data.status === 'paid' ? 'settled' : (data.status || 'pending'),
          createdAt: billDate,
        };
      });
      
      // สร้างข้อมูลสำหรับ 6 เดือนย้อนหลัง
      const { monthData, monthLookup } = createLast6MonthsData();
      
      // คำนวณค่าหลายอย่างใน loop เดียวเพื่อลดการวนลูปซ้ำ
      let totalAmount = 0;
      let maxBillAmount = 0;
      let maxBillIndex = -1;
      const categoryCounts: Record<string, number> = {};
      const categoryTotals: Record<string, number> = {};
      const billStatuses: Record<string, number> = {};
      
      // คำนวณทุกอย่างในลูปเดียว
      bills.forEach((bill, index) => {
        const amount = bill.totalAmount;
        
        // ยอดรวม
        totalAmount += amount;
        
        // บิลที่มีมูลค่าสูงสุด
        if (amount > maxBillAmount) {
          maxBillAmount = amount;
          maxBillIndex = index;
        }
        
        // สถานะบิล
        billStatuses[bill.status] = (billStatuses[bill.status] || 0) + 1;
        
        // หมวดหมู่
        const category = bill.category || 'other';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        
        // ข้อมูลรายเดือน
        const date = bill.date;
        const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (yearMonth in monthLookup) {
          monthData[monthLookup[yearMonth]].value += amount;
        }
      });
      
      // หาหมวดหมู่ที่ใช้บ่อยที่สุด
      let mostFrequentCategory = 'other';
      let maxCount = 0;
      
      for (const [category, count] of Object.entries(categoryCounts)) {
        if (count > maxCount) {
          maxCount = count;
          mostFrequentCategory = category;
        }
      }
      
      // แปลงรหัสหมวดหมู่เป็นชื่อที่แสดงผล
      const categoryObj = getCachedCategory(mostFrequentCategory);
      const mostFrequentCategoryName = categoryObj.name;
      
      // สร้างข้อมูลค่าใช้จ่ายตามหมวดหมู่
      const categoryExpenses = Object.entries(categoryTotals)
        .map(([id, value]) => {
          const category = getCachedCategory(id);
          return { 
            name: category.name, 
            value 
          };
        })
        .sort((a, b) => b.value - a.value);
      
      // บิลที่มีมูลค่าสูงสุด
      const mostExpensiveBill = bills[maxBillIndex] || bills[0];
      
      // สร้างข้อมูลสถิติ
      const calculatedStats: StatisticsData = {
        totalBills: bills.length,
        totalAmount,
        averageAmount: bills.length > 0 ? Math.round(totalAmount / bills.length) : 0,
        settledBills: billStatuses['settled'] || 0,
        pendingBills: (billStatuses['pending'] || 0) + (billStatuses['partial'] || 0),
        mostExpensiveBill: {
          title: mostExpensiveBill.title,
          amount: mostExpensiveBill.totalAmount,
          date: mostExpensiveBill.date
        },
        mostFrequentCategory: mostFrequentCategoryName,
        monthlyExpenses: monthData,
        categoryExpenses: categoryExpenses.slice(0, 6),
      };
      
      setStats(calculatedStats);
      
      // เตรียมข้อมูลสำหรับกราฟหมวดหมู่
      const categoryStatsData = Object.entries(categoryTotals)
        .map(([id, amount]) => {
          const category = getCachedCategory(id);
          return {
            id,
            name: category.name,
            value: amount,
            color: getTailwindColor(category.color)
          };
        })
        .sort((a, b) => b.value - a.value);
      
      setCategoryStats(categoryStatsData);
      setCategoryTotals(categoryTotals);
      
      // สร้างข้อมูลหมวดหมู่ยอดนิยม
      const popularCats = getPopularCategories(categoryCounts);
      
      // เพิ่มข้อมูลจำนวนครั้งเข้าไปในแต่ละหมวดหมู่
      const popularCatsWithCount = popularCats.map(category => ({
        ...category,
        count: categoryCounts[category.id] || 0
      }));
      
      setPopularCategories(popularCatsWithCount);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('ไม่สามารถโหลดข้อมูลสถิติได้');
    } finally {
      setIsLoading(false);
    }
  };

  // ใช้ useMemo เพื่อลดการคำนวณซ้ำ
  const renderSafeAmount = useCallback((amount: number) => {
    if (isNaN(amount) || !isFinite(amount)) return '0';
    return amount.toLocaleString();
  }, []);

  const calculatePercentage = useCallback((a: number, b: number) => {
    if (!b || isNaN(b) || !isFinite(b)) return 0;
    return Math.round((a / b) * 100);
  }, []);

  // เพิ่มการจัดการความปลอดภัยในการแสดงผล
  const renderContent = useMemo(() => {
    if (!stats) return null;
    
    return (
      <>
        {/* สรุปข้อมูลทั่วไป */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-500 rounded-lg text-white mr-4">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">จำนวนบิลทั้งหมด</p>
                  <h3 className="text-2xl font-bold">{stats.totalBills || 0} บิล</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-500 rounded-lg text-white mr-4">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-700">ยอดรวมทั้งหมด</p>
                  <h3 className="text-2xl font-bold">{renderSafeAmount(stats.totalAmount)} บาท</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-amber-500 rounded-lg text-white mr-4">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-700">ค่าใช้จ่ายเฉลี่ย</p>
                  <h3 className="text-2xl font-bold">{renderSafeAmount(stats.averageAmount)} บาท</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-500 rounded-lg text-white mr-4">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700">หมวดหมู่ยอดนิยม</p>
                  <h3 className="text-2xl font-bold">{stats.mostFrequentCategory || 'ไม่มีข้อมูล'}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* กราฟแท่งแสดงค่าใช้จ่ายรายเดือน */}
          <Card>
            <CardHeader>
              <CardTitle>ค่าใช้จ่ายรายเดือน</CardTitle>
              <CardDescription>ยอดรวมค่าใช้จ่ายในแต่ละเดือนที่ผ่านมา</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.monthlyExpenses}
                    margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString()} บาท`, 'ยอดรวม']}
                      labelFormatter={(label: string) => {
                        const item = stats.monthlyExpenses.find(item => item.name === label);
                        return item ? `เดือน${item.month}` : label;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" name="ยอดรวม (บาท)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* กราฟวงกลมแสดงค่าใช้จ่ายตามหมวดหมู่ */}
          <Card>
            <CardHeader>
              <CardTitle>ค่าใช้จ่ายตามหมวดหมู่</CardTitle>
              <CardDescription>สัดส่วนค่าใช้จ่ายแบ่งตามหมวดหมู่</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => 
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `${Number(value).toLocaleString()} บาท`}
                      contentStyle={{ borderRadius: '8px', padding: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* เพิ่มตัวชี้แจงสีของแต่ละหมวดหมู่ */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {categoryStats.slice(0, 6).map((entry, index) => (
                  <div key={`legend-${index}`} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* การ์ดแสดงข้อมูลการชำระเงิน */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>สถานะการชำระเงิน</CardTitle>
              <CardDescription>ข้อมูลการชำระเงินของบิลทั้งหมด</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around py-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.settledBills}</div>
                  <div className="text-sm text-muted-foreground">ชำระแล้ว</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{stats.pendingBills}</div>
                  <div className="text-sm text-muted-foreground">รอชำระ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{calculatePercentage(stats.settledBills, stats.totalBills)}%</div>
                  <div className="text-sm text-muted-foreground">อัตราการชำระ</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>บิลที่มีมูลค่าสูงสุด</CardTitle>
              <CardDescription>รายละเอียดบิลที่มีมูลค่าสูงที่สุด</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{stats.mostExpensiveBill.title || 'ไม่มีข้อมูล'}</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">วันที่</span>
                  <span>
                    {stats.mostExpensiveBill.date.toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">ยอดรวม</span>
                  <span className="font-bold text-xl">{renderSafeAmount(stats.mostExpensiveBill.amount)} บาท</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button onClick={() => router.push('/share-bill')} className="mx-2">สร้างบิลใหม่</Button>
          <Button variant="outline" onClick={() => router.push('/history')} className="mx-2">ดูประวัติบิล</Button>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>หมวดหมู่ยอดนิยม</CardTitle>
              <CardDescription>หมวดหมู่ค่าใช้จ่ายที่ใช้บ่อยที่สุด</CardDescription>
            </CardHeader>
            <CardContent>
              {popularCategories && popularCategories.length > 0 ? (
                <ul className="space-y-2">
                  {popularCategories.map(category => (
                    <li key={category.id} className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: getTailwindColor(category.color) }}></div>
                      <span>{category.name}</span>
                      {category.count && <span className="ml-auto text-muted-foreground">{category.count} บิล</span>}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-center py-4">ไม่มีหมวดหมู่ยอดนิยม</p>
              )}
            </CardContent>
          </Card>
        </div>
      </>
    );
  }, [stats, categoryStats, router, renderSafeAmount, calculatePercentage, popularCategories]);

  // แสดงข้อความกำลังโหลดสำหรับผู้ที่ไม่ได้ล็อกอิน
  if (!user && !stats) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">สถิติการใช้งาน</h1>
          <p className="text-muted-foreground mb-6">กำลังโหลดข้อมูลตัวอย่าง...</p>
        </div>
      </div>
    );
  }

  // แสดง loading state
  if (loading || (isLoading && user)) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-80 bg-gray-200 rounded mb-8"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // แสดง LoginPrompt สำหรับผู้ที่ไม่ได้ล็อกอิน แต่มีข้อมูลตัวอย่าง
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">สถิติการใช้งาน</h1>
          <LoginPrompt message="คุณกำลังดูข้อมูลตัวอย่าง" />
        </div>
        
        {stats && renderContent}
      </div>
    );
  }

  // แสดงข้อความแนะนำหากไม่มีข้อมูล
  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">สถิติการใช้งาน</h1>
          <p className="text-muted-foreground mb-6">ไม่พบข้อมูลสถิติของคุณ</p>
          <Button onClick={() => router.push('/share-bill')}>สร้างบิลใหม่</Button>
        </div>
      </div>
    );
  }

  // แสดงข้อมูลสถิติสำหรับผู้ใช้ที่ล็อกอินแล้ว
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">สถิติการใช้งาน</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-8">
          {error}
        </div>
      )}

      {renderContent}
    </div>
  );
} 