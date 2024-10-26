import React, { useState, useRef, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Move, 
  Maximize2, 
  Download,
  Loader2
} from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt?: string;
  className?: string;
  initialZoom?: number;
  maxZoom?: number;
  minZoom?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  downloadable?: boolean;
  controls?: boolean;
}

const ImageViewer = ({
  src,
  alt = '',
  className = '',
  initialZoom = 1,
  maxZoom = 4,
  minZoom = 0.5,
  onLoad,
  onError,
  downloadable = false,
  controls = true
}: ImageViewerProps) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (zoom < minZoom) setZoom(minZoom);
    if (zoom > maxZoom) setZoom(maxZoom);
  }, [zoom, minZoom, maxZoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only handle left click
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + delta));
    setZoom(newZoom);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    const error = new Error('Failed to load image');
    setError(error);
    onError?.(error);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = alt || 'image';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  const resetView = () => {
    setZoom(initialZoom);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className={`relative overflow-hidden ${className}`} ref={containerRef}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <p className="text-red-500">Failed to load image</p>
        </div>
      )}

      <div
        className={`relative w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="max-w-full h-auto select-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          draggable={false}
        />
      </div>

      {controls && !isLoading && !error && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-white/90 p-2 rounded-lg shadow-lg">
          <button
            onClick={() => setZoom(z => Math.min(maxZoom, z + 0.1))}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(minZoom, z - 0.1))}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setRotation(r => r + 90)}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Rotate"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <button
            onClick={resetView}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Reset view"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          {downloadable && (
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageViewer;