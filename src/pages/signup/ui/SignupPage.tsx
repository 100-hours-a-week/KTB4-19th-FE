import { useNavigate } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { Checkbox } from "seed-design/ui/checkbox";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { AuthLayout } from "@/widgets/auth-layout";

export function SignupPage() {
  const navigate = useNavigate();
  return <AuthLayout><p className="eyebrow">집사이 시작하기</p><h1>회원가입</h1><p>필수 정보만 입력하면 바로 시작할 수 있어요.</p><div className="form-stack"><TextField label="이메일" suffix={<ActionButton variant="ghost" size="small">중복 확인</ActionButton>}><TextFieldInput type="email" placeholder="example@email.com" /></TextField><TextField label="비밀번호" description="영문, 숫자, 특수문자를 포함해 8자 이상"><TextFieldInput type="password" /></TextField><TextField label="이름"><TextFieldInput /></TextField><TextField label="연락처"><TextFieldInput placeholder="010-0000-0000" /></TextField><Checkbox inputProps={{ defaultChecked: true }} label="서비스 이용약관과 개인정보 처리방침에 동의합니다." /><ActionButton variant="brandSolid" onClick={() => navigate("/auth/role")}>가입하기</ActionButton></div></AuthLayout>;
}
