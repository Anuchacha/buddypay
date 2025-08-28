import type { Bill } from '@/app/hooks/useStatistics';

// ข้อมูลตัวอย่างบิล
export const mockBills: Bill[] = [
  {
    id: 'mock-bill-1',
    title: 'อาหารกลางวัน',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    totalAmount: 850,
    category: 'food',
    status: 'pending' as const,
    participants: [
      { id: 'p1', name: 'เอ', status: 'paid' },
      { id: 'p2', name: 'บี', status: 'pending' },
      { id: 'p3', name: 'ซี', status: 'pending' },
      { id: 'p4', name: 'ดี', status: 'paid' },
    ],
    splitResults: [
      { participant: { id: 'p1', name: 'เอ', status: 'paid' }, amount: 212.5 },
      { participant: { id: 'p2', name: 'บี', status: 'pending' }, amount: 212.5 },
      { participant: { id: 'p3', name: 'ซี', status: 'pending' }, amount: 212.5 },
      { participant: { id: 'p4', name: 'ดี', status: 'paid' }, amount: 212.5 },
    ],
  },
  {
    id: 'mock-bill-2',
    title: 'ค่าที่พัก',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    totalAmount: 3600,
    category: 'home',
    status: 'paid' as const,
    participants: [
      { id: 'p1', name: 'เอ', status: 'paid' },
      { id: 'p2', name: 'บี', status: 'paid' },
      { id: 'p3', name: 'ซี', status: 'paid' },
    ],
    splitResults: [
      { participant: { id: 'p1', name: 'เอ', status: 'paid' }, amount: 1200 },
      { participant: { id: 'p2', name: 'บี', status: 'paid' }, amount: 1200 },
      { participant: { id: 'p3', name: 'ซี', status: 'paid' }, amount: 1200 },
    ],
  },
  {
    id: 'mock-bill-3',
    title: 'ค่าแท็กซี่',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    totalAmount: 380,
    category: 'transportation',
    status: 'pending' as const,
    participants: [
      { id: 'p1', name: 'เอ', status: 'paid' },
      { id: 'p2', name: 'บี', status: 'pending' },
    ],
    splitResults: [
      { participant: { id: 'p1', name: 'เอ', status: 'paid' }, amount: 190 },
      { participant: { id: 'p2', name: 'บี', status: 'pending' }, amount: 190 },
    ],
  },
  {
    id: 'mock-bill-4',
    title: 'อาหารเย็น',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    totalAmount: 1200,
    category: 'food',
    status: 'pending' as const,
    participants: [
      { id: 'p1', name: 'เอ', status: 'pending' },
      { id: 'p2', name: 'บี', status: 'pending' },
      { id: 'p3', name: 'ซี', status: 'paid' },
    ],
    splitResults: [
      { participant: { id: 'p1', name: 'เอ', status: 'pending' }, amount: 400 },
      { participant: { id: 'p2', name: 'บี', status: 'pending' }, amount: 400 },
      { participant: { id: 'p3', name: 'ซี', status: 'paid' }, amount: 400 },
    ],
  },
];
