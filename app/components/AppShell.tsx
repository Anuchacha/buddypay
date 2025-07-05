'use client';

import { ReactNode } from 'react';
import NavbarWrapper from './NavbarWrapper';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <NavbarWrapper />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
} 