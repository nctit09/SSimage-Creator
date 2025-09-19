export enum Quality {
  Standard = 'Standard',
  TwoK = '2K',
  FourK = '4K',
  EightK = '8K',
}

export type AspectRatio = '1:1' | '3:4' | '9:16' | '16:9';

export interface FormData {
  character: string;
  scene: string;
  quality: Quality;
  removeBackground: boolean;
  imageFiles: File[];
  aspectRatio: AspectRatio;
}

export interface GeneratedImage {
  id: string;
  src: string;
  alt: string;
}