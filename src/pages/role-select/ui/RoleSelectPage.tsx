import { IconBuilding2Line, IconPersonLine } from "@karrotmarket/react-monochrome-icon";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { Callout } from "seed-design/ui/callout";
import { RadioGroup, RadioGroupItem } from "seed-design/ui/radio-group";
import { useAuth } from "@/entities/session";
import { isApiError } from "@/shared/api";
import { FullPageLoading } from "@/shared/ui";
import type { RouteRole } from "@/shared/config";
import { AuthLayout } from "@/widgets/auth-layout";

export function RoleSelectPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RouteRole>("resident");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (auth.status === "loading") return <FullPageLoading />;
  if (auth.status === "anonymous") return <Navigate to="/auth/login" replace />;
  if (auth.user.userRole !== "NONE") {
    return <Navigate to={auth.user.userRole === "MANAGER" ? "/manager/building/new" : "/resident"} replace />;
  }

  const submit = async () => {
    if (pending) return;
    setPending(true);
    setErrorMessage(null);
    try {
      navigate(selectedRole === "manager" ? "/manager/building/new" : "/resident/connect", { replace: true });
    } catch (error) {
      setErrorMessage(roleSelectionErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout>
      <p className="eyebrow">마지막 단계예요</p>
      <h1>어떻게 이용하시나요?</h1>
      <p>역할은 처음 한 번만 선택할 수 있어요.</p>
      <RadioGroup aria-label="사용자 역할" value={selectedRole} onValueChange={(value) => setSelectedRole(value as RouteRole)}>
        <div className="role-cards">
          <RadioGroupItem value="manager" label={<span className="role-card-content"><IconBuilding2Line /><strong>관리자</strong><span>건물과 호실, 민원을 관리해요</span></span>} />
          <RadioGroupItem value="resident" label={<span className="role-card-content"><IconPersonLine /><strong>입주민</strong><span>AI 문의와 민원 접수를 이용해요</span></span>} />
        </div>
      </RadioGroup>
      {errorMessage && <Callout tone="critical" description={errorMessage} />}
      <ActionButton variant="brandSolid" loading={pending} disabled={pending} onClick={submit}>
        {pending ? "저장 중" : "선택 완료"}
      </ActionButton>
    </AuthLayout>
  );
}

function roleSelectionErrorMessage(error: unknown) {
  if (!isApiError(error)) return "역할을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.";
  if (error.status === 409) return "역할은 최초 한 번만 설정할 수 있어요. 이미 역할이 설정된 계정인지 확인해 주세요.";
  if (error.status === 401) return "로그인 정보가 만료됐어요. 다시 로그인해 주세요.";
  if (error.status === 0) return error.message;
  if (error.status === 400 || error.status === 422) return "역할 선택 정보를 확인해 주세요.";
  return "역할을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.";
}
