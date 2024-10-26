// Generic Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// Function Types
export type AsyncFunction<T = void> = (...args: any[]) => Promise<T>;
export type SyncFunction<T = void> = (...args: any[]) => T;

// Object Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object
    ? RecursivePartial<T[P]>
    : T[P];
};

// Component Props Types
export type WithChildren<T = {}> = T & { children?: React.ReactNode };
export type WithClassName<T = {}> = T & { className?: string };
export type WithRef<T = {}> = T & { ref?: React.Ref<any> };

// Form Types
export type FormErrors<T> = Partial<Record<keyof T, string>>;

export type FormTouched<T> = Partial<Record<keyof T, boolean>>;

export interface FormState<T> {
  values: T;
  errors: FormErrors<T>;
  touched: FormTouched<T>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Event Handler Types
export interface CustomChangeEvent<T> {
  target: {
    name: keyof T;
    value: any;
  };
}

export type ChangeHandler<T> = (event: CustomChangeEvent<T>) => void;

// API Response Types
export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, any>;
}

export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
  meta?: Record<string, any>;
}

// Route Types
export interface RouteParams {
  [key: string]: string | string[];
}

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

// Auth Types
export interface JWTPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

// Cache Types
export interface CacheOptions {
  ttl?: number;
  staleWhileRevalidate?: boolean;
  tags?: string[];
}

export interface CacheEntry<T> {
  data: T;
  expires: number;
  tags: string[];
}

// Validation Types
export type ValidationRule<T> = (value: T) => string | undefined;

export interface ValidationSchema<T> {
  [K in keyof T]: ValidationRule<T[K]>[];
}

// UI Component Types
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
export type Position = 'top' | 'right' | 'bottom' | 'left';
export type Alignment = 'start' | 'center' | 'end';

// Data Table Types
export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

export interface FilterState {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'between';
  value: any;
}

// Animation Types
export interface AnimationProps {
  initial?: boolean;
  animate?: boolean;
  exit?: boolean;
  duration?: number;
  delay?: number;
  easing?: string;
}