'use client';

import React from 'react';
import ErrorDashboard from '../components/ErrorDashboard';
import { useAuth } from '../../context/AuthContext';
import { redirect } from 'next/navigation';

export default function AdminErrorsPage() {
  const { user, userRole } = useAuth();

  // ตรวจสอบ admin permission
  if (!user || userRole !== 'admin') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto">
        <ErrorDashboard />
      </div>
    </div>
  );
} 