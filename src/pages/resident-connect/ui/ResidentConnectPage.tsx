import { IconCheckmarkCircleFill } from '@karrotmarket/react-monochrome-icon';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import { Callout } from 'seed-design/ui/callout';
import { TextField, TextFieldInput } from 'seed-design/ui/text-field';
import {
  roomApi,
  type RoomConnectionResponse,
  type InvitationCodeValidationResponse,
} from '@/entities/room';
import { useAuth } from '@/entities/session';
import { isApiError } from '@/shared/api';
import { formatRoomNo } from '@/shared/lib';
import { FullPageLoading, Logo } from '@/shared/ui';

export function ResidentConnectPage() {
  const auth = useAuth();
  const [step, setStep] = useState<'input' | 'confirm' | 'done'>('input');
  const [code, setCode] = useState('');
  const [room, setRoom] = useState<InvitationCodeValidationResponse | null>(
    null,
  );
  const [connected, setConnected] = useState<RoomConnectionResponse | null>(
    null,
  );
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (auth.status === 'loading') return <FullPageLoading />;
  if (auth.status === 'anonymous') return <Navigate to="/auth/login" replace />;
  if (auth.user.userRole !== 'RESIDENT')
    return (
      <Navigate
        to={auth.user.userRole === 'MANAGER' ? '/manager' : '/auth/role'}
        replace
      />
    );

  const checkCode = async () => {
    const normalized = code.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(normalized)) {
      setErrorMessage('초대코드 6자리를 입력해 주세요.');
      return;
    }
    setPending(true);
    setErrorMessage(null);
    try {
      setCode(normalized);
      setRoom(await roomApi.validateInvitation(normalized));
      setStep('confirm');
    } catch (error) {
      setErrorMessage(
        connectErrorMessage(error, '초대코드를 확인하지 못했어요.'),
      );
    } finally {
      setPending(false);
    }
  };

  const connect = async () => {
    setPending(true);
    setErrorMessage(null);
    try {
      setConnected(await roomApi.connectRoom(code));
      setStep('done');
    } catch (error) {
      setErrorMessage(
        connectErrorMessage(error, '입주 연결을 완료하지 못했어요.'),
      );
    } finally {
      setPending(false);
    }
  };

  const reset = () => {
    setStep('input');
    setRoom(null);
    setConnected(null);
    setErrorMessage(null);
  };

  return (
    <div className="focused-flow">
      <div className="focused-brand">
        <Logo />
      </div>
      <div className="flow-progress">
        <span className="active" />
        <span className={step !== 'input' ? 'active' : ''} />
        <span className={step === 'done' ? 'active' : ''} />
      </div>
      {step === 'input' && (
        <div className="flow-card">
          <p className="eyebrow">입주 연결</p>
          <h1>초대코드를 입력해 주세요</h1>
          <p>관리자에게 받은 6자리 코드를 입력하면 내 호실과 연결돼요.</p>
          <TextField
            label="초대코드"
            description="영문 대문자와 숫자 6자리"
            invalid={!!errorMessage}
            errorMessage={errorMessage ?? undefined}
            value={code}
            onValueChange={({ value }) => {
              setCode(value.toUpperCase());
              setErrorMessage(null);
            }}
          >
            <TextFieldInput
              maxLength={6}
              aria-label="초대코드"
              autoComplete="off"
            />
          </TextField>
          <ActionButton
            variant="brandSolid"
            loading={pending}
            disabled={pending}
            onClick={checkCode}
          >
            코드 확인
          </ActionButton>
        </div>
      )}
      {step === 'confirm' && room && (
        <div className="flow-card">
          <p className="eyebrow">세대 확인</p>
          <h1>이 세대가 맞나요?</h1>
          <div className="unit-confirm">
            <span className="large-symbol">
              {formatRoomNo(room.roomNo).replace('호', '')}
            </span>
            <h2>
              {room.buildingName} {formatRoomNo(room.roomNo)}
            </h2>
            <p>관리자가 발급한 초대코드예요.</p>
          </div>
          {errorMessage && (
            <Callout tone="critical" description={errorMessage} />
          )}
          <div className="button-column">
            <ActionButton
              variant="brandSolid"
              loading={pending}
              disabled={pending}
              onClick={connect}
            >
              맞아요, 연결할게요
            </ActionButton>
            <ActionButton
              variant="neutralOutline"
              disabled={pending}
              onClick={reset}
            >
              다시 입력
            </ActionButton>
          </div>
        </div>
      )}
      {step === 'done' && connected && (
        <div className="flow-card flow-card--center">
          <span className="success-icon">
            <IconCheckmarkCircleFill />
          </span>
          <h1>
            {connected.buildingName} {formatRoomNo(connected.roomNo)}에
            연결됐어요
          </h1>
          <p>이제 AI 생활 도우미와 민원 기능을 사용할 수 있어요.</p>
          <Link to="/resident">
            <ActionButton variant="brandSolid">홈으로 가기</ActionButton>
          </Link>
        </div>
      )}
    </div>
  );
}

function connectErrorMessage(error: unknown, fallback: string) {
  if (!isApiError(error)) return fallback;
  if (error.status === 404) return '유효한 초대코드를 찾을 수 없어요.';
  if (error.status === 409)
    return error.message || '이 초대코드는 사용할 수 없어요.';
  if (error.status === 401)
    return '로그인 정보가 만료됐어요. 다시 로그인해 주세요.';
  if (error.status === 403) return '입주민만 입주 연결을 할 수 있어요.';
  if (error.status === 400 || error.status === 422)
    return error.violations[0]?.reason ?? '초대코드를 확인해 주세요.';
  return error.message || fallback;
}
