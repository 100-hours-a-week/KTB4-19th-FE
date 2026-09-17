import { Link, useParams } from "react-router-dom";
import { Logo } from "@/shared/ui";

export function TermsPage() {
  const { termsType } = useParams();
  const isPrivacy = termsType === "privacy";
  return <div className="terms-page"><Link className="brand" to="/auth/signup" aria-label="집사이"><Logo /></Link><article><p className="eyebrow">공통 정책</p><h1>{isPrivacy ? "개인정보 처리방침" : "서비스 이용약관"}</h1><p className="terms-date">시행일 2026. 09. 01</p><h2>제1조 목적</h2><p>{isPrivacy ? "본 방침은 집사이가 처리하는 개인정보의 항목과 이용 목적을 안내합니다." : "본 약관은 집사이가 제공하는 건물 관리 서비스의 이용 조건과 절차를 정합니다."}</p><h2>제2조 서비스 이용</h2><p>사용자는 관리자 또는 입주민 역할에 따라 제공되는 기능을 이용할 수 있습니다. 상세 문구는 실제 정책 확정 단계에서 교체합니다.</p><h2>제3조 개인정보 보호</h2><p>서비스는 기능 제공에 필요한 범위에서 개인정보를 처리하며 관련 법령을 준수합니다.</p></article></div>;
}
