import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import { Callout } from 'seed-design/ui/callout';
import { Checkbox } from 'seed-design/ui/checkbox';
import { TextField, TextFieldInput } from 'seed-design/ui/text-field';
import {
  authApi,
  buildSignupRequest,
  emailAvailabilityFeedback,
} from '@/entities/session';
import { useTerms } from '@/entities/terms';
import { isApiError, type ApiError } from '@/shared/api';
import { useRetryCountdown } from '@/shared/lib';

export function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedServiceTerms, setAcceptedServiceTerms] = useState(false);
  const [acceptedPrivacyTerms, setAcceptedPrivacyTerms] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailCheckError, setEmailCheckError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const emailCheckId = useRef(0);
  const countdown = useRetryCountdown();
  const termsQuery = useTerms();
  const terms = termsQuery.data?.terms ?? [];
  const serviceTitle =
    terms.find((item) => item.termsType === 'SERVICE')?.title ?? '약관';
  const privacyTitle =
    terms.find((item) => item.termsType === 'PRIVACY')?.title ?? '약관';

  const checkEmail = async () => {
    if (checkingEmail || pending || countdown.remaining > 0) return;
    if (!email.trim()) {
      setEmailAvailable(null);
      setEmailCheckError('이메일을 입력해 주세요.');
      return;
    }

    const requestId = ++emailCheckId.current;
    setCheckingEmail(true);
    setEmailAvailable(null);
    setEmailCheckError(null);
    try {
      const result = await authApi.checkEmailAvailability(email.trim());
      if (emailCheckId.current === requestId)
        setEmailAvailable(result.isAvailable);
    } catch (caught) {
      if (emailCheckId.current !== requestId) return;
      const message = isApiError(caught)
        ? (caught.violationFor('email') ??
          (caught.status === 429
            ? retryMessage(countdown.remaining)
            : caught.status === 0
              ? caught.message
              : '이메일을 확인하지 못했어요.'))
        : '이메일을 확인하지 못했어요.';
      setEmailCheckError(message);
      if (
        isApiError(caught) &&
        caught.status === 429 &&
        caught.retryAfterSeconds
      )
        countdown.start(caught.retryAfterSeconds);
    } finally {
      if (emailCheckId.current === requestId) setCheckingEmail(false);
    }
  };

  const updateEmail = (value: string) => {
    emailCheckId.current += 1;
    setEmail(value);
    setCheckingEmail(false);
    setEmailAvailable(null);
    setEmailCheckError(null);
    setError(null);
    setFormMessage(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || countdown.remaining > 0) return;
    setError(null);
    setFormMessage(null);

    if (emailAvailable !== true) {
      setFormMessage('이메일 중복 확인을 먼저 완료해 주세요.');
      return;
    }
    if (password !== passwordConfirm) {
      setFormMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    if (!acceptedServiceTerms || !acceptedPrivacyTerms) {
      setFormMessage('필수 약관에 모두 동의해 주세요.');
      return;
    }

    setPending(true);
    try {
      await authApi.signup(
        buildSignupRequest({
          email,
          password,
          passwordConfirm,
          userName,
          phone,
          acceptedRequiredTerms: acceptedServiceTerms && acceptedPrivacyTerms,
        }),
      );
      navigate('/auth/login', {
        replace: true,
        state: { signupComplete: true, email: email.trim() },
      });
    } catch (caught) {
      if (!isApiError(caught)) {
        setFormMessage(
          '회원가입 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',
        );
        return;
      }
      setError(caught);
      if (caught.status === 409 || caught.code === 'EMAIL_ALREADY_EXISTS') {
        setEmailAvailable(false);
        setEmailCheckError('이미 사용 중인 이메일입니다.');
      }
      if (caught.status === 429 && caught.retryAfterSeconds)
        countdown.start(caught.retryAfterSeconds);
    } finally {
      setPending(false);
    }
  };

  const feedback = emailCheckError
    ? emailAvailabilityFeedback({ error: emailCheckError })
    : emailAvailable === null
      ? null
      : emailAvailabilityFeedback({ isAvailable: emailAvailable });
  const emailError = error?.violationFor('email');
  const passwordError = error?.violationFor('password');
  const passwordConfirmError = error?.violationFor('passwordConfirm');
  const nameError = error?.violationFor('userName');
  const phoneError = error?.violationFor('phone');
  const generalError =
    error && error.violations.length === 0
      ? signupErrorMessage(error, countdown.remaining)
      : null;

  return (
    <>
      <p className="eyebrow">집사이 시작하기</p>
      <h1>회원가입</h1>
      <p>필수 정보만 입력하면 바로 시작할 수 있어요.</p>
      <form className="form-stack" onSubmit={submit} noValidate>
        <div>
          <TextField
            label="이메일"
            value={email}
            onValueChange={({ value }) => updateEmail(value)}
            invalid={!!emailError}
            errorMessage={emailError}
            disabled={pending}
            suffix={
              <ActionButton
                type="button"
                variant="ghost"
                size="small"
                loading={checkingEmail}
                disabled={pending || checkingEmail || countdown.remaining > 0}
                onClick={checkEmail}
              >
                {checkingEmail
                  ? '확인 중'
                  : countdown.remaining > 0
                    ? `${countdown.remaining}초 후 확인`
                    : '중복 확인'}
              </ActionButton>
            }
          >
            <TextFieldInput
              type="email"
              autoComplete="email"
              placeholder="example@email.com"
            />
          </TextField>
          {feedback && (
            <p
              className={`email-check-feedback email-check-feedback--${feedback.tone}`}
              role="status"
              aria-live="polite"
            >
              {feedback.message}
            </p>
          )}
        </div>
        <TextField
          label="비밀번호"
          description="영문, 숫자, 특수문자를 포함해 8자 이상"
          invalid={!!passwordError}
          errorMessage={passwordError}
          disabled={pending}
        >
          <TextFieldInput
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
          />
        </TextField>
        <TextField
          label="비밀번호 확인"
          invalid={!!passwordConfirmError}
          errorMessage={passwordConfirmError}
          disabled={pending}
        >
          <TextFieldInput
            type="password"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.currentTarget.value)}
          />
        </TextField>
        <TextField
          label="이름"
          description="선택 입력 · 7자 이하"
          invalid={!!nameError}
          errorMessage={nameError}
          disabled={pending}
        >
          <TextFieldInput
            autoComplete="name"
            value={userName}
            onChange={(event) => setUserName(event.currentTarget.value)}
          />
        </TextField>
        <TextField
          label="연락처"
          description="선택 입력"
          invalid={!!phoneError}
          errorMessage={phoneError}
          disabled={pending}
        >
          <TextFieldInput
            type="tel"
            autoComplete="tel"
            placeholder="010-0000-0000"
            value={phone}
            onChange={(event) => setPhone(event.currentTarget.value)}
          />
        </TextField>
        <div className="signup-terms">
          <Checkbox
            checked={acceptedServiceTerms}
            onCheckedChange={(checked) => {
              setAcceptedServiceTerms(checked === true);
              setFormMessage(null);
            }}
            disabled={pending}
            label={
              <>
                <Link to="/terms/SERVICE">{serviceTitle}</Link>에 동의합니다.
                (필수)
              </>
            }
          />
          <Checkbox
            checked={acceptedPrivacyTerms}
            onCheckedChange={(checked) => {
              setAcceptedPrivacyTerms(checked === true);
              setFormMessage(null);
            }}
            disabled={pending}
            label={
              <>
                <Link to="/terms/PRIVACY">{privacyTitle}</Link>에 동의합니다.
                (필수)
              </>
            }
          />
        </div>
        {formMessage && <Callout tone="critical" description={formMessage} />}
        {generalError && <Callout tone="critical" description={generalError} />}
        <ActionButton
          type="submit"
          variant="brandSolid"
          loading={pending}
          disabled={pending || countdown.remaining > 0}
        >
          {countdown.remaining > 0
            ? `${countdown.remaining}초 후 다시 시도`
            : '가입하기'}
        </ActionButton>
      </form>
    </>
  );
}

function retryMessage(remainingSeconds: number) {
  return `요청이 너무 많아요. ${remainingSeconds > 0 ? `${remainingSeconds}초 후` : '잠시 후'} 다시 시도해 주세요.`;
}

function signupErrorMessage(error: ApiError, remainingSeconds: number) {
  if (error.code === 'EMAIL_ALREADY_EXISTS')
    return '이미 가입된 이메일입니다. 다른 이메일을 사용해 주세요.';
  if (error.status === 429) return retryMessage(remainingSeconds);
  if (error.status === 0) return error.message;
  if (error.status === 400 || error.status === 422)
    return '입력한 정보를 확인해 주세요.';
  return '회원가입에 실패했어요. 잠시 후 다시 시도해 주세요.';
}
