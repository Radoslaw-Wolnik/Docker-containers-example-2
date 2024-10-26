// types/file.ts
export interface FileProcessingOptions {
    maxSize?: number;
    allowedTypes?: string[];
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
  }
  
  export interface ProcessedFile {
    url: string;
    path: string;
    filename: string;
    mimetype: string;
    size: number;
    dimensions?: {
      width: number;
      height: number;
    };
  }