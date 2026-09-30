import {
  IconChevronRightLine,
  IconDocumentLine,
  IconMagnifyingglassLine,
  IconPlusLine,
} from '@karrotmarket/react-monochrome-icon';
import { Badge, PrefixIcon } from '@seed-design/react';
import { Link } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import { TextField, TextFieldInput } from 'seed-design/ui/text-field';
import { useManagerBuilding } from '@/entities/building';
import { fileApi, type RuleDocumentResponse } from '@/entities/file';
import { formatListTime } from '@/shared/lib';
import { PageTitle, StateBoundary } from '@/shared/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function DocumentsPage() {
  const [documents, setDocuments] = useState<RuleDocumentResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [state, setState] = useState<'loading' | 'default' | 'empty' | 'error'>('loading');
  const buildingName = useManagerBuilding().data?.buildingName;
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

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadDocuments(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDocuments]);

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
          <div className="list-stack">
            {filteredDocuments.map((doc) => (
              <Link
                className="list-row"
                to={`/manager/documents/${doc.documentId}`}
                key={doc.documentId}
              >
                <div className="list-leading">
                  <span className="document-icon">
                    <IconDocumentLine />
                  </span>
                  <div>
                    <div className="row-title">
                      <strong>{doc.title}</strong>
                    </div>
                    <p>
                      {[buildingName, `${formatListTime(doc.updatedAt)} 수정`, `버전 ${doc.version}`]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                </div>
                <IconChevronRightLine />
              </Link>
            ))}
          </div>
        </StateBoundary>
      </section>
    </>
  );
}
