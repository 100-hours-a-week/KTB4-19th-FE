// 서버(PDFBox)와 같은 기준으로, 열람 비밀번호·권한 제한 여부와 관계없이 암호화된 PDF를 모두 막는다.
// 암호화된 PDF는 trailer에 /Encrypt 사전을 가지므로 업로드 전에 이 표시만 빠르게 확인한다.
export const ENCRYPTED_PDF_MESSAGE =
  '비밀번호가 설정된 PDF는 등록할 수 없어요. 비밀번호를 해제한 뒤 다시 올려주세요.';

const ENCRYPT_MARKER = '/Encrypt';

export function isPdfFile(file) {
  return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
}

export async function isEncryptedPdf(file) {
  if (!isPdfFile(file)) return false;
  const bytes = new Uint8Array(await file.arrayBuffer());
  return new TextDecoder('latin1').decode(bytes).includes(ENCRYPT_MARKER);
}
