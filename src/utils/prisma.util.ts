import { User, Image, Annotation } from '@prisma/client';
import { SafeUser, SafeImage, SafeAnnotation } from '@/types';

export function excludeFields<T, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

export function sanitizeUser(user: User): SafeUser {
  return excludeFields(user, ['password']) as SafeUser;
}

export function sanitizeImage(
  image: Image & {
    uploadedBy?: User;
    annotations?: Annotation[];
  }
): SafeImage {
  return {
    ...image,
    uploadedBy: image.uploadedBy ? sanitizeUser(image.uploadedBy) : undefined,
    annotations: image.annotations
      ? image.annotations.map(sanitizeAnnotation)
      : undefined,
  };
}

export function sanitizeAnnotation(
  annotation: Annotation & {
    createdBy?: User;
  }
): SafeAnnotation {
  return {
    ...annotation,
    createdBy: annotation.createdBy ? sanitizeUser(annotation.createdBy) : undefined,
  };
}

export function createPaginationObject(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    pageSize: limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

// Type guard functions
export function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj.id === 'number' &&
    typeof obj.email === 'string' &&
    typeof obj.username === 'string'
  );
}

export function isImage(obj: any): obj is Image {
  return (
    obj &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.filePath === 'string'
  );
}

export function isAnnotation(obj: any): obj is Annotation {
  return (
    obj &&
    typeof obj.id === 'number' &&
    typeof obj.x === 'number' &&
    typeof obj.y === 'number' &&
    typeof obj.label === 'string'
  );
}

// Query builder helpers
export function buildWhereClause(filters: Record<string, any>) {
  const where: Record<string, any> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'string' && value.includes('*')) {
        where[key] = { contains: value.replace(/\*/g, '') };
      } else {
        where[key] = value;
      }
    }
  });

  return where;
}

export function buildOrderByClause(
  sortField: string,
  sortOrder: 'asc' | 'desc'
) {
  const orderBy: Record<string, any> = {};
  
  if (sortField.includes('.')) {
    const [relation, field] = sortField.split('.');
    orderBy[relation] = { [field]: sortOrder };
  } else {
    orderBy[sortField] = sortOrder;
  }

  return orderBy;
}