type ImageFileLike = { name: string; type: string };

export const maxImageCount: number;
export const maxImageBytes: number;
export const maxUploadBytes: number;
export const maxImageEdge: number;
export const jpegQuality: number;
export function needsCompression(file: { size: number }): boolean;
export function scaledSize(
  width: number,
  height: number,
  maxEdge?: number,
): { width: number; height: number };

export function isHeicImage(file: ImageFileLike): boolean;
export function toJpgName(name: string): string;
export function imageSelectionError(
  attachedCount: number,
  files: ImageFileLike[],
): string | null;
export function imageSizeError(files: Array<{ size: number }>): string | null;
