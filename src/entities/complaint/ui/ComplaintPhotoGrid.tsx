import { Link } from 'react-router-dom';

type Photo = {
  attachmentId: number;
  fileUrl: string | null;
  seq: number;
};

export function ComplaintPhotoGrid({
  photos,
  totalCount,
  conversationHref,
}: {
  photos: Photo[];
  totalCount: number;
  conversationHref?: string;
}) {
  const shown = photos.filter((photo) => photo.fileUrl);
  if (shown.length === 0) {
    return <p>첨부 사진이 없어요.</p>;
  }
  const hiddenCount = totalCount - shown.length;
  return (
    <div className="photo-grid">
      {shown.map((photo) => (
        <a
          className="photo-grid-item"
          href={photo.fileUrl ?? undefined}
          key={photo.attachmentId}
          rel="noreferrer"
          target="_blank"
        >
          <img src={photo.fileUrl ?? undefined} alt={`첨부 사진 ${photo.seq}`} />
        </a>
      ))}
      {hiddenCount > 0 && conversationHref && (
        <Link className="photo-grid-more" to={conversationHref}>
          +{hiddenCount}
          <small>대화에서 보기</small>
        </Link>
      )}
    </div>
  );
}
