import { IconCheckmarkCircleFill } from '@karrotmarket/react-monochrome-icon';
import { useMemo, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import { Callout } from 'seed-design/ui/callout';
import { TextField, TextFieldInput } from 'seed-design/ui/text-field';
import {
  roomApi,
  generateRoomNumbers,
  groupRoomNumbersByFloor,
  isRoomCountValid,
  selectedRoomNumbers,
} from '@/entities/room';
import { useAuth } from '@/entities/session';
import { isApiError } from '@/shared/api';
import { FullPageLoading, PageTitle } from '@/shared/ui';

export function BulkRoomRegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [floorCount, setFloorCount] = useState('1');
  const [roomsPerFloor, setRoomsPerFloor] = useState('5');
  const [selected, setSelected] = useState<Set<string> | null>(null);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdRooms, setCreatedRooms] = useState<string[] | null>(null);
  const generated = useMemo(
    () => generateRoomNumbers(floorCount, roomsPerFloor),
    [floorCount, roomsPerFloor],
  );
  const roomsByFloor = useMemo(
    () => groupRoomNumbersByFloor(generated),
    [generated],
  );
  const selectedNumbers = selected ?? new Set(generated);
  const selectedList = selectedRoomNumbers(generated, selectedNumbers);

  if (auth.status === 'loading') return <FullPageLoading />;
  if (auth.status === 'anonymous') return <Navigate to="/auth/login" replace />;
  if (auth.user.userRole !== 'MANAGER')
    return (
      <Navigate
        to={auth.user.userRole === 'RESIDENT' ? '/resident' : '/auth/role'}
        replace
      />
    );

  const updateCounts =
    (setValue: (value: string) => void) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value.replace(/\D/g, '').slice(0, 2));
      setSelected(null);
      setCreatedRooms(null);
      setErrorMessage(null);
    };
  const toggleRoom = (roomNo: string) => {
    setSelected((current) => {
      const next = new Set(current ?? generated);
      if (next.has(roomNo)) next.delete(roomNo);
      else next.add(roomNo);
      return next;
    });
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    if (!isRoomCountValid(floorCount, roomsPerFloor))
      return setErrorMessage(
        '층수와 층별 호실 수는 각각 1~20으로 입력해 주세요.',
      );
    if (!selectedList.length)
      return setErrorMessage('생성할 호실을 하나 이상 선택해 주세요.');
    setPending(true);
    setErrorMessage(null);
    try {
      const result = await roomApi.createMany(selectedList);
      setCreatedRooms(result.rooms.map((room) => room.roomNo));
    } catch (error) {
      setErrorMessage(roomErrorMessage(error));
    } finally {
      setPending(false);
    }
  };

  if (createdRooms)
    return (
      <div className="flow-card flow-card--center room-created-result">
        <IconCheckmarkCircleFill className="success-icon" />
        <p className="eyebrow">등록 완료</p>
        <h1>호실 {createdRooms.length}개를 만들었어요</h1>
        <p>등록된 호실 번호: {createdRooms.join(', ')}</p>
        <ActionButton
          variant="brandSolid"
          onClick={() => navigate('/manager', { replace: true })}
        >
          관리자 홈으로
        </ActionButton>
      </div>
    );

  return (
    <>
      <PageTitle
        eyebrow="관리자 가입 · 호실"
        title="층별 호실을 등록해 주세요"
        description="층수와 층별 호실 수를 입력하면 호실 번호를 미리 만들어요. 필요한 호실만 선택해 등록할 수 있어요."
      />
      <form className="panel bulk-room-panel" onSubmit={submit}>
        <div
          className="flow-progress bulk-flow-progress"
          aria-label="관리자 가입 진행 단계"
        >
          <span />
          <span />
          <span className="active" />
        </div>
        <div className="room-count-fields">
          <TextField label="층수" description="1~20층">
            <TextFieldInput
              value={floorCount}
              onChange={updateCounts(setFloorCount)}
              inputMode="numeric"
              maxLength={2}
            />
          </TextField>
          <TextField label="층별 호실 수" description="1~20실">
            <TextFieldInput
              value={roomsPerFloor}
              onChange={updateCounts(setRoomsPerFloor)}
              inputMode="numeric"
              maxLength={2}
            />
          </TextField>
        </div>
        <div className="room-preview-heading">
          <div>
            <h2>호실 미리보기</h2>
            <p>기본은 전체 선택이에요. 눌러서 개별 선택을 바꿀 수 있어요.</p>
          </div>
          <strong>{selectedList.length}개 선택</strong>
        </div>
        {generated.length > 0 ? (
          <div className="room-preview-list">
            {roomsByFloor.map(({ floor, roomNumbers }) => (
              <section className="room-floor" key={floor}>
                <h3>{floor}층</h3>
                <div className="room-preview-grid">
                  {roomNumbers.map((roomNo) => (
                    <button
                      className={`room-preview-item${selectedNumbers.has(roomNo) ? ' selected' : ''}`}
                      type="button"
                      key={roomNo}
                      aria-pressed={selectedNumbers.has(roomNo)}
                      onClick={() => toggleRoom(roomNo)}
                    >
                      {roomNo}
                      {selectedNumbers.has(roomNo) && (
                        <span aria-hidden="true">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <p className="room-count-error">
            층수와 층별 호실 수를 각각 1~20으로 입력해 주세요.
          </p>
        )}
        {errorMessage && <Callout tone="critical" description={errorMessage} />}
        <ActionButton
          type="submit"
          variant="brandSolid"
          loading={pending}
          disabled={pending || !selectedList.length}
        >
          {pending
            ? '호실 생성 중'
            : `선택한 호실 ${selectedList.length}개 생성`}
        </ActionButton>
      </form>
    </>
  );
}

function roomErrorMessage(error: unknown) {
  if (!isApiError(error))
    return '호실 생성 중 네트워크 오류가 발생했어요. 다시 시도해 주세요.';
  if (error.status === 401)
    return '로그인 정보가 만료됐어요. 다시 로그인해 주세요.';
  if (error.status === 403) return '해당 건물의 호실을 생성할 권한이 없어요.';
  if (error.status === 404)
    return '건물을 찾을 수 없어요. 건물 등록부터 다시 진행해 주세요.';
  if (error.status === 409)
    return '이미 등록된 호실 번호가 있어요. 번호를 확인해 다시 시도해 주세요.';
  if (error.status === 400 || error.status === 422)
    return '호실 번호를 확인해 주세요. 중복되거나 올바르지 않은 번호가 포함됐을 수 있어요.';
  return (
    error.message || '호실을 생성하지 못했어요. 잠시 후 다시 시도해 주세요.'
  );
}
