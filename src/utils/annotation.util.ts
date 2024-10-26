// src/utils/annotation.util.ts
interface Point {
    x: number;
    y: number;
  }
  
  export function getRelativeCoordinates(
    event: React.MouseEvent | MouseEvent,
    element: HTMLElement | null
  ): Point {
    if (!element) {
      return { x: 0, y: 0 };
    }
  
    const rect = element.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
  
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
  }
  
  export function calculateArrowPoints(start: Point, end: Point): string {
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const headLength = 10;
  
    const head1 = {
      x: end.x - headLength * Math.cos(angle - Math.PI / 6),
      y: end.y - headLength * Math.sin(angle - Math.PI / 6)
    };
  
    const head2 = {
      x: end.x - headLength * Math.cos(angle + Math.PI / 6),
      y: end.y - headLength * Math.sin(angle + Math.PI / 6)
    };
  
    return `
      M ${start.x},${start.y}
      L ${end.x},${end.y}
      M ${head1.x},${head1.y}
      L ${end.x},${end.y}
      L ${head2.x},${head2.y}
    `.trim();
  }