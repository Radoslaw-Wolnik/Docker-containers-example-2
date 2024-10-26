// src/components/ui/button.tsx
import * as React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  loading?: boolean;
  iconLeft?: LucideIcon | React.ReactNode;
  iconRight?: LucideIcon | React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className,
    variant = 'default',
    size = 'default',
    loading = false,
    iconLeft: IconLeft,
    iconRight: IconRight,
    children,
    ...props
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors';
    
    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground'
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3',
      lg: 'h-11 px-8'
    };

    return (
      <button
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {IconLeft && (
          <span className="mr-2">
            {typeof IconLeft === 'function' ? <IconLeft className="w-4 h-4" /> : IconLeft}
          </span>
        )}
        {children}
        {IconRight && (
          <span className="ml-2">
            {typeof IconRight === 'function' ? <IconRight className="w-4 h-4" /> : IconRight}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';