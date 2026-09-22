export const maxImageCount = 3;
export const maxImageBytes = 10 * 1024 * 1024;

const extensionOf = (name) => name.split('.').pop()?.toLowerCase() ?? '';

export function isHeicImage(file) {
  return (
    ['image/heic', 'image/heif'].includes(file.type) ||
    ['heic', 'heif'].includes(extensionOf(file.name))
  );
}

function isUploadableImage(file) {
  return (
    ['image/jpeg', 'image/png'].includes(file.type) ||
    ['jpg', 'jpeg', 'png'].includes(extensionOf(file.name))
  );
}

export function toJpgName(name) {
  const dot = name.lastIndexOf('.');
  return `${dot > 0 ? name.slice(0, dot) : name}.jpg`;
}

export function imageSelectionError(attachedCount, files) {
  if (attachedCount + files.length > maxImageCount)
    return `사진은 ${maxImageCount}장까지 첨부할 수 있어요.`;
  if (files.some((file) => !isUploadableImage(file) && !isHeicImage(file)))
    return 'JPG, PNG, HEIC 사진만 첨부할 수 있어요.';
  return null;
}

export function imageSizeError(files) {
  return files.some((file) => file.size > maxImageBytes)
    ? '사진은 한 장에 10MB 이하만 첨부할 수 있어요.'
    : null;
}
