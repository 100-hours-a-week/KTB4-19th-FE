type PhotoLike = { attachmentId: number };
type MessageLike<Photo extends PhotoLike> = {
  senderType: string;
  attachments: Photo[];
};

export function residentPhotos<Photo extends PhotoLike>(
  messages: Array<MessageLike<Photo>>,
): Photo[];
export function representativePhotoId(
  photos: PhotoLike[],
  selectedId: number | null,
): number | null;
