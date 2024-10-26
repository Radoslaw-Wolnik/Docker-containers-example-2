// utils/validation.util.ts
import { z } from 'zod';
// import type { ValidationResult } from '@/types/utils';
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export interface ValidationOptions {
  abortEarly?: boolean;
  context?: Record<string, any>;
}

export const validationSchemas = {
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and dashes'),
    
  email: z.string()
    .email('Invalid email address'),
    
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    )
} as const;

export function validateImage(file: File): ValidationResult {
  const errors: string[] = [];
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('File type not supported. Please upload a JPEG, PNG or WebP image.');
  }
  
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    errors.push('File size must be less than 5MB.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateAnnotation(annotation: {
  label: string;
  description?: string;
  x: number;
  y: number;
  endX?: number;
  endY?: number;
  type: 'DOT' | 'ARROW';
}): ValidationResult {
  const errors: string[] = [];
  
  if (!annotation.label.trim()) {
    errors.push('Label is required');
  }
  
  if (annotation.label.length > 100) {
    errors.push('Label must be less than 100 characters');
  }
  
  if (annotation.description && annotation.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }
  
  if (annotation.type === 'ARROW' && (
    typeof annotation.endX !== 'number' ||
    typeof annotation.endY !== 'number'
  )) {
    errors.push('End coordinates are required for arrow annotations');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
