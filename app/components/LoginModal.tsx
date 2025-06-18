'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from './ui/Input';
import { useErrorHandler } from '../hooks/useErrorHandler';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState<{email?: string; password?: string}>({});

  const { login, loginWithGoogle, error, setError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { handleError } = useErrorHandler({ componentName: 'LoginModal' });

  const validateEmail = useCallback((email: string): string | undefined => {
    if (!email.trim()) {
      return 'กรุณากรอกอีเมล';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'รูปแบบอีเมลไม่ถูกต้อง';
    }
    return undefined;
  }, []);

  const validatePassword = useCallback((password: string): string | undefined => {
    if (!password.trim()) {
      return 'กรุณากรอกรหัสผ่าน';
    }
    if (password.length < 6) {
      return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    }
    return undefined;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Clear general error
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      setFieldErrors({});

      // Validate fields
      const emailError = validateEmail(formData.email);
      const passwordError = validatePassword(formData.password);

      if (emailError || passwordError) {
        setFieldErrors({
          email: emailError,
          password: passwordError
        });
        return;
      }

      // Attempt login
      await login(formData.email, formData.password);
      
      // Reset form and close modal on success
      setFormData({ email: '', password: '' });
      setFieldErrors({});
      onClose();

    } catch (error) {
      // Handle login errors
      const errorMessage = error instanceof Error ? error.message : 'การเข้าสู่ระบบล้มเหลว';
      
      handleError(error as Error, {
        action: 'User Login',
        email: formData.email,
        timestamp: new Date().toISOString(),
      });

      // Check for specific error types
      if (errorMessage.includes('user-not-found') || errorMessage.includes('wrong-password') || 
          errorMessage.includes('invalid-credential')) {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      } else if (errorMessage.includes('too-many-requests')) {
        setError('คำขอเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ในภายหลัง');
      } else if (errorMessage.includes('user-disabled')) {
        setError('บัญชีผู้ใช้ถูกปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ');
      } else {
        setError(errorMessage || 'การเข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setFieldErrors({});
      
      await loginWithGoogle();
      
      // Reset form and close modal on success
      setFormData({ email: '', password: '' });
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'การเข้าสู่ระบบด้วย Google ล้มเหลว';
      
      handleError(error as Error, {
        action: 'Google Login',
        timestamp: new Date().toISOString(),
      });

      setError(errorMessage || 'การเข้าสู่ระบบด้วย Google ล้มเหลว กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  // ปิดโมดัลเมื่อคลิกพื้นหลัง
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">เข้าสู่ระบบ</h2>
              <p className="text-gray-600">ยินดีต้อนรับกลับมา!</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="อีเมล"
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                leftElement={<Mail size={16} />}
                autoComplete="email"
                error={fieldErrors.email}
                required
              />

              <Input
                label="รหัสผ่าน"
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                leftElement={<Lock size={16} />}
                autoComplete="current-password"
                error={fieldErrors.password}
                required
              />

              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                  ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  transition-all duration-200
                `}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">หรือเข้าสู่ระบบด้วย</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className={`
                  w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white
                  ${isLoading ? 'cursor-not-allowed' : 'hover:bg-gray-50'}
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  transition-all duration-200
                `}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    เข้าสู่ระบบด้วย Google
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-sm">
              <span className="text-gray-600">ยังไม่มีบัญชี? </span>
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-500 font-medium"
                onClick={onClose}
              >
                สมัครสมาชิก
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 