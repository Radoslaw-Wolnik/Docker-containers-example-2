// types/svg.ts
export interface Point {
    x: number;
    y: number;
  }
  
  export interface ArrowConfig {
    headSize?: number;
    strokeWidth?: number;
    color?: string;
    dash?: string;
  }
  
  export interface SVGDimensions {
    width: number;
    height: number;
  }
  
  // types/validation.ts
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