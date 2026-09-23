import {
  isHeicImage,
  jpegQuality,
  needsCompression,
  scaledSize,
  toJpgName,
} from './imageRules.mjs';

export type SelectedImage = { file: File; previewUrl: string };

export async function toSelectedImage(file: File): Promise<SelectedImage> {
  const jpg = isHeicImage(file) ? await convertHeicToJpg(file) : file;
  const uploadable = needsCompression(jpg) ? await compressToJpg(jpg) : jpg;
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

// 원본은 보관하지 않고 업로드 전에 줄인다. AI 서버도 같은 URL을 내려받으므로 전달 시간이 함께 줄어든다.
async function compressToJpg(file: File) {
  const bitmap = await createImageBitmap(file);
  const { width, height } = scaledSize(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    bitmap.close();
    return file;
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', jpegQuality),
  );
  if (!blob || blob.size >= file.size) {
    return file;
  }
  return new File([blob], toJpgName(file.name), { type: 'image/jpeg' });
}
