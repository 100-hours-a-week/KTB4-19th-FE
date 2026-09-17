import { IconCheckmarkCircleFill, IconDocumentLine, IconDocumentPlusLine } from "@karrotmarket/react-monochrome-icon";
import { Badge } from "@seed-design/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { PageTitle } from "@/shared/ui";

export function DocumentRegisterPage() {
  const [saved, setSaved] = useState(false);
  return <><PageTitle eyebrow="운영규칙 문서" title="새 문서 등록" description="PDF 파일과 제목을 등록해 AI 답변의 기준을 추가하세요." /><div className="form-page-grid"><section className="panel form-panel"><TextField label="문서 제목" showRequiredIndicator required maxGraphemeCount={20}><TextFieldInput defaultValue="건물 운영 규칙(주차)" /></TextField><div className="upload-field"><span className="document-icon"><IconDocumentPlusLine /></span><div><strong>PDF 파일을 선택해 주세요</strong><p>최대 10MB · PDF만 가능</p></div><ActionButton variant="neutralOutline">파일 선택</ActionButton></div><div className="upload-file"><IconDocumentLine /><div><strong>운영규칙_주차.pdf</strong><p>2.4 MB · 업로드 완료</p></div><Badge tone="positive" variant="weak">완료</Badge></div>{saved && <div className="inline-success"><IconCheckmarkCircleFill />문서가 mock 목록에 등록됐어요.</div>}<div className="button-row form-actions"><Link to="/manager/documents"><ActionButton variant="neutralOutline">취소</ActionButton></Link><ActionButton variant="brandSolid" onClick={() => setSaved(true)}>문서 등록</ActionButton></div></section><aside className="panel detail-aside"><h2>문서 활용 안내</h2><p className="aside-copy">등록한 문서는 입주민의 생활 문의에 답변할 때 우선 참고돼요. 이 프로토타입에서는 실제 파일을 전송하지 않습니다.</p></aside></div></>;
}
