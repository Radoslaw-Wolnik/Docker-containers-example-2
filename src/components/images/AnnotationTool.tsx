// src/components/image/AnnotationTool.tsx
import { AnnotationType } from "@prisma/client";
import { LucideIcon } from 'lucide-react';

interface AnnotationToolProps {
  type: AnnotationType;
  isSelected: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}
  
export function AnnotationTool({
  isSelected,
  onClick,
  icon: Icon,
  label
}: AnnotationToolProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-md transition-colors
        ${isSelected 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
      `}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}
  