type Photo = {
  attachmentId: number;
  fileUrl: string | null;
  seq: number;
};

export function ComplaintPhotoGrid({ photos }: { photos: Photo[] }) {
  const shown = photos.filter((photo) => photo.fileUrl);
  if (shown.length === 0) {
    return <p>첨부 사진이 없어요.</p>;
  }
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
          <img
            src={photo.fileUrl ?? undefined}
            alt={`첨부 사진 ${photo.seq}`}
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );
}
