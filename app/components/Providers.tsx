'use client';

import { AuthModalProvider } from '../context/AuthModalContext';
import { FirebaseProvider } from '../components/providers/FirebaseWrapper';
import { AuthProvider } from '../context/AuthContext';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <>
      <FirebaseProvider>
        <AuthProvider>
          <AuthModalProvider>
            {children}
          </AuthModalProvider>
        </AuthProvider>
      </FirebaseProvider>
    </>
  );
} 