// utils/file-operations.ts
import { Layer, ProjectData } from '../types/image-editor';

interface SerializedLayer {
  id: number;
  visible: boolean;
  name: string;
  data: {
    width: number;
    height: number;
    data: number[];
    colorSpace: string;
  };
}

export const saveToLocal = async (projectData: ProjectData): Promise<void> => {
  const serializedLayers = projectData.layers.map(layer => ({
    id: layer.id,
    visible: layer.visible,
    name: layer.name,
    data: {
      width: layer.data.width,
      height: layer.data.height,
      data: Array.from(layer.data.data),
      colorSpace: layer.data.colorSpace
    }
  }));

  const serializedProject = {
    ...projectData,
    layers: serializedLayers
  };

  const blob = new Blob([JSON.stringify(serializedProject)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `pixel-art-${new Date().getTime()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const loadFromLocal = async (file: File): Promise<ProjectData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsedData = JSON.parse(content);
        
        // Convert data back to ImageData
        const layers = parsedData.layers.map((layer: SerializedLayer) => ({
          id: layer.id,
          visible: layer.visible,
          name: layer.name,
          data: convertToImageData(layer.data)
        }));
        
        resolve({ 
          ...parsedData,
          layers 
        });
      } catch (error) {
        reject(new Error('Invalid project file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};

const convertToImageData = (data: { width: number; height: number; data: number[]; colorSpace: string }): ImageData => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  const imageData = new ImageData(
    new Uint8ClampedArray(data.data),
    data.width,
    data.height,
    { colorSpace: data.colorSpace as PredefinedColorSpace }
  );
  return imageData;
};

export const saveToServer = async (
  imageData: string, 
  layers: Layer[], 
  plantId: number, 
  userId: number
): Promise<void> => {
  try {
    const response = await fetch(`/api/icon/save/${plantId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageData, layers, userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to save to server');
    }
  } catch (error) {
    console.error('Error saving to server:', error);
    throw error;
  }
};

export const loadFromServer = async (
  plantId: number, 
  version: number
): Promise<ProjectData & { creator?: { id: number; username: string } }> => {
  try {
    const response = await fetch(`/api/icon/load/${plantId}/${version}`);
    if (!response.ok) {
      throw new Error('Failed to load from server');
    }
    const projectData = await response.json();
    return {
      ...projectData,
      layers: projectData.layers.map((layer: SerializedLayer) => ({
        ...layer,
        data: convertToImageData(layer.data)
      }))
    };
  } catch (error) {
    console.error('Error loading from server:', error);
    throw error;
  }
};