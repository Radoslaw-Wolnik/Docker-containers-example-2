// utils/imageEditor.util.ts
import { imageProcessor } from './imageProcessing.util';
import type { Layer, Project, ImageEditorOptions, LayerEffects, SerializedProject } from '@/types/image';
import logger from '@/lib/logger';
import { InternalServerError } from '@/lib/errors';

export class ImageEditor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    this.ctx = ctx;
  }

  public async createProject(
    imageData: ImageData | string | Buffer,
    options: ImageEditorOptions = {}
  ): Promise<Project> {
    try {
      // Process initial image if needed
      let processedImage: ImageData;
      if (typeof imageData === 'string' || imageData instanceof Buffer) {
        const processed = await imageProcessor.processImage(imageData as Buffer, options);
        processedImage = await this.bufferToImageData(processed.data);
      } else {
        processedImage = imageData;
      }

      return {
        id: options.id || crypto.randomUUID(),
        name: options.name || 'Untitled Project',
        width: processedImage.width,
        height: processedImage.height,
        layers: [{
          id: crypto.randomUUID(),
          name: 'Background',
          type: 'image',
          visible: true,
          opacity: 1,
          data: processedImage,
          position: { x: 0, y: 0 },
          blendMode: 'normal'
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      logger.error('Failed to create project:', error);
      throw new InternalServerError('Failed to create image editor project');
    }
  }

  public async addLayer(
    project: Project,
    layerData: ImageData | Buffer,
    options: Partial<Layer> = {}
  ): Promise<Project> {
    try {
      const imageData = layerData instanceof Buffer 
        ? await this.bufferToImageData(layerData)
        : layerData;

      const newLayer: Layer = {
        id: options.id || crypto.randomUUID(),
        name: options.name || `Layer ${project.layers.length + 1}`,
        type: 'image',
        visible: true,
        opacity: options.opacity ?? 1,
        data: imageData,
        position: options.position || { x: 0, y: 0 },
        blendMode: options.blendMode || 'normal',
        effects: options.effects || {},
        mask: options.mask
      };

      return {
        ...project,
        layers: [...project.layers, newLayer],
        updatedAt: new Date()
      };
    } catch (error) {
      logger.error('Failed to add layer:', error);
      throw new InternalServerError('Failed to add layer to project');
    }
  }

  public applyEffects(
    layer: Layer,
    effects: LayerEffects
  ): ImageData {
    // Create a copy of the layer data
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = layer.data.width;
    tempCanvas.height = layer.data.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(layer.data, 0, 0);

    // Apply effects
    if (effects.brightness) {
      this.adjustBrightness(tempCtx, effects.brightness);
    }
    if (effects.contrast) {
      this.adjustContrast(tempCtx, effects.contrast);
    }
    if (effects.saturation) {
      this.adjustSaturation(tempCtx, effects.saturation);
    }
    if (effects.blur) {
      this.applyBlur(tempCtx, effects.blur);
    }

    return tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
  }

  public async saveProject(project: Project): Promise<SerializedProject> {
    const serializedLayers = await Promise.all(project.layers.map(async layer => ({
      ...layer,
      data: await this.imageDataToBase64(layer.data),
      mask: layer.mask ? await this.imageDataToBase64(layer.mask) : undefined
    })));

    return {
      ...project,
      layers: serializedLayers
    };
  }

  public async loadProject(serializedProject: SerializedProject): Promise<Project> {
    try {
      const layers = await Promise.all(
        serializedProject.layers.map(async layer => ({
          ...layer,
          data: await this.base64ToImageData(layer.data),
          mask: layer.mask ? await this.base64ToImageData(layer.mask) : undefined
        }))
      );

      return {
        ...serializedProject,
        layers
      };
    } catch (error) {
      logger.error('Failed to load project:', error);
      throw new InternalServerError('Failed to load image editor project');
    }
  }

  private async imageDataToBase64(imageData: ImageData): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  }

  private async base64ToImageData(base64: string): Promise<ImageData> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        resolve(ctx.getImageData(0, 0, img.width, img.height));
      };
      img.onerror = reject;
      img.src = base64;
    });
  }

  private async bufferToImageData(buffer: Buffer): Promise<ImageData> {
    const blob = new Blob([buffer]);
    const url = URL.createObjectURL(blob);
    try {
      return await this.base64ToImageData(url);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  private adjustBrightness(ctx: CanvasRenderingContext2D, value: number): void {
    ctx.filter = `brightness(${100 + value}%)`;
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.putImageData(imageData, 0, 0);
  }

  private adjustContrast(ctx: CanvasRenderingContext2D, value: number): void {
    ctx.filter = `contrast(${100 + value}%)`;
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.putImageData(imageData, 0, 0);
  }

  private adjustSaturation(ctx: CanvasRenderingContext2D, value: number): void {
    ctx.filter = `saturate(${100 + value}%)`;
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.putImageData(imageData, 0, 0);
  }

  private applyBlur(ctx: CanvasRenderingContext2D, value: number): void {
    ctx.filter = `blur(${value}px)`;
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.putImageData(imageData, 0, 0);
  }
}

export const createImageEditor = (width: number, height: number) => {
  return new ImageEditor(width, height);
};
