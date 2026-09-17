import { IconChevronRightLine } from "@karrotmarket/react-monochrome-icon";
import { Link, useNavigate } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { useAuth } from "@/entities/session";
import type { RouteRole } from "@/shared/config";
import { InfoRow, PageTitle } from "@/shared/ui";

export function MyPage({ role }: { role: RouteRole }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const logout = async () => {
    await auth.logout();
    navigate("/auth/login", { replace: true });
  };
  return <><PageTitle eyebrow="내 정보" title="마이페이지" description="프로필과 연결된 건물 정보를 확인하세요." /><div className="detail-grid"><section className="panel profile-panel"><div className="profile-head"><span className="avatar avatar--large">{role === "manager" ? "김" : "박"}</span><div><h2>{role === "manager" ? "김관리" : "박입주"}</h2><p>{role === "manager" ? "관리자" : "입주민"}</p></div><ActionButton variant="neutralOutline">프로필 수정</ActionButton></div><InfoRow label="이메일" value={role === "manager" ? "manager@zips.ai" : "resident@zips.ai"} /><InfoRow label="연락처" value={role === "manager" ? "010-1234-5678" : "010-9876-5432"} /></section><aside className="panel detail-aside"><h2>{role === "manager" ? "관리 건물" : "내 거주지"}</h2><InfoRow label="건물" value="A타워" /><InfoRow label={role === "manager" ? "주소" : "호실"} value={role === "manager" ? "서울 강남구 역삼동 123-4" : "302호"} />{role === "resident" && <InfoRow label="관리인" value="김관리 · 010-1234-5678" />}<div className="settings-links"><Link to="/terms/service">서비스 이용약관 <IconChevronRightLine /></Link><Link to="/terms/privacy">개인정보 처리방침 <IconChevronRightLine /></Link><ActionButton variant="ghost" color="fg.critical" onClick={logout}>로그아웃</ActionButton></div></aside></div></>;
}
