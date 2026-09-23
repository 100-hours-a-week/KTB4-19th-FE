import {
  IconDocumentLine,
  IconMagnifyingglassLine,
  IconPlusLine,
} from '@karrotmarket/react-monochrome-icon';
import { Badge, PrefixIcon } from '@seed-design/react';
import { Link } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import { TextField, TextFieldInput } from 'seed-design/ui/text-field';
import { fileApi, type RuleDocumentResponse } from '@/entities/file';
import { PageTitle, StateBoundary } from '@/shared/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function DocumentsPage() {
  const [documents, setDocuments] = useState<RuleDocumentResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState<'loading' | 'default' | 'empty' | 'error'>('loading');
  const loadDocuments = useCallback(async () => {
    setState('loading');
    try {
      const result = await fileApi.listDocuments();
      setDocuments(result);
      setState(result.length > 0 ? 'default' : 'empty');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => { void loadDocuments(); }, [loadDocuments]);

  const filteredDocuments = useMemo(
    () => documents.filter((document) => document.title.toLowerCase().includes(keyword.trim().toLowerCase())),
    [documents, keyword],
  );
  return (
    <>
      <PageTitle
        eyebrow="AI 답변의 기준"
        title="운영규칙 문서"
        description="건물의 생활 규칙을 등록하면 AI가 답변에 활용해요."
        action={
          <Link to="/manager/documents/new">
            <ActionButton variant="brandSolid">
              <PrefixIcon svg={<IconPlusLine />} />
              문서 등록
            </ActionButton>
          </Link>
        }
      />
      <section className="panel list-panel">
        <div className="list-tools">
          <TextField prefixIcon={<IconMagnifyingglassLine />}>
            <TextFieldInput
              aria-label="문서 검색"
              placeholder="문서 제목 검색"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </TextField>
          <Badge tone="informative" variant="weak">
            등록 문서 {documents.length}개
          </Badge>
        </div>
        <StateBoundary state={state} emptyTitle="등록된 운영규칙이 없어요" onRetry={() => void loadDocuments()}>
          <div className="document-grid">
            {filteredDocuments.map((doc) => (
              <article className="document-card" key={doc.documentId}>
                <span className="document-icon">
                  <IconDocumentLine />
                </span>
                <div>
                  <h2>{doc.title}</h2>
                  <p>
                    버전 {doc.version} · 첨부파일 {doc.attachmentId}
                  </p>
                  <small>수정 {new Date(doc.updatedAt).toLocaleDateString('ko-KR')}</small>
                </div>
                <div className="button-row">
                  <Link to={`/manager/documents/${doc.documentId}`}><ActionButton variant="neutralOutline">상세 보기</ActionButton></Link>
                </div>
              </article>
            ))}
          </div>
        </StateBoundary>
      </section>
    </>
  );
}
