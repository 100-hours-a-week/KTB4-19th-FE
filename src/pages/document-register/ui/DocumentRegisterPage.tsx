import { IconCheckmarkCircleFill, IconDocumentLine, IconDocumentPlusLine } from "@karrotmarket/react-monochrome-icon";
import { Badge } from "@seed-design/react";
import heic2any from "heic2any";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { PageTitle } from "@/shared/ui";
import { fileApi } from "@/entities/file";

export function DocumentRegisterPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectFile = async (selectedFile: File | undefined) => {
    if (!selectedFile) return;
    setError(null);

    if (!/\.heic$/i.test(selectedFile.name) && selectedFile.type !== "image/heic") {
      setFile(selectedFile);
      return;
    }

    try {
      const converted = await heic2any({ blob: selectedFile, toType: "image/jpeg", quality: 0.9 });
      const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
      const jpegName = selectedFile.name.replace(/\.heic$/i, ".jpg");
      setFile(new File([jpegBlob], jpegName, { type: "image/jpeg", lastModified: selectedFile.lastModified }));
    } catch {
      setFile(null);
      setError("HEIC 파일을 JPG로 변환하지 못했습니다. 다른 파일을 선택해 주세요.");
    }
  };

  const upload = async () => {
    if (!file) return setError("업로드할 파일을 선택해 주세요.");
    if (!title.trim()) return setError("문서 제목을 입력해 주세요.");
    setUploading(true);
    setError(null);
    try {
      const uploadInfo = await fileApi.createUpload(file, "RULE_DOCUMENT");
      await fileApi.uploadToS3(uploadInfo, file);
      await fileApi.complete(uploadInfo.attachmentId);
      await fileApi.createDocument(uploadInfo.attachmentId, title.trim());
      setSaved(true);
      navigate('/manager/documents');
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "문서 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  return <><PageTitle eyebrow="운영규칙 문서" title="새 문서 등록" description="PDF 파일과 제목을 등록해 AI 답변의 기준을 추가하세요." /><div className="form-page-grid"><section className="panel form-panel"><TextField label="문서 제목" showRequiredIndicator required maxGraphemeCount={20}><TextFieldInput value={title} onChange={(event) => setTitle(event.target.value)} placeholder="문서 제목을 입력해 주세요" /></TextField><div className="upload-field"><span className="document-icon"><IconDocumentPlusLine /></span><div><strong>{file ? file.name : "PDF 파일을 선택해 주세요"}</strong><p>최대 10MB · PDF, JPG, PNG (HEIC는 JPG로 변환)</p></div><label className="button-like"><ActionButton variant="neutralOutline" asChild><span>파일 선택</span></ActionButton><input hidden type="file" accept=".pdf,.jpg,.jpeg,.png,.heic,application/pdf,image/jpeg,image/png,image/heic" onChange={(event) => void selectFile(event.target.files?.[0])} /></label></div>{file && <div className="upload-file"><IconDocumentLine /><div><strong>{file.name}</strong><p>{(file.size / 1024 / 1024).toFixed(2)} MB · 업로드 대기</p></div></div>}{error && <div className="inline-error">{error}</div>}{saved && <div className="inline-success"><IconCheckmarkCircleFill />파일 업로드가 완료됐어요.</div>}<div className="button-row form-actions"><Link to="/manager/documents"><ActionButton variant="neutralOutline">취소</ActionButton></Link><ActionButton variant="brandSolid" disabled={uploading} onClick={upload}>{uploading ? "업로드 중..." : "문서 등록"}</ActionButton></div></section><aside className="panel detail-aside"><h2>문서 활용 안내</h2><p className="aside-copy">등록한 문서는 입주민의 생활 문의에 답변할 때 우선 참고돼요.</p></aside></div></>;
}
