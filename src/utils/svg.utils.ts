interface Point {
    x: number;
    y: number;
  }
  
  interface ArrowConfig {
    headSize?: number;
    strokeWidth?: number;
    color?: string;
  }
  
  export const svgUtils = {
    createSVGPoint(x: number, y: number): Point {
      return { x, y };
    },
  
    calculateArrowPath(
      start: Point,
      end: Point,
      config: ArrowConfig = {}
    ): string {
      const { headSize = 10, strokeWidth = 2 } = config;
      
      // Calculate angle for arrow head
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      
      // Calculate arrow head points
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
      `;
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
      `;
    },
  
    calculateLabelPosition(
      point: Point,
      labelWidth: number,
      labelHeight: number,
      svgWidth: number,
      svgHeight: number
    ): Point {
      let x = point.x;
      let y = point.y;
  
      // Adjust x position if label would extend beyond SVG bounds
      if (x + labelWidth > svgWidth) {
        x = x - labelWidth;
      }
  
      // Adjust y position if label would extend beyond SVG bounds
      if (y + labelHeight > svgHeight) {
        y = y - labelHeight;
      }
  
      return { x, y };
    },
  
    // Convert percentage coordinates to SVG viewport coordinates
    percentageToSVGCoords(
      percentX: number,
      percentY: number,
      svgWidth: number,
      svgHeight: number
    ): Point {
      return {
        x: (percentX / 100) * svgWidth,
        y: (percentY / 100) * svgHeight
      };
    },
  
    // Convert SVG viewport coordinates to percentage
    SVGCoordsToPercentage(
      x: number,
      y: number,
      svgWidth: number,
      svgHeight: number
    ): Point {
      return {
        x: (x / svgWidth) * 100,
        y: (y / svgHeight) * 100
      };
    },
  
    // Create SVG markup for line with label
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
  
      // Calculate middle point for label placement
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
      `;
    }
  };
  
  export default svgUtils;