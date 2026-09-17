import { IconArrowLeftLine } from "@karrotmarket/react-monochrome-icon";
import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { Callout } from "seed-design/ui/callout";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { authApi, buildManagerProfileRequest, useAuth } from "@/entities/session";
import { isApiError } from "@/shared/api";
import { FullPageLoading, Logo } from "@/shared/ui";

export function ManagerProfilePage() {
  const auth = useAuth();
  const userId = auth.status === "authenticated" ? auth.user.userId : null;
  const currentUserName = auth.status === "authenticated" ? auth.user.userName : null;
  const currentPhone = auth.status === "authenticated" ? auth.user.phone : null;
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [marketingAgreed, setMarketingAgreed] = useState(false);
  const [pending, setPending] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    let active = true;
    authApi.me().then((user) => {
      if (!active) return;
      setName(user.userName ?? currentUserName ?? "");
      setPhone(user.phone ?? currentPhone ?? "");
      setMarketingAgreed(user.agreements?.find((item) => item.termsType === "MARKETING")?.isAgreed ?? false);
    }).catch(() => {
      if (active) {
        setName(currentUserName ?? "");
        setPhone(currentPhone ?? "");
      }
    }).finally(() => {
      if (active) setLoadingProfile(false);
    });
    return () => { active = false; };
  }, [auth.status, userId, currentUserName, currentPhone]);

  if (auth.status === "loading" || loadingProfile) return <FullPageLoading />;
  if (auth.status === "anonymous") return <Navigate to="/auth/login" replace />;
  if (auth.user.userRole !== "MANAGER") return <Navigate to={auth.user.userRole === "RESIDENT" ? "/resident" : "/auth/role"} replace />;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    const digits = phone.replace(/\D/g, "");
    if (!name.trim() || name.trim().length > 7) return setErrorMessage("이름을 1~7자로 입력해 주세요.");
    if (!/^\d{10,11}$/.test(digits)) return setErrorMessage("전화번호를 숫자 10~11자리로 입력해 주세요.");
    setPending(true);
    setErrorMessage(null);
    try {
      await auth.updateManagerProfile(buildManagerProfileRequest({ userName: name, phone, marketingAgreed }));
      navigate("/manager/building/new", { replace: true });
    } catch (error) {
      setErrorMessage(profileErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return <main className="focused-flow">
    <Link className="focused-brand" to="/manager" aria-label="집사이"><Logo /></Link>
    <div className="flow-progress" aria-label="관리자 가입 진행 단계"><span className="active" /><span /><span /></div>
    <form className="flow-card manager-profile-card" onSubmit={submit}>
      <button className="flow-back" type="button" onClick={() => navigate(-1)}><IconArrowLeftLine /> 관리자 가입</button>
      <div><p className="eyebrow">관리자 가입 · 프로필</p><h1>프로필을 확인해 주세요</h1><p>건물 관리를 위해 이름과 연락처를 확인해요.</p></div>
      <TextField label="이름" showRequiredIndicator required description="최대 7자까지 입력할 수 있어요.">
        <TextFieldInput value={name} maxLength={7} onChange={(event) => setName(event.target.value)} autoComplete="name" />
      </TextField>
      <TextField label="전화번호" showRequiredIndicator required description="숫자 10~11자리를 입력해 주세요.">
        <TextFieldInput value={phone} maxLength={13} onChange={(event) => setPhone(event.target.value)} inputMode="numeric" autoComplete="tel" placeholder="010-1234-5678" />
      </TextField>
      <div className="manager-terms">
        <label><input type="checkbox" checked readOnly /> <Link to="/terms/service" target="_blank">(필수) 서비스 이용약관 동의</Link></label>
        <label><input type="checkbox" checked readOnly /> <Link to="/terms/privacy" target="_blank">(필수) 개인정보 수집·이용 동의</Link></label>
        <label><input type="checkbox" checked={marketingAgreed} onChange={(event) => setMarketingAgreed(event.target.checked)} /> (선택) 마케팅 정보 수신</label>
      </div>
      {errorMessage && <Callout tone="critical" description={errorMessage} />}
      <ActionButton type="submit" variant="brandSolid" loading={pending} disabled={pending}>{pending ? "저장 중" : "다음"}</ActionButton>
    </form>
  </main>;
}

function profileErrorMessage(error: unknown) {
  if (!isApiError(error)) return "프로필을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.";
  if (error.status === 401) return "로그인 정보가 만료됐어요. 다시 로그인해 주세요.";
  if (error.status === 403) return "관리자 권한이 필요한 화면이에요.";
  if (error.status === 409) return "필수 약관 동의 상태를 확인해 주세요.";
  if (error.status === 400 || error.status === 422) return "이름과 전화번호를 확인해 주세요.";
  return error.message || "프로필을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.";
}
