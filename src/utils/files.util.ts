import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { BadRequestError } from '@/lib/errors';
import logger from '@/lib/logger';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function uploadFile(file: File, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']): Promise<string> {
  if (!file) {
    throw new BadRequestError('No file provided');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new BadRequestError('Invalid file type');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uniqueFilename = `${uuidv4()}${path.extname(file.name)}`;
  const filePath = path.join(UPLOAD_DIR, uniqueFilename);

  try {
    if (file.type.startsWith('image/')) {
      await sharp(buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .toFile(filePath);
    } else {
      await writeFile(filePath, buffer);
    }

    logger.info('File uploaded successfully', { filename: uniqueFilename });
    return `/uploads/${uniqueFilename}`;
  } catch (error) {
    logger.error('Error uploading file', { error });
    throw new BadRequestError('Error uploading file');
  }
}

export async function deleteFile(fileUrl: string): Promise<void> {
  const filePath = path.join(process.cwd(), 'public', fileUrl);
  try {
    await fs.unlink(filePath);
    logger.info('File deleted successfully', { fileUrl });
  } catch (error) {
    logger.error('Error deleting file', { error, fileUrl });
    throw new BadRequestError('Error deleting file');
  }
}