import { IconBuilding2Line, IconPersonLine } from "@karrotmarket/react-monochrome-icon";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { RadioGroup, RadioGroupItem } from "seed-design/ui/radio-group";
import type { RouteRole } from "@/shared/config";
import { AuthLayout } from "@/widgets/auth-layout";

export function RoleSelectPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RouteRole>("resident");
  return <AuthLayout><p className="eyebrow">마지막 단계예요</p><h1>어떻게 이용하시나요?</h1><p>역할은 처음 한 번만 선택할 수 있어요.</p><RadioGroup aria-label="사용자 역할" value={selectedRole} onValueChange={(value) => setSelectedRole(value as RouteRole)}><div className="role-cards"><RadioGroupItem value="manager" label={<span className="role-card-content"><IconBuilding2Line /><strong>관리자</strong><span>건물과 호실, 민원을 관리해요</span></span>} /><RadioGroupItem value="resident" label={<span className="role-card-content"><IconPersonLine /><strong>입주민</strong><span>AI 문의와 민원 접수를 이용해요</span></span>} /></div></RadioGroup><ActionButton variant="brandSolid" onClick={() => navigate(selectedRole === "manager" ? "/manager" : "/resident/connect")}>선택 완료</ActionButton></AuthLayout>;
}
