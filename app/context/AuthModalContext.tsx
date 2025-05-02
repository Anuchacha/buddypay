'use client';

import React, { createContext, useContext, useState } from 'react';
import AuthModal from '../components/AuthModal';

type AuthMode = 'login' | 'signup';

interface AuthModalContextType {
  isAuthModalOpen: boolean;
  openLoginModal: () => void;
  openSignupModal: () => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType>({
  isAuthModalOpen: false,
  openLoginModal: () => {},
  openSignupModal: () => {},
  closeAuthModal: () => {},
});

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('login');

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openSignupModal = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthModalContext.Provider
      value={{
        isAuthModalOpen,
        openLoginModal,
        openSignupModal,
        closeAuthModal,
      }}
    >
      {children}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  return useContext(AuthModalContext);
} 