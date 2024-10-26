// utils/imageProcessing.util.ts
import sharp from 'sharp';
import path from 'path';
// import { v4 as uuidv4 } from 'uuid';
import { mkdir } from 'fs/promises';
import logger from '@/lib/logger';
import type { ImageProcessingOptions, ProcessedImage, ImageMetadata, ImageDimensions } from '@/types/image';
import { BadRequestError, InternalServerError } from '@/lib/errors';

export class ImageProcessor {
  private static instance: ImageProcessor;
  private readonly uploadDir: string;

  private constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    this.initializeDirectories().catch(error => {
      logger.error('Failed to initialize directories:', error);
    });
  }

  public static getInstance(): ImageProcessor {
    if (!ImageProcessor.instance) {
      ImageProcessor.instance = new ImageProcessor();
    }
    return ImageProcessor.instance;
  }

  private async initializeDirectories(): Promise<void> {
    const directories = ['original', 'processed', 'thumbnails', 'temp'].map(dir => path.join(this.uploadDir, dir));
    await Promise.all(directories.map(dir => mkdir(dir, { recursive: true })));
  }

  // Shared process function
  private async processImageBuffer(
    buffer: Buffer | string,
    options: Partial<ImageProcessingOptions>
  ): Promise<Buffer> {
    const { maxWidth: width, maxHeight: height, quality, format } = options;
    return await sharp(buffer)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      [format || 'webp']({ quality: quality || 80 })
      .toBuffer();
  }

  public async processImage(
    buffer: Buffer,
    options: Partial<ImageProcessingOptions> = {}
  ): Promise<ProcessedImage> {
    try {
      const { maxWidth: width, maxHeight: height, format = 'jpeg' } = options;

      let image = sharp(buffer).toFormat(format);

      if (width && height) {
        image = image.resize(width, height);
      }

      const { data, info } = await image.toBuffer({ resolveWithObject: true });

      return {
        data,
        thumbnail: null, // thumbnail buffer or null 
        metadata: {
          filename: options.filename || 'processed_image',
          thumbnailFilename: null,
          format: info.format,
          dimensions: { width: info.width, height: info.height },
          processedSize: info.size,
        },
      };
    } catch (error) {
      logger.error('Failed to process image:', error);
      throw new InternalServerError('Image processing failed');
    }
  }

  public async generateThumbnail(
    buffer: Buffer,
    width = 200,
    height = 200
  ): Promise<ProcessedImage> {
    try {
      const thumbnail = await sharp(buffer)
        .resize(width, height)
        .toFormat('jpeg')
        .toBuffer({ resolveWithObject: true });

      return {
        data: thumbnail.data,
        thumbnail: null, // thumbnail buffer or null 
        metadata: {
          filename: 'thumbnail_image',
          thumbnailFilename: null,
          format: 'jpeg',
          dimensions: { width, height },
          processedSize: thumbnail.info.size,
        },
      };
    } catch (error) {
      logger.error('Failed to generate thumbnail:', error);
      throw new InternalServerError('Thumbnail generation failed');
    }
  }

  public async extractMetadata(buffer: Buffer): Promise<ImageMetadata> {
    try {
      return await sharp(buffer).metadata();
    } catch (error) {
      logger.error('Failed to extract metadata:', error);
      throw new InternalServerError('Failed to extract image metadata');
    }
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): ImageDimensions {
    const aspectRatio = originalWidth / originalHeight;
    let width = Math.min(originalWidth, maxWidth);
    let height = Math.round(width / aspectRatio);

    if (height > maxHeight) {
      height = maxHeight;
      width = Math.round(height * aspectRatio);
    }

    return { width, height };
  }
}

export const imageProcessor = ImageProcessor.getInstance();
