'use client';

import Link from 'next/link';
import { LogOut, Bell, Settings } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';



export default function AdminHeader() {
  const { user: firebaseUser, logout } = useAuth();
  
  // ใช้ข้อมูลจาก Firebase
  const userName = firebaseUser?.displayName || 'ผู้ดูแลระบบ';
  const userEmail = firebaseUser?.email || '';
  const userPhotoURL = firebaseUser?.photoURL;
  
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  return (
    <header className="bg-background border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-2xl font-bold text-primary">
              Admin Dashboard
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-muted">
              <Bell size={20} />
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                3
              </span>
            </button>
            
            <Link href="/admin/settings" className="p-2 rounded-full hover:bg-muted">
              <Settings size={20} />
            </Link>
            
            <div className="flex items-center gap-2 border-l pl-4 ml-2">
              {userPhotoURL ? (
                <img src={userPhotoURL} alt={userName} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                  {userName.charAt(0)}
                </div>
              )}
              <div className="text-sm">
                <div className="font-medium">{userName}</div>
                <div className="text-muted-foreground text-xs">{userEmail}</div>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-destructive"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 