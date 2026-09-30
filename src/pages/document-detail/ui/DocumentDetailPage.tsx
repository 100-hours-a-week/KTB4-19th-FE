import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import { TextField, TextFieldInput } from 'seed-design/ui/text-field';
import { useManagerBuilding } from '@/entities/building';
import { DOCUMENT_TITLE_MAX_LENGTH, fileApi, type RuleDocumentResponse } from '@/entities/file';
import { formatListTime } from '@/shared/lib';
import { InfoRow, PageTitle, StateBoundary } from '@/shared/ui';

export function DocumentDetailPage() {
  const { documentId } = useParams();
  const [document, setDocument] = useState<RuleDocumentResponse | null>(null);
  const [title, setTitle] = useState('');
  const [editing, setEditing] = useState(false);
  const [replacement, setReplacement] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<'loading' | 'default' | 'error'>('loading');
  const buildingName = useManagerBuilding().data?.buildingName;

  useEffect(() => {
    if (!documentId) return;
    void fileApi.getDocument(Number(documentId)).then((found) => {
      setDocument(found); setTitle(found.title); setState('default');
    }).catch(() => setState('error'));
  }, [documentId]);

  const save = async () => {
    if (!document || !title.trim()) return;
    setSaving(true);
    try {
      let attachmentId: number | undefined;
      if (replacement) {
        const upload = await fileApi.createUpload(replacement, 'RULE_DOCUMENT');
        await fileApi.uploadToS3(upload, replacement);
        await fileApi.complete(upload.attachmentId);
        attachmentId = upload.attachmentId;
      }
      const updated = await fileApi.updateDocument(document.documentId, title.trim(), attachmentId);
      setDocument(updated); setReplacement(null); setEditing(false);
    } finally { setSaving(false); }
  };
  const remove = async () => {
    if (!document || !window.confirm('이 문서를 삭제할까요?')) return;
    await fileApi.deleteDocument(document.documentId);
    window.location.href = '/manager/documents';
  };
  const isImage = /\.(jpe?g|png)$/i.test(document?.originalName ?? '');

  return <>
    <PageTitle eyebrow="운영규칙 문서" title={editing ? '문서 수정' : document?.title ?? '문서 상세'} description={document ? [buildingName, `${formatListTime(document.updatedAt)} 수정`].filter(Boolean).join(' · ') : undefined} />
    <StateBoundary state={state} emptyTitle="문서를 찾을 수 없어요">
      {document && <div className="detail-grid">
        <section className="panel document-detail-card">
          {editing && <TextField label="문서 제목" showRequiredIndicator={false} maxGraphemeCount={DOCUMENT_TITLE_MAX_LENGTH} value={title} onValueChange={({ slicedValue }) => setTitle(slicedValue)}><TextFieldInput /></TextField>}
          {replacement && <p>{replacement.name}으로 교체 예정</p>}
          {document.fileUrl && <div className="document-preview">
            {isImage ? <img src={document.fileUrl} alt={document.title} className="document-preview__image" /> : <iframe
              title={`${document.title} 미리보기`}
              src={document.fileUrl}
              className="document-preview__frame"
            />}
          </div>}
          <div className="button-row form-actions document-detail-actions">
            <Link to="/manager/documents"><ActionButton variant="neutralOutline">목록</ActionButton></Link>
            {document.fileUrl && <a href={document.fileUrl} target="_blank" rel="noreferrer"><ActionButton variant="neutralOutline">열기</ActionButton></a>}
            {editing ? <><label className="button-like"><ActionButton variant="neutralOutline" asChild><span>새 파일로 교체</span></ActionButton><input hidden type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setReplacement(event.target.files?.[0] ?? null)} /></label><ActionButton variant="brandSolid" disabled={saving} onClick={() => void save()}>{saving ? '저장 중...' : '저장'}</ActionButton></> : <><ActionButton variant="neutralOutline" onClick={() => setEditing(true)}>수정</ActionButton><ActionButton variant="neutralOutline" onClick={() => void remove()}>삭제</ActionButton></>}
          </div>
        </section>
        <aside className="panel detail-aside">
          <h2>문서 정보</h2>
          <InfoRow label="버전" value={document.version} />
          <InfoRow label="수정일" value={formatListTime(document.updatedAt)} />
        </aside>
      </div>}
    </StateBoundary>
  </>;
}
