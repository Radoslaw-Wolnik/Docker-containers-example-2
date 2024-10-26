import React, { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';

interface ModalContextType {
  openModal: (content: React.ReactNode, options?: ModalOptions) => void;
  closeModal: () => void;
}

interface ModalOptions {
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showClose?: boolean;
  onClose?: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<React.ReactNode | null>(null);
  const [options, setOptions] = useState<ModalOptions>({});

  const openModal = useCallback((content: React.ReactNode, options: ModalOptions = {}) => {
    setContent(content);
    setOptions(options);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    options.onClose?.();
    setTimeout(() => setContent(null), 200); // Clear content after animation
  }, [options]);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" 
                 onClick={closeModal} />
            <div className={`relative bg-white rounded-lg shadow-xl transform transition-all
              ${options.size === 'sm' ? 'max-w-sm' : ''}
              ${options.size === 'md' ? 'max-w-md' : ''}
              ${options.size === 'lg' ? 'max-w-lg' : ''}
              ${options.size === 'xl' ? 'max-w-xl' : ''}
              ${!options.size ? 'max-w-md' : ''}`}>
              {(options.title || options.showClose !== false) && (
                <div className="flex items-center justify-between p-4 border-b">
                  {options.title && (
                    <h3 className="text-lg font-medium">{options.title}</h3>
                  )}
                  {options.showClose !== false && (
                    <button
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
              <div className="p-4">{content}</div>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}