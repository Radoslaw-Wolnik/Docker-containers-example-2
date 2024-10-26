// src/types/global.d.ts
import { User, Image, Annotation, UserRole, AnnotationType, Token } from './prisma';
export { User, Image, Annotation, UserRole, AnnotationType, Token }

// User Types
export type SafeUser = Omit<User, 
  'password' | 
  'createdAt' | 
  'updatedAt' | 
  'banExpiresAt' |
  'Deactivated' |
  'lastActive'
> & {
  createdAt: string;
  updatedAt: string;
  banExpiresAt?: string | null;
  lastActive: string;
};

export type SessionUser = Pick<SafeUser, 'id' | 'email' | 'username' | 'role' | 'profilePicture'>;

// Image Types
export type ExtendedImage = Omit<Image, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
  uploadedBy?: SafeUser;
  annotations?: SafeAnnotation[];
  _count?: {
    annotations: number;
    views: number; // <---------------------------------- not sure about this one
  };
};

// Annotation Types
export type AnnotationType = 'dot' | 'arrow';

export interface SafeAnnotation {
  id: number;
  type: AnnotationType;
  x: number;
  y: number;
  label: string;
  description: string | null;
  imageId: number;
  userId: number;
  endX: number | null;
  endY: number | null;
  isHidden: boolean;
}
/* prev
export type SafeAnnotation = Omit<Annotation, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
  createdBy?: SafeUser;
};
*/

// API Types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

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

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: keyof User | keyof Image | keyof Annotation;
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

// Form Types
export interface LoginFormData {
  email: User['email'];
  password: string;
  remember?: boolean;
}

export interface RegisterFormData {
  username: User['username'];
  email: User['email'];
  password: string;
  confirmPassword: string;
}

// Upload Types
export interface ImageUploadResponse {
  imageId: Image['id'];
  url: Image['filePath'];
  thumbnailUrl?: string;
}

export interface UploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

// Annotation Input Types
export interface AnnotationCreateInput {
  type: AnnotationType;
  x: Annotation['x'];
  y: Annotation['y'];
  endX?: Annotation['endX'];
  endY?: Annotation['endY'];
  label: Annotation['label'];
  description?: Annotation['description'];
  imageId: Annotation['imageId'];
}

export interface AnnotationUpdateInput extends Partial<AnnotationCreateInput> {
  isHidden?: Annotation['isHidden'];
}

// Filter Types
export interface ImageFilters {
  visibility?: 'all' | 'public' | 'private';
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'year';
  hasAnnotations?: boolean;
  userId?: User['id'];
  type?: string[];
}

// Sort Types
export type SortOption = {
  field: keyof User | keyof Image | keyof Annotation;
  direction: 'asc' | 'desc';
  label: string;
};

// UI Component Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  onClose?: () => void;
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

export interface TableColumn<T> {
  key: keyof T;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

// Error Types
export interface AppError extends Error {
  statusCode?: number;
  code?: string;
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
  role: UserRole;
  iat: number;
  exp: number;
}

export type SafeImage = Omit<Image, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
  uploadedBy?: SafeUser;
  annotations?: SafeAnnotation[];
};


/// new ones

export interface Point {
  x: number;
  y: number;
}

export type ImageAnnotatorMode = 'view' | 'edit';