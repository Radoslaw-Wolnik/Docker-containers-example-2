import { User, Image, Annotation, UserRole } from '@prisma/client';

// Safe User type (excluding sensitive data)
export type SafeUser = Omit<User, 
  'password' | 
  'createdAt' | 
  'updatedAt' | 
  'emailVerified' | 
  'banExpiresAt'
> & {
  createdAt: string;
  updatedAt: string;
  emailVerified?: string | null;
  banExpiresAt?: string | null;
};

// Session User type
export interface SessionUser {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  profilePicture?: string | null;
}

// Image with relations
export interface ExtendedImage extends Omit<Image, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
  uploadedBy?: SafeUser;
  annotations?: SafeAnnotation[];
  _count?: {
    annotations: number;
    likes: number;
  };
}

// Safe Annotation type
export interface SafeAnnotation extends Omit<Annotation, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
  createdBy?: SafeUser;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Image upload types
export interface ImageUploadResponse {
  imageId: number;
  url: string;
  thumbnailUrl?: string;
}

export interface UploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

// Annotation types
export interface AnnotationCreateInput {
  type: 'DOT' | 'ARROW';
  x: number;
  y: number;
  endX?: number;
  endY?: number;
  label: string;
  description?: string;
  imageId: number;
}

export interface AnnotationUpdateInput extends Partial<AnnotationCreateInput> {
  isHidden?: boolean;
}

// Filter types
export interface ImageFilters {
  visibility?: 'all' | 'public' | 'private';
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'year';
  hasAnnotations?: boolean;
  userId?: number;
  type?: string[];
}

// Sort options
export type SortOption = {
  field: string;
  direction: 'asc' | 'desc';
  label: string;
};

// Error types
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  annotationDefaults: {
    color: string;
    size: number;
    defaultType: 'DOT' | 'ARROW';
  };
  displaySettings: {
    showAnnotationLabels: boolean;
    showAnnotationCount: boolean;
    gridView: 'compact' | 'comfortable';
  };
}

// Component prop types
export interface TableColumn<T> {
  key: keyof T;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
}

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  onClose?: () => void;
}