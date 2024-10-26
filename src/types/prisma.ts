import { Prisma } from '@prisma/client';

// User types
export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    images: true;
    annotations: true;
    tokens: true;
  };
}>;

export type UserCreateInput = Prisma.UserCreateInput;
export type UserUpdateInput = Prisma.UserUpdateInput;

// Image types
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
        likes: true;
      };
    };
  };
}>;

export type ImageCreateInput = Prisma.ImageCreateInput;
export type ImageUpdateInput = Prisma.ImageUpdateInput;

// Annotation types
export type AnnotationWithRelations = Prisma.AnnotationGetPayload<{
  include: {
    image: true;
    createdBy: true;
  };
}>;

export type AnnotationCreateInput = Prisma.AnnotationCreateInput;
export type AnnotationUpdateInput = Prisma.AnnotationUpdateInput;

// Token types
export type TokenWithRelations = Prisma.TokenGetPayload<{
  include: {
    user: true;
  };
}>;

// Database query types
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

// Query builder types
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