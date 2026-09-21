import {
  IconDocumentLine,
  IconMagnifyingglassLine,
  IconPlusLine,
} from '@karrotmarket/react-monochrome-icon';
import { Badge, PrefixIcon } from '@seed-design/react';
import { Link } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import { TextField, TextFieldInput } from 'seed-design/ui/text-field';
import { documents } from '@/entities/document';
import { PageTitle, StateBoundary } from '@/shared/ui';

export function DocumentsPage() {
  const state = documents.length > 0 ? 'default' : 'empty';
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
            />
          </TextField>
          <Badge tone="informative" variant="weak">
            등록 문서 {documents.length}개
          </Badge>
        </div>
        <StateBoundary state={state} emptyTitle="등록된 운영규칙이 없어요">
          <div className="document-grid">
            {documents.map((doc) => (
              <article className="document-card" key={doc.id}>
                <span className="document-icon">
                  <IconDocumentLine />
                </span>
                <div>
                  <h2>{doc.title}</h2>
                  <p>
                    버전 {doc.version} · {doc.size}
                  </p>
                  <small>수정 {doc.updatedAt}</small>
                </div>
                <div className="button-row">
                  <ActionButton variant="neutralOutline">
                    상세 보기
                  </ActionButton>
                  <ActionButton variant="ghost">수정</ActionButton>
                </div>
              </article>
            ))}
          </div>
        </StateBoundary>
      </section>
    </>
  );
}
