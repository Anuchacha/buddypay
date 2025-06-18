import { useCallback, useState } from 'react';
import { captureError, captureWarning, captureCriticalError } from '../lib/errorMonitoring';
import type { ErrorContext } from '../lib/errorMonitoring';

interface UseErrorHandlerOptions {
  componentName?: string;
  defaultContext?: Partial<ErrorContext>;
  onError?: (error: Error, errorId: string) => void;
  onWarning?: (message: string, errorId: string) => void;
  onCritical?: (error: Error, errorId: string) => void;
}

interface ErrorState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
  errorMessage?: string;
}

/**
 * Custom Hook สำหรับจัดการ Error ใน React Components
 */
export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    componentName = 'UnknownComponent',
    defaultContext = {},
    onError,
    onWarning,
    onCritical,
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
  });

  /**
   * บันทึก Error และอัปเดต Error State
   */
  const handleError = useCallback(
    (error: Error | string, context: Partial<ErrorContext> = {}) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      const fullContext = {
        ...defaultContext,
        ...context,
        component: componentName,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
      };

      const errorId = captureError(errorObj, fullContext);

      setErrorState({
        hasError: true,
        error: errorObj,
        errorId,
        errorMessage: errorObj.message,
      });

      onError?.(errorObj, errorId);

      return errorId;
    },
    [componentName, defaultContext, onError]
  );

  /**
   * บันทึก Warning โดยไม่เปลี่ยน Error State
   */
  const handleWarning = useCallback(
    (message: string, context: Partial<ErrorContext> = {}) => {
      const fullContext = {
        ...defaultContext,
        ...context,
        component: componentName,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
      };

      const errorId = captureWarning(message, fullContext);
      onWarning?.(message, errorId);

      return errorId;
    },
    [componentName, defaultContext, onWarning]
  );

  /**
   * บันทึก Critical Error
   */
  const handleCriticalError = useCallback(
    (error: Error | string, context: Partial<ErrorContext> = {}) => {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      const fullContext = {
        ...defaultContext,
        ...context,
        component: componentName,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
      };

      const errorId = captureCriticalError(errorObj, fullContext);

      setErrorState({
        hasError: true,
        error: errorObj,
        errorId,
        errorMessage: errorObj.message,
      });

      onCritical?.(errorObj, errorId);

      return errorId;
    },
    [componentName, defaultContext, onCritical]
  );

  /**
   * Async Function Wrapper ที่จับ Error อัตโนมัติ
   */
  const wrapAsync = useCallback(
    <T extends (...args: any[]) => Promise<any>>(
      asyncFn: T,
      context: Partial<ErrorContext> = {}
    ): T => {
      return (async (...args: Parameters<T>) => {
        try {
          return await asyncFn(...args);
        } catch (error) {
          handleError(error as Error, {
            ...context,
            action: `Async ${asyncFn.name || 'function'}`,
          });
          throw error; // Re-throw เพื่อให้ caller จัดการได้
        }
      }) as T;
    },
    [handleError]
  );

  /**
   * Sync Function Wrapper ที่จับ Error อัตโนมัติ
   */
  const wrapSync = useCallback(
    <T extends (...args: any[]) => any>(
      syncFn: T,
      context: Partial<ErrorContext> = {}
    ): T => {
      return ((...args: Parameters<T>) => {
        try {
          return syncFn(...args);
        } catch (error) {
          handleError(error as Error, {
            ...context,
            action: `Sync ${syncFn.name || 'function'}`,
          });
          throw error; // Re-throw เพื่อให้ caller จัดการได้
        }
      }) as T;
    },
    [handleError]
  );

  /**
   * ล้าง Error State
   */
  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: undefined,
      errorId: undefined,
      errorMessage: undefined,
    });
  }, []);

  /**
   * Try-Catch Helper สำหรับ Event Handlers
   */
  const tryExecute = useCallback(
    async (
      fn: () => void | Promise<void>,
      context: Partial<ErrorContext> = {}
    ) => {
      try {
        await fn();
      } catch (error) {
        handleError(error as Error, {
          ...context,
          action: 'Event Handler',
        });
      }
    },
    [handleError]
  );

  /**
   * API Call Wrapper
   */
  const apiCall = useCallback(
    async <T>(
      apiFn: () => Promise<T>,
      context: Partial<ErrorContext> = {}
    ): Promise<T | null> => {
      try {
        return await apiFn();
      } catch (error) {
        const errorObj = error as Error;
        
        // แยกประเภท API Error
        if (errorObj.message.includes('fetch')) {
          handleError(errorObj, {
            ...context,
            action: 'Network API Call',
            errorType: 'NetworkError',
          });
        } else if (errorObj.message.includes('timeout')) {
          handleWarning('API Timeout', {
            ...context,
            action: 'API Timeout',
          });
        } else {
          handleError(errorObj, {
            ...context,
            action: 'API Call',
          });
        }
        
        return null;
      }
    },
    [handleError, handleWarning]
  );

  /**
   * Form Submission Wrapper
   */
  const handleFormSubmit = useCallback(
    (
      submitFn: (formData: FormData | any) => void | Promise<void>,
      context: Partial<ErrorContext> = {}
    ) => {
      return async (formData: FormData | any) => {
        try {
          await submitFn(formData);
        } catch (error) {
          handleError(error as Error, {
            ...context,
            action: 'Form Submission',
          });
        }
      };
    },
    [handleError]
  );

  /**
   * สร้าง Error Context สำหรับ User Actions
   */
  const createUserActionContext = useCallback(
    (action: string, additionalContext: Partial<ErrorContext> = {}) => ({
      ...defaultContext,
      ...additionalContext,
      action: `User: ${action}`,
      component: componentName,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      timestamp: new Date().toISOString(),
    }),
    [defaultContext, componentName]
  );

  return {
    // Error State
    errorState,
    hasError: errorState.hasError,
    error: errorState.error,
    errorId: errorState.errorId,
    errorMessage: errorState.errorMessage,

    // Error Handlers
    handleError,
    handleWarning,
    handleCriticalError,
    clearError,

    // Function Wrappers
    wrapAsync,
    wrapSync,
    tryExecute,
    apiCall,
    handleFormSubmit,

    // Utilities
    createUserActionContext,
  };
}

export default useErrorHandler; 