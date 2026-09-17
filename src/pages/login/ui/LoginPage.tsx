import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { Callout } from "seed-design/ui/callout";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { roleHome, useAuth } from "@/entities/session";
import { isApiError, type ApiError } from "@/shared/api";
import { useRetryCountdown } from "@/shared/lib";
import { AuthLayout } from "@/widgets/auth-layout";

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const countdown = useRetryCountdown();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending || countdown.remaining > 0) return;
    setPending(true);
    setError(null);
    try {
      const user = await auth.login({ email, password });
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && user.userRole !== "NONE" ? from : roleHome(user.userRole), { replace: true });
    } catch (caught) {
      if (!isApiError(caught)) throw caught;
      setError(caught);
      if (caught.status === 429 && caught.retryAfterSeconds) countdown.start(caught.retryAfterSeconds);
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout>
      <p className="eyebrow">다시 만나서 반가워요</p>
      <h1>로그인</h1>
      <p>건물 생활을 이어서 관리해 보세요.</p>
      <form className="form-stack" onSubmit={submit} noValidate>
        <TextField
          label="이메일"
          value={email}
          onValueChange={({ value }) => setEmail(value)}
          invalid={!!error?.violationFor("email")}
          errorMessage={error?.violationFor("email")}
        >
          <TextFieldInput type="email" autoComplete="email" placeholder="example@email.com" />
        </TextField>
        <TextField
          label="비밀번호"
          value={password}
          onValueChange={({ value }) => setPassword(value)}
          invalid={!!error?.violationFor("password")}
          errorMessage={error?.violationFor("password")}
        >
          <TextFieldInput type="password" autoComplete="current-password" />
        </TextField>
        {error && error.violations.length === 0 && (
          <Callout tone="critical" description={loginErrorMessage(error, countdown.remaining)} />
        )}
        <ActionButton type="submit" variant="brandSolid" loading={pending} disabled={countdown.remaining > 0}>
          {countdown.remaining > 0 ? `${countdown.remaining}초 후 다시 시도` : "로그인"}
        </ActionButton>
      </form>
      {import.meta.env.DEV && (
        <Callout
          className="dev-account-hint"
          tone="informative"
          title="로컬 더미 계정"
          description="resident@zipsai.com(302호 입주민) · manager@zipsai.com(관리자) / 비밀번호 Asdf!12345"
        />
      )}
      <p className="auth-footer">아직 계정이 없나요? <Link to="/auth/signup">회원가입</Link></p>
    </AuthLayout>
  );
}

function loginErrorMessage(error: ApiError, remainingSeconds: number) {
  if (error.status === 401) return "이메일 또는 비밀번호가 일치하지 않습니다.";
  if (error.status === 429) return `요청이 너무 많아요. ${remainingSeconds}초 후 다시 시도해 주세요.`;
  if (error.status === 400) return "이메일과 비밀번호를 입력해 주세요.";
  return "로그인하지 못했어요. 잠시 후 다시 시도해 주세요.";
}
