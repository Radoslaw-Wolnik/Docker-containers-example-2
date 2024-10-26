// src/components/image/AnnotationLayer.tsx
import { SafeAnnotation } from "@/types/global";
import { Point } from "@/types/svg";
import { AnnotationType } from "@/types/global";

interface AnnotationLayerProps {
  annotations: SafeAnnotation[];
  showAnnotations: boolean;
  selectedAnnotation: SafeAnnotation | null;
  onSelect: (annotation: SafeAnnotation | null) => void;
  drawingPoints: Point[];
}
  
  export function AnnotationLayer({
    annotations,
    showAnnotations,
    selectedAnnotation,
    onSelect,
    drawingPoints
  }: AnnotationLayerProps) {
    if (!showAnnotations) return null;
  
    return (
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="currentColor"
              />
            </marker>
          </defs>
  
          {annotations.map(annotation => (
            <g
              key={annotation.id}
              className={`
                transition-opacity cursor-pointer
                ${annotation.isHidden ? 'opacity-30' : 'opacity-100'}
                ${selectedAnnotation?.id === annotation.id ? 'text-blue-500' : 'text-gray-700'}
              `}
              style={{ pointerEvents: 'all' }}
              onClick={() => onSelect(annotation)}
            >
              {annotation.type === AnnotationType.DOT ? (
                <circle
                  cx={`${annotation.x}%`}
                  cy={`${annotation.y}%`}
                  r="4"
                  fill="currentColor"
                />
              ) : (
                <line
                  x1={`${annotation.x}%`}
                  y1={`${annotation.y}%`}
                  x2={`${annotation.endX}%`}
                  y2={`${annotation.endY}%`}
                  stroke="currentColor"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              )}
            </g>
          ))}
  
          {drawingPoints.length === 1 && (
            <line
              x1={`${drawingPoints[0].x}%`}
              y1={`${drawingPoints[0].y}%`}
              x2={`${drawingPoints[0].x}%`}
              y2={`${drawingPoints[0].y}%`}
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4"
            />
          )}
        </svg>
      </div>
    );
  }