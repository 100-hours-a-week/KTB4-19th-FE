import { IconBuilding2Line, IconCheckmarkCircleFill } from "@karrotmarket/react-monochrome-icon";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { Callout } from "seed-design/ui/callout";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { buildingApi } from "@/entities/building";
import { isApiError } from "@/shared/api";
import { InfoRow, PageTitle } from "@/shared/ui";

export function BuildingRegisterPage() {
  const navigate = useNavigate();
  const [buildingName, setBuildingName] = useState("");
  const [roadAddress, setRoadAddress] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    if (!roadAddress.trim()) return setErrorMessage("건물 도로명 주소를 입력해 주세요.");
    setPending(true);
    setErrorMessage(null);
    try {
      const building = await buildingApi.register({ buildingName: buildingName.trim() || null, roadAddress: roadAddress.trim() });
      setSaved(true);
      navigate(`/manager/buildings/${building.buildingId}/rooms/bulk`);
    } catch (error) {
      setErrorMessage(buildingErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return <><PageTitle eyebrow="관리자 시작하기" title="관리할 건물을 등록해 주세요" description="건물 주소를 등록한 뒤 층별 호실을 한 번에 만들 수 있어요." /><div className="form-page-grid"><form className="panel form-panel" onSubmit={submit}><TextField label="건물명" description="선택 입력 · 20자 이하"><TextFieldInput value={buildingName} maxLength={20} onChange={(event) => setBuildingName(event.target.value)} placeholder="예: 집사이 타워" /></TextField><TextField label="도로명 주소" showRequiredIndicator required description="도로명 주소를 직접 입력해 주세요."><TextFieldInput value={roadAddress} maxLength={200} onChange={(event) => setRoadAddress(event.target.value)} placeholder="예: 서울 강남구 역삼동 123-4" /></TextField>{roadAddress.trim() && <div className="address-preview"><IconBuilding2Line /><div><strong>{buildingName.trim() || "건물"}</strong><p>{roadAddress.trim()}</p></div></div>}{saved && <div className="inline-success"><IconCheckmarkCircleFill />건물 정보가 저장됐어요.</div>}{errorMessage && <Callout tone="critical" description={errorMessage} />}<ActionButton type="submit" variant="brandSolid" loading={pending} disabled={pending}>{pending ? "등록 중" : "건물 등록"}</ActionButton></form><aside className="panel detail-aside"><h2>등록 후 할 수 있어요</h2><InfoRow label="1" value="호실 일괄 생성" /><InfoRow label="2" value="입주민 초대" /><InfoRow label="3" value="민원·운영규칙 관리" /></aside></div></>;
}

function buildingErrorMessage(error: unknown) {
  if (!isApiError(error)) return "건물을 등록하지 못했어요. 잠시 후 다시 시도해 주세요.";
  if (error.status === 401) return "로그인 정보가 만료됐어요. 다시 로그인해 주세요.";
  if (error.status === 403) return "관리자 권한이 필요한 기능이에요.";
  if (error.status === 409) return "이미 등록된 건물이 있어요. 기존 건물 정보를 확인해 주세요.";
  if (error.status === 400 || error.status === 422) return "건물명과 도로명 주소를 확인해 주세요.";
  return error.message || "건물을 등록하지 못했어요. 잠시 후 다시 시도해 주세요.";
}
