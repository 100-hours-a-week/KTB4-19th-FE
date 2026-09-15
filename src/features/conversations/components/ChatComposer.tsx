import type { KeyboardEvent } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldTextarea } from "seed-design/ui/text-field";

export const MESSAGE_MAX_LENGTH = 200;

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  sending: boolean;
  /** 429 등으로 잠시 전송을 막아야 할 때 남은 초 */
  lockedSeconds: number;
  errorMessage?: string;
};

export function ChatComposer({ value, onChange, onSubmit, sending, lockedSeconds, errorMessage }: Props) {
  const canSend = value.trim().length > 0 && !sending && lockedSeconds === 0;

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (canSend) onSubmit();
  };

  return (
    <form
      className="composer"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) onSubmit();
      }}
    >
      <TextField
        value={value}
        onValueChange={({ value: next }) => onChange(next)}
        maxGraphemeCount={MESSAGE_MAX_LENGTH}
        hideCharacterCount={false}
        invalid={!!errorMessage}
        errorMessage={errorMessage}
      >
        <TextFieldTextarea aria-label="메시지" placeholder="메시지를 입력해 주세요" onKeyDown={handleKeyDown} />
      </TextField>
      <div className="composer-actions">
        <span>Enter로 전송 · Shift+Enter로 줄바꿈</span>
        <ActionButton type="submit" variant="brandSolid" loading={sending} disabled={!canSend && !sending}>
          {lockedSeconds > 0 ? `${lockedSeconds}초 후 전송` : "전송"}
        </ActionButton>
      </div>
    </form>
  );
}
