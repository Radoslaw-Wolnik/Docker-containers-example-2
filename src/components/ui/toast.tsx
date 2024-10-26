// components/ui/toast.tsx
import { useContext } from "react";
import { ToastContext } from "@/contexts/ToastContext";
import type { Toast, ToastPosition } from "@/types/toast";

function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext)!;

  return (
    <div className="fixed z-50 flex flex-col gap-2 p-4">
      {toasts.map((toast: Toast) => (
        <div
          key={toast.id}
          className={`
            max-w-sm w-full bg-white rounded-lg shadow-lg overflow-hidden
            ${toast.type === 'success' ? 'border-l-4 border-green-500' : ''}
            ${toast.type === 'error' ? 'border-l-4 border-red-500' : ''}
            ${toast.type === 'warning' ? 'border-l-4 border-yellow-500' : ''}
            ${toast.type === 'info' ? 'border-l-4 border-blue-500' : ''}
          `}
          style={getPositionStyles(toast.position)}
        >
          <div className="p-4">
            {toast.title && (
              <h4 className="text-sm font-medium text-gray-900">
                {toast.title}
              </h4>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {toast.message}
            </p>
          </div>
          {toast.dismissible && (
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function getPositionStyles(position?: ToastPosition): React.CSSProperties {
  switch (position) {
    case 'top-left':
      return { top: 0, left: 0 };
    case 'top-right':
      return { top: 0, right: 0 };
    case 'bottom-left':
      return { bottom: 0, left: 0 };
    case 'bottom-right':
      return { bottom: 0, right: 0 };
    case 'top-center':
      return { top: 0, left: '50%', transform: 'translateX(-50%)' };
    case 'bottom-center':
      return { bottom: 0, left: '50%', transform: 'translateX(-50%)' };
    default:
      return { top: 0, right: 0 };
  }
}

export { ToastContainer };