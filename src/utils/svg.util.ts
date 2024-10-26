// utils/svg.util.ts
import type { Point, ArrowConfig, SVGDimensions } from '@/types/svg';

export const svgUtils = {
  createSVGPoint(x: number, y: number): Point {
    return { x, y };
  },

  calculateArrowPath(
    start: Point,
    end: Point,
    config: ArrowConfig = {}
  ): string {
    const { 
      headSize = 10, 
      strokeWidth = 2,
      dash = '' 
    } = config;
    
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    
    const head1 = {
      x: end.x - headSize * Math.cos(angle - Math.PI / 6),
      y: end.y - headSize * Math.sin(angle - Math.PI / 6)
    };
    
    const head2 = {
      x: end.x - headSize * Math.cos(angle + Math.PI / 6),
      y: end.y - headSize * Math.sin(angle + Math.PI / 6)
    };

    return `
      M ${start.x},${start.y}
      L ${end.x},${end.y}
      M ${head1.x},${head1.y}
      L ${end.x},${end.y}
      L ${head2.x},${head2.y}
    `.trim();
  },

  generateDotElement(
    point: Point,
    radius: number = 5,
    color: string = '#3B82F6'
  ): string {
    return `
      <circle
        cx="${point.x}"
        cy="${point.y}"
        r="${radius}"
        fill="${color}"
      />
    `.trim();
  },

  createLabelledLine(
    start: Point,
    end: Point,
    label: string,
    config: {
      strokeWidth?: number;
      color?: string;
      labelBgColor?: string;
      fontSize?: number;
    } = {}
  ): string {
    const {
      strokeWidth = 2,
      color = '#3B82F6',
      labelBgColor = '#FFFFFF',
      fontSize = 12
    } = config;

    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    return `
      <line
        x1="${start.x}"
        y1="${start.y}"
        x2="${end.x}"
        y2="${end.y}"
        stroke="${color}"
        stroke-width="${strokeWidth}"
      />
      <rect
        x="${midX - 40}"
        y="${midY - 10}"
        width="80"
        height="20"
        fill="${labelBgColor}"
        rx="4"
      />
      <text
        x="${midX}"
        y="${midY + 5}"
        text-anchor="middle"
        font-size="${fontSize}"
        fill="${color}"
      >${label}</text>
    `.trim();
  },

  calculateLabelPosition(
    point: Point,
    labelWidth: number,
    labelHeight: number,
    svgDimensions: SVGDimensions
  ): Point {
    let x = point.x;
    let y = point.y;

    // Adjust x position if label would extend beyond SVG bounds
    if (x + labelWidth > svgDimensions.width) {
      x = x - labelWidth;
    }

    // Adjust y position if label would extend beyond SVG bounds
    if (y + labelHeight > svgDimensions.height) {
      y = y - labelHeight;
    }

    // Ensure label doesn't go beyond left or top bounds
    x = Math.max(0, x);
    y = Math.max(0, y);

    return { x, y };
  },

  // Convert percentage coordinates to SVG viewport coordinates
  percentageToSVGCoords(
    percentX: number,
    percentY: number,
    svgDimensions: SVGDimensions
  ): Point {
    return {
      x: (percentX / 100) * svgDimensions.width,
      y: (percentY / 100) * svgDimensions.height
    };
  },

  // Convert SVG viewport coordinates to percentage
  SVGCoordsToPercentage(
    x: number,
    y: number,
    svgDimensions: SVGDimensions
  ): Point {
    return {
      x: (x / svgDimensions.width) * 100,
      y: (y / svgDimensions.height) * 100
    };
  },

  // Calculate distance between two points
  calculateDistance(point1: Point, point2: Point): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // Create curved path between points
  createCurvedPath(
    points: Point[],
    tension: number = 0.5
  ): string {
    if (points.length < 2) return '';

    const firstPoint = points[0];
    let path = `M ${firstPoint.x},${firstPoint.y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      const controlPoint1 = {
        x: current.x + (next.x - current.x) * tension,
        y: current.y
      };
      
      const controlPoint2 = {
        x: next.x - (next.x - current.x) * tension,
        y: next.y
      };

      path += ` C ${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${next.x},${next.y}`;
    }

    return path;
  },

  // Create marker definitions for arrows
  createArrowMarker(
    id: string,
    config: {
      color?: string;
      size?: number;
    } = {}
  ): string {
    const { color = '#000000', size = 10 } = config;

    return `
      <defs>
        <marker
          id="${id}"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerUnits="strokeWidth"
          markerWidth="${size}"
          markerHeight="${size}"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 0 L 10 5 L 0 10 z"
            fill="${color}"
          />
        </marker>
      </defs>
    `.trim();
  },

  // Check if a point is within a certain radius of another point
  isPointNearby(
    point1: Point,
    point2: Point,
    radius: number
  ): boolean {
    return this.calculateDistance(point1, point2) <= radius;
  },

  // Create animation path
  createAnimationPath(
    points: Point[],
    duration: number = 1,
    type: 'linear' | 'bounce' | 'ease' = 'ease'
  ): string {
    const path = this.createCurvedPath(points);
    return `
      <animateMotion
        dur="${duration}s"
        repeatCount="indefinite"
        calcMode="${type}"
      >
        <mpath href="#${path}"/>
      </animateMotion>
    `.trim();
  }
};

export default svgUtils;