import { isHeicImage, toJpgName } from './imageRules.mjs';

export type SelectedImage = { file: File; previewUrl: string };

export async function toSelectedImage(file: File): Promise<SelectedImage> {
  const uploadable = isHeicImage(file) ? await convertHeicToJpg(file) : file;
  return { file: uploadable, previewUrl: URL.createObjectURL(uploadable) };
}

export function releaseImages(images: SelectedImage[]) {
  images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
}

async function convertHeicToJpg(file: File) {
  const { heicTo } = await import('heic-to');
  const jpg = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.9 });
  return new File([jpg], toJpgName(file.name), { type: 'image/jpeg' });
}
