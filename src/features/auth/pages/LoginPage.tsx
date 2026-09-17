import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { Callout } from "seed-design/ui/callout";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { isApiError, type ApiError } from "../../../shared/api/errors";
import { useAuth } from "../../../shared/auth/AuthProvider";
import { roleHome } from "../../../shared/auth/roleHome";
import { useRetryCountdown } from "../../../shared/ui/useRetryCountdown";

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const signupComplete = (location.state as { signupComplete?: boolean; email?: string } | null)?.signupComplete ?? false;
  const signupEmail = (location.state as { signupComplete?: boolean; email?: string } | null)?.email ?? "";
  const [email, setEmail] = useState(signupComplete ? signupEmail : "");
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
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <span className="brand-mark brand-mark--large">집</span>
          <h1>건물 생활을 더 가깝고 편하게</h1>
          <p>입주부터 문의, 민원 처리까지 집사이에서 연결하세요.</p>
        </div>
      </div>
      <main className="auth-form">
        <Link className="brand brand--mobile" to="/auth/login"><span className="brand-mark">집</span><span>집사이</span></Link>
        <p className="eyebrow">다시 만나서 반가워요</p>
        <h1>로그인</h1>
        <p>건물 생활을 이어서 관리해 보세요.</p>
        {signupComplete && <Callout tone="positive" description="회원가입이 완료됐어요. 가입한 이메일로 로그인해 주세요." />}
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
      </main>
    </div>
  );
}

function loginErrorMessage(error: ApiError, remainingSeconds: number) {
  if (error.status === 401) return "이메일 또는 비밀번호가 일치하지 않습니다.";
  if (error.status === 429) return `요청이 너무 많아요. ${remainingSeconds}초 후 다시 시도해 주세요.`;
  if (error.status === 400) return "이메일과 비밀번호를 입력해 주세요.";
  return "로그인하지 못했어요. 잠시 후 다시 시도해 주세요.";
}
