
export interface BoundingBox {
  x1: number; // Left
  x2: number; // Right
  y1: number; // Top
  y2: number; // Bottom
}

export interface ImageData {
  url: string;
  width: number;
  height: number;
}

export interface Detection {
  label: string;
  box: BoundingBox;
}
