// types/api.ts
import { User, Image, Annotation } from '@prisma/client';

export interface ErrorResponse {
  error: string;
  code?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

// Specific response types
export type SingleResponse<T> = ApiResponse<T>;
export type ListResponse<T> = ApiResponse<T[]>;

// Common response types
export type AnnotationResponse = SingleResponse<Annotation>;
export type AnnotationsResponse = ListResponse<Annotation>;
export type ImageResponse = SingleResponse<Image>;
export type ImagesResponse = ListResponse<Image>;
export type UserResponse = SingleResponse<User>;
export type UsersResponse = ListResponse<User>;

// API Results type (can be either success or error)
export type ApiResult<T> = ApiResponse<T> | ErrorResponse;

export type SortableFields = keyof (User & Image & Annotation);

export type SpecificSortableFields = 
  | 'id' 
  | 'createdAt' 
  | 'updatedAt' 
  | 'name'
  | 'username'
  | 'email'
  | 'type'
  | 'label';


// Type guard to check if response is an error
export function isErrorResponse(response: unknown): response is ErrorResponse {
  return typeof response === 'object' && 
         response !== null && 
         'error' in response;
}