// src/types/prisma.ts
import { Prisma } from '@prisma/client';

// Base Prisma types
export type User = Prisma.UserGetPayload<{}>;
export type Image = Prisma.ImageGetPayload<{}>;
export type Annotation = Prisma.AnnotationGetPayload<{}>;
export type Token = Prisma.TokenGetPayload<{}>;

// Export all enums directly from Prisma
export {
  UserRole,
  AnnotationType,
  TokenType
} from '@prisma/client';

// Input/Update types
export type UserCreateInput = Prisma.UserCreateInput;
export type UserUpdateInput = Prisma.UserUpdateInput;
export type ImageCreateInput = Prisma.ImageCreateInput;
export type ImageUpdateInput = Prisma.ImageUpdateInput;
export type AnnotationCreateInput = Prisma.AnnotationCreateInput;
export type AnnotationUpdateInput = Prisma.AnnotationUpdateInput;

// Types with relations
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    images: true;
    annotations: true;
    tokens: true;
  };
}>;

export type ImageWithRelations = Prisma.ImageGetPayload<{
  include: {
    uploadedBy: true;
    annotations: {
      include: {
        createdBy: true;
      };
    };
    _count: {
      select: {
        annotations: true;
      };
    };
  };
}>;

export type AnnotationWithRelations = Prisma.AnnotationGetPayload<{
  include: {
    image: true;
    createdBy: true;
  };
}>;

export type TokenWithRelations = Prisma.TokenGetPayload<{
  include: {
    user: true;
  };
}>;

// Query builder types
export type WhereClause = {
  AND?: WhereClause[];
  OR?: WhereClause[];
  [key: string]: any;
};

export type OrderByClause = {
  [key: string]: Prisma.SortOrder;
};

export type Include = {
  [key: string]: boolean | Include;
};

export interface QueryOptions {
  where?: WhereClause;
  orderBy?: OrderByClause;
  include?: Include;
  skip?: number;
  take?: number;
  select?: {
    [key: string]: boolean | object;
  };
}