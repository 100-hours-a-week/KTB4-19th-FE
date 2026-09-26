import { IconChevronRightLine } from '@karrotmarket/react-monochrome-icon';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import {
  useAuth,
  useManagerMyPage,
  useResidentMyPage,
  type ResidentMyPageResponse,
} from '@/entities/session';
import { useTerms } from '@/entities/terms';
import type { RouteRole } from '@/shared/config';
import { InfoRow, PageTitle, StateBoundary } from '@/shared/ui';

export function MyPage({ role }: { role: RouteRole }) {
  const termsQuery = useTerms();
  const terms = termsQuery.data?.terms ?? [];
  const serviceTitle =
    terms.find((item) => item.termsType === 'SERVICE')?.title ?? '약관';
  const privacyTitle =
    terms.find((item) => item.termsType === 'PRIVACY')?.title ?? '약관';

  return (
    <>
      <PageTitle
        eyebrow="내 정보"
        title="마이페이지"
        description="프로필과 연결된 건물 정보를 확인하세요."
      />
      {role === 'manager' ? (
        <ManagerMyPageContent
          serviceTitle={serviceTitle}
          privacyTitle={privacyTitle}
        />
      ) : (
        <ResidentMyPageContent
          serviceTitle={serviceTitle}
          privacyTitle={privacyTitle}
        />
      )}
    </>
  );
}

function ManagerMyPageContent({
  serviceTitle,
  privacyTitle,
}: {
  serviceTitle: string;
  privacyTitle: string;
}) {
  const query = useManagerMyPage();
  const auth = useAuth();
  const navigate = useNavigate();

  if (query.isPending)
    return <StateBoundary state="loading">{null}</StateBoundary>;
  if (query.isError || !query.data)
    return (
      <StateBoundary state="error" onRetry={() => query.refetch()}>
        {null}
      </StateBoundary>
    );

  const profile = query.data;
  return (
    <MyPageLayout
      name={profile.userName}
      roleLabel="관리자"
      email={profile.email}
      phone={profile.phone}
      sideTitle="관리 건물"
      sideRows={[
        ['건물', profile.buildingName ?? '등록된 건물이 없어요.'],
        ['주소', profile.roadAddress ?? '등록된 주소가 없어요.'],
      ]}
      serviceTitle={serviceTitle}
      privacyTitle={privacyTitle}
      onLogout={async () => {
        await auth.logout();
        navigate('/auth/login', { replace: true });
      }}
    />
  );
}

function ResidentMyPageContent({
  serviceTitle,
  privacyTitle,
}: {
  serviceTitle: string;
  privacyTitle: string;
}) {
  const query = useResidentMyPage();
  const auth = useAuth();
  const navigate = useNavigate();

  if (query.isPending)
    return <StateBoundary state="loading">{null}</StateBoundary>;
  if (query.isError || !query.data)
    return (
      <StateBoundary state="error" onRetry={() => query.refetch()}>
        {null}
      </StateBoundary>
    );

  const profile = query.data;
  return (
    <MyPageLayout
      name={profile.userName}
      roleLabel="입주민"
      email={profile.email}
      phone={profile.phone}
      sideTitle="내 거주지"
      sideRows={[
        ['건물', profile.buildingName],
        ['호실', profile.roomNo],
        ['관리인', formatManager(profile)],
      ]}
      serviceTitle={serviceTitle}
      privacyTitle={privacyTitle}
      onLogout={async () => {
        await auth.logout();
        navigate('/auth/login', { replace: true });
      }}
    />
  );
}

function MyPageLayout({
  name,
  roleLabel,
  email,
  phone,
  sideTitle,
  sideRows,
  serviceTitle,
  privacyTitle,
  onLogout,
}: {
  name: string | null;
  roleLabel: string;
  email: string;
  phone: string | null;
  sideTitle: string;
  sideRows: Array<[string, string]>;
  serviceTitle: string;
  privacyTitle: string;
  onLogout: () => Promise<void>;
}) {
  const auth = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ email, phone: phone ?? '' });
  const [draft, setDraft] = useState({ email, phone: phone ?? '' });
  const [error, setError] = useState<string | null>(null);

  const saveProfile = async () => {
    setSaving(true);
    setError(null);
    try {
      await auth.updateManagerProfile({
        email: draft.email.trim(),
        userName: name ?? '',
        phone: draft.phone.trim(),
      });
      setProfile({ email: draft.email.trim(), phone: draft.phone.trim() });
      setEditing(false);
    } catch {
      setError('이메일과 연락처를 확인해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="detail-grid">
      <section className="panel profile-panel">
        <div className="profile-head">
          <span className="avatar avatar--large">{name?.charAt(0) ?? '?'}</span>
          <div>
            <h2>{name ?? '이름 없음'}</h2>
            <p>{roleLabel}</p>
          </div>
          {editing ? (
            <div className="profile-actions">
              <ActionButton variant="neutralOutline" onClick={() => setEditing(false)}>취소</ActionButton>
              <ActionButton variant="brandSolid" loading={saving} onClick={() => void saveProfile()}>저장</ActionButton>
            </div>
          ) : (
            <ActionButton variant="neutralOutline" onClick={() => { setDraft(profile); setEditing(true); }}>
              프로필 수정
            </ActionButton>
          )}
        </div>
        {editing ? (
          <div className="profile-edit-fields">
            <label>이메일<input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>
            <label>연락처<input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label>
            {error && <p role="alert">{error}</p>}
          </div>
        ) : (
          <><InfoRow label="이메일" value={profile.email} /><InfoRow label="연락처" value={profile.phone || '등록된 연락처가 없어요.'} /></>
        )}
      </section>
      <aside className="panel detail-aside">
        <h2>{sideTitle}</h2>
        {sideRows.map(([label, value]) => (
          <InfoRow key={label} label={label} value={value} />
        ))}
        <div className="settings-links">
          <Link to="/terms/SERVICE">
            {serviceTitle} <IconChevronRightLine />
          </Link>
          <Link to="/terms/PRIVACY">
            {privacyTitle} <IconChevronRightLine />
          </Link>
          <ActionButton variant="ghost" color="fg.critical" onClick={onLogout}>
            로그아웃
          </ActionButton>
        </div>
      </aside>
    </div>
  );
}

function formatManager(profile: ResidentMyPageResponse) {
  if (!profile.managerName && !profile.managerPhone) return '정보 없음';
  return [profile.managerName, profile.managerPhone]
    .filter(Boolean)
    .join(' · ');
}
