// hooks/useToast.ts
import { useCallback, useContext } from "react";
import { ToastContext } from "@/contexts/ToastContext";
import type { ToastOptions } from "@/types/toast";

interface ToastFunction {
  (options: Omit<ToastOptions, 'type'> & { message: string }): string;
}

export function useToast() {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const show: ToastFunction = useCallback((options) => {
    return context.addToast({ ...options, type: 'info' });
  }, [context]);

  const success: ToastFunction = useCallback((options) => {
    return context.addToast({ ...options, type: 'success' });
  }, [context]);

  const error: ToastFunction = useCallback((options) => {
    return context.addToast({ ...options, type: 'error' });
  }, [context]);

  const warning: ToastFunction = useCallback((options) => {
    return context.addToast({ ...options, type: 'warning' });
  }, [context]);

  const info: ToastFunction = useCallback((options) => {
    return context.addToast({ ...options, type: 'info' });
  }, [context]);

  return {
    show,
    success,
    error,
    warning,
    info,
    dismiss: context.removeToast,
    dismissAll: context.removeAllToasts,
  };
}