export function residentPhotos(messages) {
  return messages
    .filter((message) => message.senderType === 'RESIDENT')
    .flatMap((message) => message.attachments);
}

export function representativePhotoId(photos, selectedId) {
  if (photos.some((photo) => photo.attachmentId === selectedId))
    return selectedId;
  return photos[0]?.attachmentId ?? null;
}
