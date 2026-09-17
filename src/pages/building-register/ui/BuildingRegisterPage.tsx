import { IconBuilding2Line, IconCheckmarkCircleFill } from "@karrotmarket/react-monochrome-icon";
import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { InfoRow, PageTitle } from "@/shared/ui";

export function BuildingRegisterPage() {
  const [saved, setSaved] = useState(false);
  return <><PageTitle eyebrow="관리자 시작하기" title="관리할 건물을 등록해 주세요" description="건물은 관리자 계정당 한 곳만 등록할 수 있어요." /><div className="form-page-grid"><section className="panel form-panel"><TextField label="건물명" description="선택 입력 · 20자 이하"><TextFieldInput defaultValue="A타워" /></TextField><TextField label="도로명 주소" showRequiredIndicator required><TextFieldInput defaultValue="서울 강남구 역삼동 123-4" /></TextField><div className="address-preview"><IconBuilding2Line /><div><strong>A타워</strong><p>서울 강남구 역삼동 123-4</p></div></div>{saved && <div className="inline-success"><IconCheckmarkCircleFill />건물 정보가 mock 상태에 저장됐어요.</div>}<ActionButton variant="brandSolid" onClick={() => setSaved(true)}>건물 등록</ActionButton></section><aside className="panel detail-aside"><h2>등록 후 할 수 있어요</h2><InfoRow label="1" value="호실 일괄 생성" /><InfoRow label="2" value="입주민 초대" /><InfoRow label="3" value="민원·운영규칙 관리" /></aside></div></>;
}
