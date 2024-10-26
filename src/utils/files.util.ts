// utils/file.util.ts
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { FileProcessingOptions, ProcessedFile } from '@/types/file';
import { BadRequestError, InternalServerError } from '@/lib/errors';
import logger from '@/lib/logger';
import { imageProcessor } from './imageProcessing.util';

const BASE_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function initializeUploadDirectories(): Promise<void> {
  const directories = ['users', 'images', 'temp', 'thumbnails'].map((dir) =>
    path.join(BASE_UPLOAD_DIR, dir)
  );
  await Promise.all(directories.map((dir) => mkdir(dir, { recursive: true })));
}

export async function uploadFile(
  file: File,
  options: FileProcessingOptions = {}
): Promise<ProcessedFile> {
  if (!file) {
    throw new BadRequestError('No file provided');
  }

  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  } = options;

  // Validate file
  if (!allowedTypes.includes(file.type)) {
    throw new BadRequestError(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }

  if (file.size > maxSize) {
    throw new BadRequestError(`File size exceeds limit of ${maxSize / 1024 / 1024}MB`);
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueFilename = `${uuidv4()}${path.extname(file.name)}`;
    const filePath = path.join(BASE_UPLOAD_DIR, uniqueFilename);
    const publicUrl = `/uploads/${uniqueFilename}`;

    // Process image if it's an image file
    if (file.type.startsWith('image/')) {
      const processedImage = await imageProcessor.processImage(buffer, options);
      await writeFile(filePath, new Uint8Array(processedImage.data.buffer));  // Explicitly cast Buffer to Uint8Array

      return {
        url: publicUrl,
        path: filePath,
        filename: uniqueFilename,
        mimetype: file.type,
        size: processedImage.data.length,
        dimensions: processedImage.metadata.dimensions,
      };
    }

    // Handle non-image files
    await writeFile(filePath, new Uint8Array(buffer.buffer));  // Explicitly cast Buffer to Uint8Array

    return {
      url: publicUrl,
      path: filePath,
      filename: uniqueFilename,
      mimetype: file.type,
      size: buffer.length,
    };
  } catch (error) {
    logger.error('Error uploading file:', { error, filename: file.name });
    throw new InternalServerError('Failed to process file');
  }
}


export async function deleteFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
    logger.info('File deleted successfully', { filePath });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      logger.error('Error deleting file:', { error, filePath });
      throw new InternalServerError('Failed to delete file');
    }
  }
}