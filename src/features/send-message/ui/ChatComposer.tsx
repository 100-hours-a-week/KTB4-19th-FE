import {
  IconPictureLine,
  IconXmarkFill,
} from '@karrotmarket/react-monochrome-icon';
import { PrefixIcon } from '@seed-design/react';
import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { ActionButton } from 'seed-design/ui/action-button';
import { TextField, TextFieldTextarea } from 'seed-design/ui/text-field';
import {
  imageSelectionError,
  imageSizeError,
  maxImageCount,
} from '../lib/imageRules.mjs';
import {
  releaseImages,
  toSelectedImage,
  type SelectedImage,
} from '../lib/selectedImage';

export const messageMaxLength = 200;

const imageAccept =
  'image/jpeg,image/png,image/heic,image/heif,.jpg,.jpeg,.png,.heic,.heif';

type Props = {
  value: string;
  onChange: (value: string) => void;
  images: SelectedImage[];
  onImagesChange: (images: SelectedImage[]) => void;
  onSubmit: () => void;
  sending: boolean;
  /** 429 등으로 잠시 전송을 막아야 할 때 남은 초 */
  lockedSeconds: number;
  errorMessage?: string;
};

export function ChatComposer({
  value,
  onChange,
  images,
  onImagesChange,
  onSubmit,
  sending,
  lockedSeconds,
  errorMessage,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preparingImages, setPreparingImages] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const canSend =
    (value.trim().length > 0 || images.length > 0) &&
    !sending &&
    !preparingImages &&
    lockedSeconds === 0;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    )
      return;
    event.preventDefault();
    if (canSend) onSubmit();
  };

  const selectImages = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    addImages(files);
  };

  const addImages = async (files: File[]) => {
    if (files.length === 0) return;
    const selectionError = imageSelectionError(images.length, files);
    setImageError(selectionError);
    if (selectionError) return;

    setPreparingImages(true);
    try {
      const added = await Promise.all(files.map(toSelectedImage));
      const sizeError = imageSizeError(added.map((image) => image.file));
      if (sizeError) {
        releaseImages(added);
        setImageError(sizeError);
        return;
      }
      onImagesChange([...images, ...added]);
    } catch {
      setImageError('사진을 불러오지 못했어요. 다른 사진을 골라 주세요.');
    } finally {
      setPreparingImages(false);
    }
  };

  const removeImage = (removed: SelectedImage) => {
    releaseImages([removed]);
    onImagesChange(images.filter((image) => image !== removed));
  };

  return (
    <form
      className="composer"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) onSubmit();
      }}
    >
      {images.length > 0 && (
        <ul className="composer-images" aria-label="첨부한 사진">
          {images.map((image, index) => (
            <li className="composer-image" key={image.previewUrl}>
              <img src={image.previewUrl} alt={`첨부한 사진 ${index + 1}`} />
              <button
                type="button"
                aria-label={`사진 ${index + 1} 빼기`}
                disabled={sending}
                onClick={() => removeImage(image)}
              >
                <IconXmarkFill />
              </button>
            </li>
          ))}
        </ul>
      )}
      <TextField
        value={value}
        onValueChange={({ value: next }) => onChange(next)}
        maxGraphemeCount={messageMaxLength}
        hideCharacterCount={false}
        invalid={!!(imageError ?? errorMessage)}
        errorMessage={imageError ?? errorMessage}
      >
        <TextFieldTextarea
          aria-label="메시지"
          placeholder="메시지를 입력해 주세요"
          onKeyDown={handleKeyDown}
        />
      </TextField>
      <div className="composer-actions">
        <ActionButton
          type="button"
          variant="neutralWeak"
          size="small"
          loading={preparingImages}
          disabled={sending || images.length >= maxImageCount}
          onClick={() => fileInputRef.current?.click()}
        >
          <PrefixIcon svg={<IconPictureLine />} />
          사진 {images.length}/{maxImageCount}
        </ActionButton>
        <input
          ref={fileInputRef}
          hidden
          type="file"
          multiple
          accept={imageAccept}
          onChange={selectImages}
        />
        <span>Enter로 전송 · Shift+Enter로 줄바꿈</span>
        <ActionButton
          type="submit"
          variant="brandSolid"
          loading={sending}
          disabled={!canSend && !sending}
        >
          {lockedSeconds > 0 ? `${lockedSeconds}초 후 전송` : '전송'}
        </ActionButton>
      </div>
    </form>
  );
}
