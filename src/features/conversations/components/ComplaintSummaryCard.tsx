import { IconCheckmarkCircleFill } from "@karrotmarket/react-monochrome-icon";
import { useState, type FormEvent } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import type { ApiError } from "../../../shared/api/errors";
import { InfoRow } from "../../../shared/ui/InfoRow";
import type { SummaryCard } from "../model/types";

export type ComplaintDraft = {
  location: string | null;
  occurredTime: string | null;
  symptom: string | null;
};

type Props = {
  summaryCard: SummaryCard;
  /** 접수 버튼 노출 여부. 가장 최근 요약 카드이고 대화가 진행 중일 때만 true */
  actionable: boolean;
  submitting: boolean;
  error: ApiError | null;
  onSubmit: (draft: ComplaintDraft) => void;
};

const LIMITS = { location: 50, occurredTime: 50, symptom: 100 } as const;

export function ComplaintSummaryCard({ summaryCard, actionable, submitting, error, onSubmit }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ComplaintDraft>({
    location: summaryCard.location,
    occurredTime: summaryCard.occurredTime,
    symptom: summaryCard.symptom,
  });

  const saveEdit = (event: FormEvent) => {
    event.preventDefault();
    setEditing(false);
  };

  if (editing) {
    return (
      <form className="summary-card summary-card--editing" onSubmit={saveEdit}>
        <div className="summary-title"><strong>접수 내용 수정</strong></div>
        <DraftField label="위치" field="location" draft={draft} setDraft={setDraft} />
        <DraftField label="시점" field="occurredTime" draft={draft} setDraft={setDraft} />
        <DraftField label="증상" field="symptom" draft={draft} setDraft={setDraft} />
        <div className="button-row">
          <ActionButton type="submit" variant="brandSolid">수정 완료</ActionButton>
          <ActionButton type="button" variant="neutralOutline" onClick={() => setEditing(false)}>닫기</ActionButton>
        </div>
      </form>
    );
  }

  return (
    <div className="summary-card">
      <div className="summary-title"><IconCheckmarkCircleFill /><strong>민원 접수 내용</strong></div>
      <InfoRow label="위치" value={<DraftValue value={draft.location} />} />
      <InfoRow label="시점" value={<DraftValue value={draft.occurredTime} />} />
      <InfoRow label="증상" value={<DraftValue value={draft.symptom} />} />
      <InfoRow label="사진" value={`${summaryCard.attachmentCount}장`} />
      {error && <p className="summary-error" role="alert">{complaintErrorMessage(error)}</p>}
      {actionable && (
        <div className="button-row">
          <ActionButton variant="brandSolid" loading={submitting} onClick={() => onSubmit(draft)}>이대로 접수</ActionButton>
          <ActionButton variant="neutralOutline" disabled={submitting} onClick={() => setEditing(true)}>내용 수정</ActionButton>
        </div>
      )}
    </div>
  );
}

function DraftValue({ value }: { value: string | null }) {
  return value ?? <span className="summary-unknown">미상</span>;
}

function DraftField({ label, field, draft, setDraft }: {
  label: string;
  field: keyof ComplaintDraft;
  draft: ComplaintDraft;
  setDraft: (draft: ComplaintDraft) => void;
}) {
  return (
    <TextField
      label={label}
      value={draft[field] ?? ""}
      onValueChange={({ value }) => setDraft({ ...draft, [field]: value.trim() === "" ? null : value })}
      maxGraphemeCount={LIMITS[field]}
    >
      <TextFieldInput />
    </TextField>
  );
}

function complaintErrorMessage(error: ApiError) {
  if (error.status === 422) return error.violations[0]?.reason ?? "입력값을 확인해 주세요.";
  if (error.status === 429) return "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.";
  if (error.isServerError) return "접수하지 못했어요. 다시 시도해 주세요.";
  return error.message;
}
