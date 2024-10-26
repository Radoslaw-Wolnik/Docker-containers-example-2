import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';
import { BadRequestError } from '@/lib/errors';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export async function processImage(
  file: File,
  userId: number,
  options: ImageProcessingOptions = {}
): Promise<{ filePath: string; publicUrl: string }> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 80,
    format = 'webp'
  } = options;

  // Create user directory if it doesn't exist
  const userDir = path.join(process.cwd(), 'public', 'uploads', 'users', userId.toString());
  await fs.mkdir(userDir, { recursive: true });

  // Generate unique filename
  const filename = `${uuidv4()}.${format}`;
  const filePath = path.join(userDir, filename);
  const publicUrl = `/uploads/users/${userId}/${filename}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    
    await sharp(buffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      [format]({
        quality,
      })
      .toFile(filePath);

    return { filePath, publicUrl };
  } catch (error) {
    throw new BadRequestError('Failed to process image');
  }
}

export async function deleteImage(publicUrl: string): Promise<void> {
  const filePath = path.join(process.cwd(), 'public', publicUrl);
  
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }
}

export function generateThumbnail(
  originalPath: string,
  width: number = 200,
  height: number = 200
): Promise<Buffer> {
  return sharp(originalPath)
    .resize(width, height, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 80 })
    .toBuffer();
}