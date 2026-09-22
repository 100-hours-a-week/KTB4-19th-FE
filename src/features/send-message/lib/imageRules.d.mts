type ImageFileLike = { name: string; type: string };

export const maxImageCount: number;
export const maxImageBytes: number;
export function isHeicImage(file: ImageFileLike): boolean;
export function toJpgName(name: string): string;
export function imageSelectionError(
  attachedCount: number,
  files: ImageFileLike[],
): string | null;
export function imageSizeError(files: Array<{ size: number }>): string | null;
