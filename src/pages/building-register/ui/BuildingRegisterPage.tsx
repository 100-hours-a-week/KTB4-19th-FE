import {
  IconBuilding2Line,
  IconCheckmarkCircleFill,
} from '@karrotmarket/react-monochrome-icon';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import { Callout } from 'seed-design/ui/callout';
import { TextField, TextFieldInput } from 'seed-design/ui/text-field';
import { buildingApi } from '@/entities/building';
import { isApiError } from '@/shared/api';
import { InfoRow, PageTitle } from '@/shared/ui';

export function BuildingRegisterPage() {
  const navigate = useNavigate();
  const [buildingName, setBuildingName] = useState('');
  const [roadAddress, setRoadAddress] = useState('');
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    if (!roadAddress.trim())
      return setErrorMessage('건물 도로명 주소를 입력해 주세요.');
    setPending(true);
    setErrorMessage(null);
    try {
      await buildingApi.register({
        buildingName: buildingName.trim() || null,
        roadAddress: roadAddress.trim(),
      });
      setSaved(true);
      navigate('/manager/building/rooms/bulk');
    } catch (error) {
      setErrorMessage(buildingErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  const searchAddress = async () => {
    if (addressSearchLoading) return;
    setAddressSearchLoading(true);
    try {
      await loadAddressSearchScript();
      new window.daum!.Postcode({
        oncomplete: (result) => {
          setRoadAddress(result.roadAddress || result.jibunAddress);
          setErrorMessage(null);
        },
      }).open();
    } catch {
      setErrorMessage(
        '주소 검색을 불러오지 못했어요. 도로명 주소를 직접 입력해 주세요.',
      );
    } finally {
      setAddressSearchLoading(false);
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="관리자 시작하기"
        title="관리할 건물을 등록해 주세요"
        description="건물 주소를 등록한 뒤 층별 호실을 한 번에 만들 수 있어요."
      />
      <div
        className="flow-progress building-flow-progress"
        aria-label="관리자 가입 진행 단계"
      >
        <span className="active" />
        <span />
        <span />
      </div>
      <div className="form-page-grid">
        <form className="panel form-panel" onSubmit={submit}>
          <TextField label="건물명" description="선택 입력 · 20자 이하">
            <TextFieldInput
              value={buildingName}
              maxLength={20}
              onChange={(event) => setBuildingName(event.target.value)}
              placeholder="예: 집사이 타워"
            />
          </TextField>
          <TextField
            label="도로명 주소"
            showRequiredIndicator
            required
            description="주소 검색으로 도로명 주소를 선택해 주세요."
          >
            <div className="address-search-row">
              <TextFieldInput
                value={roadAddress}
                readOnly
                placeholder="도로명 주소 검색"
              />
              <ActionButton
                type="button"
                variant="neutralOutline"
                loading={addressSearchLoading}
                onClick={searchAddress}
              >
                주소 검색
              </ActionButton>
            </div>
          </TextField>
          {roadAddress.trim() && (
            <div className="address-preview">
              <IconBuilding2Line />
              <div>
                <strong>{buildingName.trim() || '건물'}</strong>
                <p>{roadAddress.trim()}</p>
              </div>
            </div>
          )}
          {saved && (
            <div className="inline-success">
              <IconCheckmarkCircleFill />
              건물 정보가 저장됐어요.
            </div>
          )}
          {errorMessage && (
            <Callout tone="critical" description={errorMessage} />
          )}
          <ActionButton
            type="submit"
            variant="brandSolid"
            loading={pending}
            disabled={pending}
          >
            {pending ? '등록 중' : '건물 등록'}
          </ActionButton>
        </form>
        <aside className="panel detail-aside">
          <h2>등록 후 할 수 있어요</h2>
          <InfoRow label="1" value="호실 일괄 생성" />
          <InfoRow label="2" value="입주민 초대" />
          <InfoRow label="3" value="민원·운영규칙 관리" />
        </aside>
      </div>
    </>
  );
}

let addressSearchScript: Promise<void> | null = null;

function loadAddressSearchScript() {
  if (window.daum?.Postcode) return Promise.resolve();
  if (addressSearchScript) return addressSearchScript;
  addressSearchScript = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src =
      'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.onload = () => resolve();
    script.onerror = () => {
      addressSearchScript = null;
      reject(new Error('주소 검색 스크립트를 불러오지 못했습니다.'));
    };
    document.head.appendChild(script);
  });
  return addressSearchScript;
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (result: {
          roadAddress: string;
          jibunAddress: string;
        }) => void;
      }) => { open: () => void };
    };
  }
}

function buildingErrorMessage(error: unknown) {
  if (!isApiError(error))
    return '건물을 등록하지 못했어요. 잠시 후 다시 시도해 주세요.';
  if (error.status === 401)
    return '로그인 정보가 만료됐어요. 다시 로그인해 주세요.';
  if (error.status === 403) return '관리자 권한이 필요한 기능이에요.';
  if (error.status === 409)
    return '이미 등록된 건물이 있어요. 기존 건물 정보를 확인해 주세요.';
  if (error.status === 400 || error.status === 422)
    return '건물명과 도로명 주소를 확인해 주세요.';
  return (
    error.message || '건물을 등록하지 못했어요. 잠시 후 다시 시도해 주세요.'
  );
}
