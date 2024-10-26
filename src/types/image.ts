// types/image.ts
export interface ImageProcessingOptions {
    filename?: string;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
    maintainAspectRatio?: boolean;
    compressionLevel?: number;
    generateThumbnail?: boolean;
    thumbnailOptions?: {
      width?: number;
      height?: number;
      quality?: number;
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    };
  }
  
  export interface ProcessedImage {
    data: Buffer;
    thumbnail: Buffer | null;
    metadata: {
      filename: string;
      thumbnailFilename: string | null;
      format: string;
      dimensions: ImageDimensions;
      originalSize?: number;
      processedSize: number;
      thumbnailSize?: number;
    };
  }
  
  export interface ImageDimensions {
    width: number;
    height: number;
  }
  
  export interface ImageMetadata {
    width?: number;
    height?: number;
    format?: string;
    space?: string;
    channels?: number;
    depth?: string;
    density?: number;
    hasAlpha?: boolean;
    orientation?: number;
    isProgressive?: boolean;
    chromaSubsampling?: string;
    isOpaque?: boolean;
    profiles?: string[];
  }
  
  // types/imageEditor.ts
  export type BlendMode = 
    | 'normal' 
    | 'multiply' 
    | 'screen' 
    | 'overlay' 
    | 'darken' 
    | 'lighten' 
    | 'color-dodge' 
    | 'color-burn' 
    | 'hard-light' 
    | 'soft-light' 
    | 'difference' 
    | 'exclusion' 
    | 'hue' 
    | 'saturation' 
    | 'color' 
    | 'luminosity';
  
  export type LayerType = 'image' | 'text' | 'shape' | 'adjustment';
  
  export interface LayerPosition {
    x: number;
    y: number;
    rotation?: number;
    scale?: {
      x: number;
      y: number;
    };
  }
  
  export interface LayerEffects {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    sharpen?: number;
    noise?: number;
    sepia?: number;
    hue?: number;
    opacity?: number;
    shadow?: {
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
      spread?: number;
    };
    outline?: {
      color: string;
      width: number;
      style?: 'solid' | 'dashed' | 'dotted';
    };
  }
  
  export interface Layer {
    id: string;
    name: string;
    type: LayerType;
    visible: boolean;
    opacity: number;
    data: ImageData;
    position: LayerPosition;
    blendMode: BlendMode;
    effects?: LayerEffects;
    mask?: ImageData;
    locked?: boolean;
    metadata?: Record<string, any>;
  }
  
  export interface Project {
    id: string;
    name: string;
    width: number;
    height: number;
    layers: Layer[];
    createdAt: Date;
    updatedAt: Date;
    version?: string;
    metadata?: Record<string, any>;
  }
  
  export interface ImageEditorOptions {
    id?: string;
    name?: string;
    width?: number;
    height?: number;
    backgroundColor?: string;
    format?: 'png' | 'jpeg' | 'webp';
    quality?: number;
    preserveAspectRatio?: boolean;
  }
  
  export interface SerializedLayer extends Omit<Layer, 'data' | 'mask'> {
    data: string; // base64
    mask?: string; // base64
  }
  
  export interface SerializedProject extends Omit<Project, 'layers'> {
    layers: SerializedLayer[];
  }
  
  // Image Transform Types
  export interface ImageTransform {
    resize?: {
      width?: number;
      height?: number;
      fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
      position?: 'top' | 'right top' | 'right' | 'right bottom' | 'bottom' | 'left bottom' | 'left' | 'left top' | 'center';
      background?: string;
      kernel?: 'nearest' | 'cubic' | 'mitchell' | 'lanczos2' | 'lanczos3';
    };
    rotate?: {
      angle: number;
      background?: string;
    };
    flip?: {
      horizontal?: boolean;
      vertical?: boolean;
    };
    crop?: {
      left: number;
      top: number;
      width: number;
      height: number;
    };
    adjust?: {
      brightness?: number;
      contrast?: number;
      saturation?: number;
      hue?: number;
      lightness?: number;
      alpha?: number;
    };
    filter?: {
      blur?: number;
      sharpen?: number;
      gamma?: number;
      grayscale?: boolean;
      normalise?: boolean;
      invert?: boolean;
      threshold?: number;
    };
  }
  
  // Image Operation History
  export interface ImageOperation {
    id: string;
    type: 'layer' | 'adjustment' | 'filter' | 'transform';
    action: string;
    params: Record<string, any>;
    timestamp: Date;
    layerId?: string;
  }
  
  export interface ImageHistory {
    operations: ImageOperation[];
    currentIndex: number;
    maxSize?: number;
  }
  
  // Export Options
  export interface ExportOptions {
    format: 'png' | 'jpeg' | 'webp';
    quality?: number;
    progressive?: boolean;
    compressionLevel?: number;
    includeLayers?: boolean;
    includeHistory?: boolean;
    metadata?: {
      title?: string;
      description?: string;
      copyright?: string;
      author?: string;
      software?: string;
      [key: string]: string | undefined;
    };
  }
  
  // Project Management Types
  export interface ProjectMetadata {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    dimensions: ImageDimensions;
    format: string;
    size: number;
    layerCount: number;
    thumbnail?: string;
    tags?: string[];
    version: string;
    lastModifiedBy?: string;
    originalFilename?: string;
  }
  
  export interface SaveOptions {
    compress?: boolean;
    includeHistory?: boolean;
    includeThumbnail?: boolean;
    backupOriginal?: boolean;
  }
  
  export interface LoadOptions {
    validateLayers?: boolean;
    loadHistory?: boolean;
    maxLayerSize?: number;
    validateDimensions?: boolean;
  }
  
  // Error Types
  export interface ImageError extends Error {
    code: string;
    details?: Record<string, any>;
  }
  
  export type ImageProcessingError = 
    | 'INVALID_FORMAT'
    | 'INVALID_DIMENSIONS'
    | 'PROCESSING_FAILED'
    | 'MEMORY_LIMIT_EXCEEDED'
    | 'INVALID_OPERATION'
    | 'UNSUPPORTED_FORMAT'
    | 'IO_ERROR';