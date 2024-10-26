import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  title?: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (props: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = 'default', duration = 5000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const newToast: Toast = { id, title, description, variant, duration };
    
    setToasts(current => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(current => current.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(current => current.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-0 right-0 p-4 z-50 space-y-4">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            max-w-sm w-full bg-white rounded-lg shadow-lg pointer-events-auto overflow-hidden
            ${toast.variant === 'success' ? 'border-l-4 border-green-500' : ''}
            ${toast.variant === 'error' ? 'border-l-4 border-red-500' : ''}
            ${toast.variant === 'warning' ? 'border-l-4 border-yellow-500' : ''}
            ${toast.variant === 'info' ? 'border-l-4 border-blue-500' : ''}
          `}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {toast.variant === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {toast.variant === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                {toast.variant === 'warning' && (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                {toast.variant === 'info' && (
                  <Info className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="ml-3 w-0 flex-1">
                {toast.title && (
                  <p className="text-sm font-medium text-gray-900">
                    {toast.title}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {toast.description}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => onDismiss(toast.id)}
                  className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}