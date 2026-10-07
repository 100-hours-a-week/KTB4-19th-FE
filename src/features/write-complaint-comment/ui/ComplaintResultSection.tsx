import { useState } from 'react';
import { ActionButton } from 'seed-design/ui/action-button';
import { TextField, TextFieldTextarea } from 'seed-design/ui/text-field';
import {
  canChangeComplaintStatus,
  useDeleteManagerComplaintComment,
  useUpdateManagerComplaintComment,
  useUpdateManagerComplaintStatus,
  type ComplaintStatus,
  type ComplaintType,
} from '@/entities/complaint';
import {
  commentLabel,
  commentMaxLength,
  normalizeComment,
} from '../lib/commentRules.mjs';

type Props = {
  complaintId: number;
  complaintType: ComplaintType | null;
  statusCode: ComplaintStatus;
  comment: string | null;
};

export function ComplaintResultSection(props: Props) {
  if (props.statusCode === 'DONE') return <DoneResult {...props} />;
  return <CompleteForm {...props} />;
}

function CompleteForm({ complaintId, complaintType, statusCode }: Props) {
  const [text, setText] = useState('');
  const updateStatus = useUpdateManagerComplaintStatus();
  const updateComment = useUpdateManagerComplaintComment();
  const label = commentLabel(complaintType);
  const comment = normalizeComment(text);
  const completing = updateStatus.isPending || updateComment.isPending;

  if (!canChangeComplaintStatus(statusCode, 'DONE')) {
    return (
      <section className="complaint-result">
        <h2>처리 결과</h2>
        <p className="result-hint">
          처리중으로 바꾸면 {label}을 남기고 완료할 수 있어요.
        </p>
      </section>
    );
  }

  const complete = () => {
    updateStatus.mutate(
      { complaintId, statusCode: 'DONE' },
      {
        onSuccess: () => {
          if (comment) updateComment.mutate({ complaintId, comment });
        },
      },
    );
  };

  return (
    <section className="complaint-result">
      <h2>처리 결과</h2>
      <TextField
        label={`${label} (선택)`}
        value={text}
        onValueChange={({ slicedValue }) => setText(slicedValue)}
        maxGraphemeCount={commentMaxLength}
        hideCharacterCount={false}
        invalid={updateStatus.isError}
        errorMessage={
          updateStatus.isError
            ? '완료하지 못했어요. 다시 시도해 주세요.'
            : undefined
        }
      >
        <TextFieldTextarea placeholder={`입주민에게 보여 줄 ${label}`} />
      </TextField>
      <ActionButton
        variant="brandSolid"
        loading={completing}
        onClick={complete}
      >
        {comment ? `${label} 남기고 완료` : `${label} 없이 완료`}
      </ActionButton>
    </section>
  );
}

function DoneResult({ complaintId, complaintType, comment }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const updateComment = useUpdateManagerComplaintComment();
  const deleteComment = useDeleteManagerComplaintComment();
  const label = commentLabel(complaintType);
  const normalized = normalizeComment(text);

  const startEditing = () => {
    setText(comment ?? '');
    updateComment.reset();
    setEditing(true);
  };

  const save = () => {
    if (!normalized) return;
    updateComment.mutate(
      { complaintId, comment: normalized },
      { onSuccess: () => setEditing(false) },
    );
  };

  if (editing) {
    return (
      <section className="complaint-result">
        <h2>{label}</h2>
        <TextField
          value={text}
          onValueChange={({ slicedValue }) => setText(slicedValue)}
          maxGraphemeCount={commentMaxLength}
          hideCharacterCount={false}
          invalid={updateComment.isError}
          errorMessage={
            updateComment.isError
              ? '저장하지 못했어요. 다시 시도해 주세요.'
              : undefined
          }
        >
          <TextFieldTextarea aria-label={label} />
        </TextField>
        <div className="button-row">
          <ActionButton
            variant="brandSolid"
            loading={updateComment.isPending}
            disabled={!normalized}
            onClick={save}
          >
            저장
          </ActionButton>
          <ActionButton
            variant="neutralOutline"
            disabled={updateComment.isPending}
            onClick={() => setEditing(false)}
          >
            취소
          </ActionButton>
        </div>
      </section>
    );
  }

  return (
    <section className="complaint-result">
      <h2>{label}</h2>
      {comment ? (
        <p className="result-box">{comment}</p>
      ) : (
        <p className="result-hint">아직 남긴 {label}이 없어요.</p>
      )}
      {deleteComment.isError && (
        <p className="summary-error" role="alert">
          삭제하지 못했어요. 다시 시도해 주세요.
        </p>
      )}
      <div className="button-row">
        <ActionButton
          variant="neutralOutline"
          size="small"
          disabled={deleteComment.isPending}
          onClick={startEditing}
        >
          {comment ? '수정' : '작성하기'}
        </ActionButton>
        {comment && (
          <ActionButton
            variant="neutralWeak"
            size="small"
            loading={deleteComment.isPending}
            onClick={() => deleteComment.mutate(complaintId)}
          >
            삭제
          </ActionButton>
        )}
      </div>
    </section>
  );
}
