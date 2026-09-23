import { useState } from 'react';

export function ComplaintThumbnail({
  fileUrl,
  fallback,
}: {
  fileUrl: string | null;
  fallback: string;
}) {
  const [failed, setFailed] = useState(false);
  const showsImage = Boolean(fileUrl) && !failed;
  return (
    <span className={`complaint-thumb ${showsImage ? 'has-image' : ''}`}>
      {showsImage ? (
        <img
          src={fileUrl ?? undefined}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        fallback
      )}
    </span>
  );
}
