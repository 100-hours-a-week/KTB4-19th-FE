import { IconDocumentLine } from '@karrotmarket/react-monochrome-icon';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import { TextField, TextFieldInput } from 'seed-design/ui/text-field';
import { fileApi, type RuleDocumentResponse } from '@/entities/file';
import { PageTitle, StateBoundary } from '@/shared/ui';

export function DocumentDetailPage() {
  const { documentId } = useParams();
  const [document, setDocument] = useState<RuleDocumentResponse | null>(null);
  const [title, setTitle] = useState('');
  const [editing, setEditing] = useState(false);
  const [state, setState] = useState<'loading' | 'default' | 'error'>('loading');

  useEffect(() => {
    if (!documentId) return;
    void fileApi.getDocument(Number(documentId)).then((found) => {
      setDocument(found); setTitle(found.title); setState('default');
    }).catch(() => setState('error'));
  }, [documentId]);

  const save = async () => {
    if (!document || !title.trim()) return;
    const updated = await fileApi.updateDocument(document.documentId, title.trim());
    setDocument(updated); setEditing(false);
  };
  const isImage = /\.(jpe?g|png)$/i.test(document?.originalName ?? '');

  return <>
    <PageTitle eyebrow="운영규칙 문서" title={editing ? '문서 수정' : '문서 상세'} description="등록된 건물 운영 문서를 확인합니다." />
    <section className="panel document-detail-card">
      <StateBoundary state={state} emptyTitle="문서를 찾을 수 없어요">
        {document && <>
          {!editing && <span className="document-icon"><IconDocumentLine /></span>}
          <TextField label="문서 제목" showRequiredIndicator={false}><TextFieldInput value={title} disabled={!editing} onChange={(event) => setTitle(event.target.value)} /></TextField>
          <div className="document-detail-meta"><span>버전 {document.version}</span><span>첨부파일 {document.attachmentId}</span><span>수정 {new Date(document.updatedAt).toLocaleDateString('ko-KR')}</span></div>
          {document.fileUrl && <div className="document-preview">
            {isImage ? <img src={document.fileUrl} alt={document.title} className="document-preview__image" /> : <iframe
              title={`${document.title} 미리보기`}
              src={document.fileUrl}
              className="document-preview__frame"
            />}
          </div>}
          <div className="button-row form-actions">
            <Link to="/manager/documents"><ActionButton variant="neutralOutline">목록</ActionButton></Link>
            {document.fileUrl && <a href={document.fileUrl} target="_blank" rel="noreferrer"><ActionButton variant="neutralOutline">새 탭에서 열기</ActionButton></a>}
            {editing ? <ActionButton variant="brandSolid" onClick={() => void save()}>저장</ActionButton> : <ActionButton variant="neutralOutline" onClick={() => setEditing(true)}>수정</ActionButton>}
          </div>
        </>}
      </StateBoundary>
    </section>
  </>;
}
