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
    void fileApi.listDocuments().then((items) => {
      const found = items.find((item) => String(item.documentId) === documentId);
      if (!found) { setState('error'); return; }
      setDocument(found); setTitle(found.title); setState('default');
    }).catch(() => setState('error'));
  }, [documentId]);

  const save = async () => {
    if (!document || !title.trim()) return;
    const updated = await fileApi.updateDocument(document.documentId, title.trim());
    setDocument(updated); setEditing(false);
  };

  return <>
    <PageTitle eyebrow="운영규칙 문서" title={editing ? '문서 수정' : '문서 상세'} description="등록된 건물 운영 문서를 확인합니다." />
    <section className="panel form-panel">
      <StateBoundary state={state} emptyTitle="문서를 찾을 수 없어요">
        {document && <>
          <TextField label="문서 제목"><TextFieldInput value={title} disabled={!editing} onChange={(event) => setTitle(event.target.value)} /></TextField>
          <p>버전 {document.version} · 첨부파일 {document.attachmentId}</p>
          <p>수정 {new Date(document.updatedAt).toLocaleDateString('ko-KR')}</p>
          <div className="button-row form-actions">
            <Link to="/manager/documents"><ActionButton variant="neutralOutline">목록</ActionButton></Link>
            {editing ? <ActionButton variant="brandSolid" onClick={() => void save()}>저장</ActionButton> : <ActionButton variant="neutralOutline" onClick={() => setEditing(true)}>수정</ActionButton>}
          </div>
        </>}
      </StateBoundary>
    </section>
  </>;
}
