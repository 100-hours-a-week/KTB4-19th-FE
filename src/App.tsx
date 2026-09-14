import {
  Badge,
  NotificationBadge,
  PrefixIcon,
} from "@seed-design/react";
import {
  IconBellLine,
  IconBuilding2Line,
  IconCheckmarkCircleFill,
  IconChevronRightLine,
  IconDocumentLine,
  IconDocumentPlusLine,
  IconDot3HorizontalChatbubbleLeftLine,
  IconHouseLine,
  IconMagnifyingglassLine,
  IconPersonLine,
  IconPlusLine,
  IconSparkle2Line,
} from "@karrotmarket/react-monochrome-icon";
import { useState, type ReactNode } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { Checkbox } from "seed-design/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "seed-design/ui/radio-group";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { TextField, TextFieldInput, TextFieldTextarea } from "seed-design/ui/text-field";
import {
  complaints,
  conversations,
  documents,
  insights,
  notifications,
  rooms,
  type ComplaintStatus,
  type RoomStatus,
  type ViewState,
} from "./data/mock";

type Role = "manager" | "resident";

const roomMeta: Record<RoomStatus, { label: string; tone: "neutral" | "warning" | "positive" }> = {
  EMPTY: { label: "공실", tone: "neutral" },
  INVITED: { label: "초대됨", tone: "warning" },
  LIVING: { label: "입주", tone: "positive" },
};

const complaintMeta: Record<ComplaintStatus, { label: string; tone: "neutral" | "informative" | "positive" }> = {
  PENDING: { label: "처리전", tone: "neutral" },
  IN_PROGRESS: { label: "처리중", tone: "informative" },
  DONE: { label: "처리완료", tone: "positive" },
};

function StatusBadge({ status }: { status: RoomStatus | ComplaintStatus }) {
  const meta = status in roomMeta ? roomMeta[status as RoomStatus] : complaintMeta[status as ComplaintStatus];
  return <Badge tone={meta.tone} variant="weak">{meta.label}</Badge>;
}

function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="page-title">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-action">{action}</div>}
    </header>
  );
}

function MetricCard({ label, value, helper, tone = "default" }: { label: string; value: string | number; helper?: string; tone?: "default" | "brand" }) {
  return (
    <article className={`metric-card ${tone === "brand" ? "metric-card--brand" : ""}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      {helper && <span>{helper}</span>}
    </article>
  );
}

function StateBoundary({ state, children, emptyTitle = "표시할 내용이 없어요" }: { state: ViewState; children: ReactNode; emptyTitle?: string }) {
  if (state === "loading") {
    return (
      <div className="skeleton-stack" aria-label="불러오는 중">
        {[1, 2, 3].map((item) => <div className="skeleton-card" key={item} />)}
      </div>
    );
  }
  if (state === "empty") {
    return <div className="result-state"><span className="result-icon"><IconDocumentLine /></span><h2>{emptyTitle}</h2><p>새 항목이 생기면 이곳에서 확인할 수 있어요.</p></div>;
  }
  if (state === "error") {
    return <div className="result-state"><span className="result-icon result-icon--critical">!</span><h2>내용을 불러오지 못했어요</h2><p>잠시 후 다시 시도해 주세요.</p><ActionButton variant="neutralOutline">다시 시도</ActionButton></div>;
  }
  return children;
}

function ReviewToolbar({ state, onStateChange }: { state: ViewState; onStateChange: (state: ViewState) => void }) {
  return (
    <aside className="review-toolbar" aria-label="프로토타입 상태 전환">
      <div><strong>디자인 상태</strong><span>서버 없이 화면 상태를 바꿔보세요</span></div>
      <SegmentedControl aria-label="화면 상태" value={state} onValueChange={(value) => onStateChange(value as ViewState)}>
        <SegmentedControlItem value="default">기본</SegmentedControlItem>
        <SegmentedControlItem value="loading">로딩</SegmentedControlItem>
        <SegmentedControlItem value="empty">빈화면</SegmentedControlItem>
        <SegmentedControlItem value="error">오류</SegmentedControlItem>
      </SegmentedControl>
    </aside>
  );
}

const managerNav = [
  ["/manager", "홈", IconHouseLine],
  ["/manager/rooms", "호실", IconBuilding2Line],
  ["/manager/complaints", "민원", IconDocumentLine],
  ["/manager/documents", "운영규칙", IconDocumentPlusLine],
  ["/manager/insights", "AI 인사이트", IconSparkle2Line],
  ["/manager/mypage", "마이", IconPersonLine],
] as const;

const residentNav = [
  ["/resident", "홈", IconHouseLine],
  ["/resident/conversations", "AI 대화", IconDot3HorizontalChatbubbleLeftLine],
  ["/resident/complaints", "민원", IconDocumentLine],
  ["/resident/mypage", "마이", IconPersonLine],
] as const;

function AppShell({ role, setRole, state, setState, children }: { role: Role; setRole: (role: Role) => void; state: ViewState; setState: (state: ViewState) => void; children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const items = role === "manager" ? managerNav : residentNav;
  const changeRole = (nextRole: Role) => {
    setRole(nextRole);
    navigate(nextRole === "manager" ? "/manager" : "/resident");
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to={role === "manager" ? "/manager" : "/resident"} aria-label="집사이 홈">
          <span className="brand-mark">집</span><span>집사이</span>
        </Link>
        <div className="role-switch">
          <SegmentedControl aria-label="프로토타입 사용자 역할" value={role} onValueChange={(value) => changeRole(value as Role)}>
            <SegmentedControlItem value="manager">관리자</SegmentedControlItem>
            <SegmentedControlItem value="resident">입주민</SegmentedControlItem>
          </SegmentedControl>
        </div>
        <nav className="main-nav" aria-label={`${role === "manager" ? "관리자" : "입주민"} 메뉴`}>
          {items.map(([to, label, NavIcon]) => (
            <NavLink key={to} to={to} end={to === `/${role}`} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <NavIcon aria-hidden="true" /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="prototype-links">
          <span>공통 화면</span>
          <Link to="/auth/login">로그인</Link>
          <Link to="/auth/signup">회원가입</Link>
          <Link to="/auth/role">역할 선택</Link>
          {role === "manager" ? <Link to="/manager/building/new">건물 등록</Link> : <Link to="/resident/connect">입주 연결</Link>}
        </div>
        <div className="sidebar-profile"><span className="avatar">김</span><div><strong>김관리</strong><small>A타워</small></div></div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div><span className="topbar-building">A타워</span><span className="prototype-badge">MOCK PROTOTYPE</span></div>
          <Link className="notification-link" to={`/${role}/notifications`} aria-label="알림 2개"><IconBellLine /><NotificationBadge>2</NotificationBadge></Link>
        </header>
        <main className="content" key={location.pathname}>{children}</main>
        <ReviewToolbar state={state} onStateChange={setState} />
        <nav className="bottom-nav" aria-label="모바일 메뉴">
          {items.slice(0, 4).map(([to, label, NavIcon]) => (
            <NavLink key={to} to={to} end={to === `/${role}`} className={({ isActive }) => isActive ? "active" : ""}>
              <NavIcon aria-hidden="true" /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

function ManagerHome({ state }: { state: ViewState }) {
  return <><PageTitle eyebrow="오늘의 건물 운영" title="안녕하세요, 김관리 님" description="A타워의 중요한 변화를 한눈에 확인하세요." />
    <StateBoundary state={state} emptyTitle="아직 운영 데이터가 없어요">
      <section className="metrics-grid"><MetricCard label="입주 세대" value="5 / 14" helper="입주율 36%" tone="brand" /><MetricCard label="초대 중" value={2} helper="7일 안에 만료" /><MetricCard label="처리 전 민원" value={5} helper="긴급 2건" /><MetricCard label="이번 주 완료" value={12} helper="지난주보다 3건 많아요" /></section>
      <div className="dashboard-grid">
        <section className="panel insight-hero"><div className="section-heading"><div><p className="eyebrow">AI 인사이트</p><h2>지금 먼저 확인해 보세요</h2></div><Link to="/manager/insights">전체 보기</Link></div><div className="insight-content"><span className="insight-icon"><IconSparkle2Line /></span><div><Badge tone="critical" variant="weak">긴급도 9</Badge><h3>3층 누수 민원이 빠르게 늘고 있어요</h3><p>같은 배관 라인에서 24시간 내 3건이 접수됐어요.</p><ActionButton variant="brandSolid" onClick={() => {}}>관련 민원 보기</ActionButton></div></div></section>
        <section className="panel"><div className="section-heading"><h2>최근 민원</h2><Link to="/manager/complaints">전체 보기</Link></div><ComplaintRows compact /></section>
      </div>
      <section className="panel quick-panel"><div className="section-heading"><h2>건물 운영 바로가기</h2></div><div className="quick-grid"><QuickLink to="/manager/rooms" icon={<IconBuilding2Line />} title="호실 현황" text="입주·초대 상태 확인" /><QuickLink to="/manager/documents" icon={<IconDocumentPlusLine />} title="운영규칙" text="등록 문서 3개" /><QuickLink to="/manager/complaints" icon={<IconDocumentLine />} title="민원 관리" text="처리 전 5건" /></div></section>
    </StateBoundary></>;
}

function BuildingFormPage() {
  const [saved, setSaved] = useState(false);
  return <><PageTitle eyebrow="관리자 시작하기" title="관리할 건물을 등록해 주세요" description="건물은 관리자 계정당 한 곳만 등록할 수 있어요." /><div className="form-page-grid"><section className="panel form-panel"><TextField label="건물명" description="선택 입력 · 20자 이하"><TextFieldInput defaultValue="A타워" /></TextField><TextField label="도로명 주소" showRequiredIndicator required><TextFieldInput defaultValue="서울 강남구 역삼동 123-4" /></TextField><div className="address-preview"><IconBuilding2Line /><div><strong>A타워</strong><p>서울 강남구 역삼동 123-4</p></div></div>{saved && <div className="inline-success"><IconCheckmarkCircleFill />건물 정보가 mock 상태에 저장됐어요.</div>}<ActionButton variant="brandSolid" onClick={() => setSaved(true)}>건물 등록</ActionButton></section><aside className="panel detail-aside"><h2>등록 후 할 수 있어요</h2><InfoRow label="1" value="호실 일괄 생성" /><InfoRow label="2" value="입주민 초대" /><InfoRow label="3" value="민원·운영규칙 관리" /></aside></div></>;
}

function QuickLink({ to, icon, title, text }: { to: string; icon: ReactNode; title: string; text: string }) {
  return <Link className="quick-link" to={to}><span>{icon}</span><div><strong>{title}</strong><small>{text}</small></div><IconChevronRightLine /></Link>;
}

function RoomsPage({ state }: { state: ViewState }) {
  const [status, setStatus] = useState<"ALL" | RoomStatus>("ALL");
  const filtered = status === "ALL" ? rooms : rooms.filter((room) => room.status === status);
  return <><PageTitle eyebrow="건물 관리" title="호실 현황" description="층별 입주 상태와 초대 현황을 확인하세요." action={<ActionButton variant="brandSolid"><PrefixIcon svg={<IconPlusLine />} />호실 추가</ActionButton>} />
    <section className="metrics-grid metrics-grid--three"><MetricCard label="입주" value={3} /><MetricCard label="초대됨" value={1} /><MetricCard label="공실" value={2} /></section>
    <div className="filter-bar"><SegmentedControl aria-label="호실 상태" value={status} onValueChange={(value) => setStatus(value as typeof status)}><SegmentedControlItem value="ALL">전체</SegmentedControlItem><SegmentedControlItem value="LIVING">입주</SegmentedControlItem><SegmentedControlItem value="INVITED">초대됨</SegmentedControlItem><SegmentedControlItem value="EMPTY">공실</SegmentedControlItem></SegmentedControl></div>
    <StateBoundary state={state} emptyTitle="조건에 맞는 호실이 없어요"><section className="room-grid">{filtered.map((room) => <Link className="room-card" to={`/manager/rooms/${room.id}`} key={room.id}><div><strong>{room.roomNo}</strong><StatusBadge status={room.status} /></div><p>{room.resident ?? (room.status === "INVITED" ? "초대 응답 대기 중" : "입주민 없음")}</p><span>누적 민원 {room.complaints}건</span></Link>)}</section></StateBoundary>
  </>;
}

function RoomDetail({ state }: { state: ViewState }) {
  const { roomId } = useParams();
  const initial = rooms.find((room) => String(room.id) === roomId) ?? rooms[0];
  const [status, setStatus] = useState<RoomStatus>(initial.status);
  return <><PageTitle eyebrow="호실 상세" title={initial.roomNo} description="A타워 · 3층" />
    <div className="filter-bar filter-bar--left"><span>프로토타입 상태</span><SegmentedControl aria-label="호실 도메인 상태" value={status} onValueChange={(value) => setStatus(value as RoomStatus)}><SegmentedControlItem value="EMPTY">EMPTY</SegmentedControlItem><SegmentedControlItem value="INVITED">INVITED</SegmentedControlItem><SegmentedControlItem value="LIVING">LIVING</SegmentedControlItem></SegmentedControl></div>
    <StateBoundary state={state}><div className="detail-grid"><section className="panel"><div className="detail-status"><div><span>현재 상태</span><h2>{roomMeta[status].label}</h2></div><StatusBadge status={status} /></div>{status === "EMPTY" && <div className="empty-room"><span className="large-symbol">301</span><h3>현재 입주민이 없어요</h3><p>새 입주민을 초대할 코드를 발급해 보세요.</p><ActionButton variant="brandSolid">초대코드 발급</ActionButton></div>}{status === "INVITED" && <div className="invitation-card"><span>입주민 초대코드</span><strong>K7M9XZ</strong><p>2026년 9월 21일 23:59까지</p><div className="button-row"><ActionButton variant="brandSolid">코드 복사</ActionButton><ActionButton variant="neutralOutline">재발급</ActionButton><ActionButton variant="ghost" color="fg.critical">초대 취소</ActionButton></div></div>}{status === "LIVING" && <div className="resident-card"><span className="avatar avatar--large">박</span><div><h3>박입주</h3><p>010-9876-5432</p><small>2026년 8월 21일부터 입주</small></div><ActionButton variant="neutralOutline">입주민 퇴실</ActionButton></div>}</section><aside className="panel detail-aside"><h2>호실 정보</h2><InfoRow label="건물" value="A타워" /><InfoRow label="호실" value={initial.roomNo} /><InfoRow label="누적 민원" value={`${status === "LIVING" ? 3 : 0}건`} /><InfoRow label="마지막 변경" value="오늘 10:42" /></aside></div></StateBoundary>
  </>;
}

function ComplaintRows({ compact = false, role = "manager" }: { compact?: boolean; role?: Role }) {
  return <div className="list-stack">{complaints.slice(0, compact ? 2 : undefined).map((item) => <Link className="list-row" to={`/${role}/complaints/${item.id}`} key={item.id}><div className="list-leading"><span className={`urgency-dot ${item.urgency >= 8 ? "urgent" : ""}`} /><div><div className="row-title"><strong>{item.title}</strong><StatusBadge status={item.status} /></div><p>{role === "manager" ? `${item.roomNo} · ` : ""}{item.date}</p></div></div>{role === "manager" && <span className="urgency-label">긴급도 {item.urgency}</span>}<IconChevronRightLine /></Link>)}</div>;
}

function ComplaintsPage({ state, role }: { state: ViewState; role: Role }) {
  const [status, setStatus] = useState<"ALL" | ComplaintStatus>("ALL");
  const filtered = status === "ALL" ? complaints : complaints.filter((item) => item.status === status);
  return <><PageTitle eyebrow={role === "manager" ? "민원 관리" : "나의 민원"} title={role === "manager" ? "민원 목록" : "접수한 민원"} description={role === "manager" ? "긴급도와 처리 상태를 기준으로 빠르게 대응하세요." : "접수한 민원의 처리 상태를 확인하세요."} />
    {role === "manager" && <section className="metrics-grid metrics-grid--three"><MetricCard label="처리 전" value={5} /><MetricCard label="처리 중" value={8} /><MetricCard label="이번 주 완료" value={12} /></section>}
    <section className="panel list-panel"><div className="list-tools"><TextField prefixIcon={<IconMagnifyingglassLine />}><TextFieldInput aria-label="민원 검색" placeholder="제목이나 호실로 검색" /></TextField><SegmentedControl aria-label="민원 처리 상태" value={status} onValueChange={(value) => setStatus(value as typeof status)}><SegmentedControlItem value="ALL">전체</SegmentedControlItem><SegmentedControlItem value="PENDING">처리전</SegmentedControlItem><SegmentedControlItem value="IN_PROGRESS">처리중</SegmentedControlItem><SegmentedControlItem value="DONE">완료</SegmentedControlItem></SegmentedControl></div><StateBoundary state={state} emptyTitle="조건에 맞는 민원이 없어요"><div className="list-stack">{filtered.map((item) => <Link className="list-row" to={`/${role}/complaints/${item.id}`} key={item.id}><div className="list-leading"><span className={`complaint-thumb ${item.image ? "has-image" : ""}`}>{item.image ? "사진" : item.roomNo}</span><div><div className="row-title"><strong>{item.title}</strong><StatusBadge status={item.status} /></div><p>{role === "manager" ? `${item.roomNo} · ` : ""}{item.date}</p></div></div>{role === "manager" && <span className={`urgency-label ${item.urgency >= 8 ? "urgent" : ""}`}>긴급도 {item.urgency}</span>}<IconChevronRightLine /></Link>)}</div></StateBoundary></section>
  </>;
}

function ComplaintDetail({ state, role }: { state: ViewState; role: Role }) {
  const [status, setStatus] = useState<ComplaintStatus>("IN_PROGRESS");
  return <><PageTitle eyebrow={`${role === "manager" ? "민원 관리" : "나의 민원"} · #77`} title="천장 누수" description="A타워 302호 · 오늘 09:20 접수" action={role === "manager" ? <ActionButton variant="neutralOutline" onClick={() => setStatus(status === "PENDING" ? "IN_PROGRESS" : "DONE")} disabled={status === "DONE"}>{status === "PENDING" ? "처리 시작" : status === "IN_PROGRESS" ? "처리 완료" : "완료된 민원"}</ActionButton> : undefined} />
    <div className="filter-bar filter-bar--left"><span>프로토타입 상태</span><SegmentedControl aria-label="민원 도메인 상태" value={status} onValueChange={(value) => setStatus(value as ComplaintStatus)}><SegmentedControlItem value="PENDING">PENDING</SegmentedControlItem><SegmentedControlItem value="IN_PROGRESS">IN_PROGRESS</SegmentedControlItem><SegmentedControlItem value="DONE">DONE</SegmentedControlItem></SegmentedControl></div>
    <StateBoundary state={state}><div className="detail-grid"><section className="panel complaint-detail"><div className="complaint-heading"><StatusBadge status={status} />{role === "manager" && <Badge tone="critical" variant="weak">긴급도 9</Badge>}</div><section><h2>AI 요약</h2><div className="summary-box"><IconSparkle2Line /><p>안방 천장 가운데에서 어제 저녁부터 물이 떨어지기 시작했고, 오늘 아침부터 증상이 심해졌어요.</p></div></section><section><h2>발생 정보</h2><InfoRow label="위치" value="302호 안방 천장" /><InfoRow label="시점" value="어제 저녁부터" /><InfoRow label="증상" value="천장 가운데에서 물이 떨어짐" /></section><section><h2>첨부 사진</h2><div className="photo-placeholder"><span>누수 사진</span><small>leak.jpg · 240 KB</small></div></section></section><aside className="panel detail-aside"><h2>처리 정보</h2><InfoRow label="접수일" value="2026. 09. 14 09:20" /><InfoRow label="완료일" value={status === "DONE" ? "2026. 09. 14 14:02" : "-"} />{role === "manager" && <Link className="text-link" to="/manager/conversations/31">AI 대화 원본 보기 <IconChevronRightLine /></Link>}{role === "resident" && <Link className="text-link" to="/resident/conversations/31">접수 대화 보기 <IconChevronRightLine /></Link>}</aside></div></StateBoundary>
  </>;
}

function InfoRow({ label, value }: { label: string; value: string }) { return <div className="info-row"><span>{label}</span><strong>{value}</strong></div>; }

function DocumentsPage({ state }: { state: ViewState }) {
  return <><PageTitle eyebrow="AI 답변의 기준" title="운영규칙 문서" description="건물의 생활 규칙을 등록하면 AI가 답변에 활용해요." action={<Link to="/manager/documents/new"><ActionButton variant="brandSolid"><PrefixIcon svg={<IconPlusLine />} />문서 등록</ActionButton></Link>} /><section className="panel list-panel"><div className="list-tools"><TextField prefixIcon={<IconMagnifyingglassLine />}><TextFieldInput aria-label="문서 검색" placeholder="문서 제목 검색" /></TextField><Badge tone="informative" variant="weak">등록 문서 {documents.length}개</Badge></div><StateBoundary state={state} emptyTitle="등록된 운영규칙이 없어요"><div className="document-grid">{documents.map((doc) => <article className="document-card" key={doc.id}><span className="document-icon"><IconDocumentLine /></span><div><h2>{doc.title}</h2><p>버전 {doc.version} · {doc.size}</p><small>수정 {doc.updatedAt}</small></div><div className="button-row"><ActionButton variant="neutralOutline">상세 보기</ActionButton><ActionButton variant="ghost">수정</ActionButton></div></article>)}</div></StateBoundary></section></>;
}

function DocumentFormPage() {
  const [saved, setSaved] = useState(false);
  return <><PageTitle eyebrow="운영규칙 문서" title="새 문서 등록" description="PDF 파일과 제목을 등록해 AI 답변의 기준을 추가하세요." /><div className="form-page-grid"><section className="panel form-panel"><TextField label="문서 제목" showRequiredIndicator required maxGraphemeCount={20}><TextFieldInput defaultValue="건물 운영 규칙(주차)" /></TextField><div className="upload-field"><span className="document-icon"><IconDocumentPlusLine /></span><div><strong>PDF 파일을 선택해 주세요</strong><p>최대 10MB · PDF만 가능</p></div><ActionButton variant="neutralOutline">파일 선택</ActionButton></div><div className="upload-file"><IconDocumentLine /><div><strong>운영규칙_주차.pdf</strong><p>2.4 MB · 업로드 완료</p></div><Badge tone="positive" variant="weak">완료</Badge></div>{saved && <div className="inline-success"><IconCheckmarkCircleFill />문서가 mock 목록에 등록됐어요.</div>}<div className="button-row form-actions"><Link to="/manager/documents"><ActionButton variant="neutralOutline">취소</ActionButton></Link><ActionButton variant="brandSolid" onClick={() => setSaved(true)}>문서 등록</ActionButton></div></section><aside className="panel detail-aside"><h2>문서 활용 안내</h2><p className="aside-copy">등록한 문서는 입주민의 생활 문의에 답변할 때 우선 참고돼요. 이 프로토타입에서는 실제 파일을 전송하지 않습니다.</p></aside></div></>;
}

function InsightsPage({ state }: { state: ViewState }) {
  return <><PageTitle eyebrow="AI 운영 도우미" title="AI 인사이트" description="민원 흐름에서 놓치기 쉬운 반복과 긴급 신호를 모았어요." /><StateBoundary state={state} emptyTitle="아직 분석된 인사이트가 없어요"><div className="insights-layout">{insights.map((item) => <article className="insight-card" key={item.id}><div className="insight-card-top"><Badge tone={item.urgency >= 9 ? "critical" : "warning"} variant="weak">{item.category}</Badge><span>긴급도 {item.urgency}</span></div><h2>{item.title}</h2><p>{item.cause}</p><div className="insight-footer"><span>관련 민원 {item.count}건</span><ActionButton variant="neutralOutline">민원 확인</ActionButton></div></article>)}</div></StateBoundary></>;
}

function NotificationsPage({ state, role }: { state: ViewState; role: Role }) {
  return <><PageTitle eyebrow="새 소식" title="알림" description="민원과 입주 상태의 중요한 변화를 알려드려요." action={<ActionButton variant="ghost">모두 읽음</ActionButton>} /><section className="panel list-panel"><StateBoundary state={state} emptyTitle="새 알림이 없어요"><div className="list-stack">{notifications.map((item) => <Link to={`/${role}/complaints/77`} className={`notification-row ${item.unread ? "unread" : ""}`} key={item.id}><span className="notification-icon"><IconBellLine /></span><div><strong>{item.title}</strong><p>{item.body}</p><small>{item.time}</small></div>{item.unread && <span className="unread-dot" aria-label="읽지 않음" />}</Link>)}</div></StateBoundary></section></>;
}

function ResidentHome({ state }: { state: ViewState }) {
  return <><PageTitle eyebrow="A타워 302호" title="안녕하세요, 박입주 님" description="생활 문의와 민원 접수를 AI 도우미에게 편하게 말씀해 주세요." /><StateBoundary state={state} emptyTitle="아직 대화가 없어요"><section className="resident-hero"><div><span className="ai-orb"><IconSparkle2Line /></span><p className="eyebrow">AI 생활 도우미</p><h2>무엇을 도와드릴까요?</h2><p>시설 문제부터 건물 생활 규칙까지 편하게 물어보세요.</p><Link to="/resident/conversations/new"><ActionButton variant="brandSolid">새 대화 시작</ActionButton></Link></div><div className="suggestion-list"><span>이렇게 물어볼 수 있어요</span><Link to="/resident/conversations/new">“천장에서 물이 새요” <IconChevronRightLine /></Link><Link to="/resident/conversations/new">“분리수거 요일이 언제예요?” <IconChevronRightLine /></Link><Link to="/resident/conversations/new">“주차 등록은 어떻게 하나요?” <IconChevronRightLine /></Link></div></section><section className="panel"><div className="section-heading"><h2>최근 대화</h2><Link to="/resident/conversations">전체 보기</Link></div><ConversationRows compact /></section></StateBoundary></>;
}

function ConversationRows({ compact = false }: { compact?: boolean }) { return <div className="list-stack">{conversations.slice(0, compact ? 3 : undefined).map((item) => <Link className="list-row" to={`/resident/conversations/${item.id}`} key={item.id}><span className="conversation-icon"><IconDot3HorizontalChatbubbleLeftLine /></span><div className="grow"><div className="row-title"><strong>{item.title}</strong><Badge tone={item.status === "답변완료" ? "positive" : "informative"} variant="weak">{item.status}</Badge></div><p>{item.type} · {item.time}</p></div><IconChevronRightLine /></Link>)}</div>; }

function ConversationsPage({ state }: { state: ViewState }) { return <><PageTitle eyebrow="AI 생활 도우미" title="대화 목록" description="이전 문의와 민원 접수 대화를 다시 확인하세요." action={<Link to="/resident/conversations/new"><ActionButton variant="brandSolid"><PrefixIcon svg={<IconPlusLine />} />새 대화</ActionButton></Link>} /><section className="panel list-panel"><TextField prefixIcon={<IconMagnifyingglassLine />}><TextFieldInput aria-label="대화 검색" placeholder="대화 제목 검색" /></TextField><StateBoundary state={state} emptyTitle="아직 대화가 없어요"><ConversationRows /></StateBoundary></section></>; }

function ChatPage({ isNew = false }: { isNew?: boolean }) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(!isNew);
  return <div className="chat-layout"><header className="chat-header"><div><p className="eyebrow">AI 생활 도우미</p><h1>{isNew ? "새 대화" : "천장에서 물이 새요"}</h1></div>{!isNew && <Badge tone="informative" variant="weak">민원 접수 가능</Badge>}</header><div className="chat-body"><div className="message assistant"><span className="message-name">집사이 AI</span><p>불편한 점이나 궁금한 점을 편하게 말씀해 주세요.</p></div>{sent && <><div className="message resident"><p>천장에서 물이 새요. 안방 천장 가운데예요.</p></div><div className="message assistant"><span className="message-name">집사이 AI</span><p>확인했어요. 접수할 내용을 정리했어요.</p><div className="summary-card"><div className="summary-title"><IconCheckmarkCircleFill /><strong>민원 접수 내용</strong></div><InfoRow label="위치" value="302호 안방 천장" /><InfoRow label="시점" value="어제 저녁부터" /><InfoRow label="증상" value="천장 가운데 물이 떨어짐" /><InfoRow label="사진" value="1장" /><div className="button-row"><ActionButton variant="brandSolid">이대로 접수</ActionButton><ActionButton variant="neutralOutline">내용 수정</ActionButton></div></div></div></>}</div><form className="composer" onSubmit={(event) => { event.preventDefault(); if (message.trim()) { setSent(true); setMessage(""); } }}><TextField value={message} onValueChange={({ value }) => setMessage(value)} maxGraphemeCount={200} hideCharacterCount={false}><TextFieldTextarea aria-label="메시지" placeholder="메시지를 입력해 주세요" /></TextField><div className="composer-actions"><span>사진은 최대 3장까지 첨부할 수 있어요</span><ActionButton type="submit" variant="brandSolid" disabled={!message.trim()}>전송</ActionButton></div></form></div>;
}

function ConnectPage() {
  const [step, setStep] = useState<"input" | "confirm" | "done">("input");
  return <div className="focused-flow"><div className="focused-brand"><span className="brand-mark">집</span><strong>집사이</strong></div><div className="flow-progress"><span className="active" /><span className={step !== "input" ? "active" : ""} /><span className={step === "done" ? "active" : ""} /></div>{step === "input" && <div className="flow-card"><p className="eyebrow">입주 연결</p><h1>초대코드를 입력해 주세요</h1><p>관리자에게 받은 6자리 코드를 입력하면 내 호실과 연결돼요.</p><TextField label="초대코드" description="영문 대문자와 숫자 6자리"><TextFieldInput defaultValue="AB3K9F" aria-label="초대코드" /></TextField><ActionButton variant="brandSolid" onClick={() => setStep("confirm")}>코드 확인</ActionButton></div>}{step === "confirm" && <div className="flow-card"><p className="eyebrow">세대 확인</p><h1>이 세대가 맞나요?</h1><div className="unit-confirm"><span className="large-symbol">302</span><h2>A타워 302호</h2><p>관리자 김관리</p></div><div className="button-column"><ActionButton variant="brandSolid" onClick={() => setStep("done")}>맞아요, 연결할게요</ActionButton><ActionButton variant="neutralOutline" onClick={() => setStep("input")}>다시 입력</ActionButton></div></div>}{step === "done" && <div className="flow-card flow-card--center"><span className="success-icon"><IconCheckmarkCircleFill /></span><h1>A타워 302호에 연결됐어요</h1><p>이제 AI 생활 도우미와 민원 기능을 사용할 수 있어요.</p><Link to="/resident"><ActionButton variant="brandSolid">홈으로 가기</ActionButton></Link></div>}</div>;
}

function MyPage({ role }: { role: Role }) { return <><PageTitle eyebrow="내 정보" title="마이페이지" description="프로필과 연결된 건물 정보를 확인하세요." /><div className="detail-grid"><section className="panel profile-panel"><div className="profile-head"><span className="avatar avatar--large">{role === "manager" ? "김" : "박"}</span><div><h2>{role === "manager" ? "김관리" : "박입주"}</h2><p>{role === "manager" ? "관리자" : "입주민"}</p></div><ActionButton variant="neutralOutline">프로필 수정</ActionButton></div><InfoRow label="이메일" value={role === "manager" ? "manager@zips.ai" : "resident@zips.ai"} /><InfoRow label="연락처" value={role === "manager" ? "010-1234-5678" : "010-9876-5432"} /></section><aside className="panel detail-aside"><h2>{role === "manager" ? "관리 건물" : "내 거주지"}</h2><InfoRow label="건물" value="A타워" /><InfoRow label={role === "manager" ? "주소" : "호실"} value={role === "manager" ? "서울 강남구 역삼동 123-4" : "302호"} />{role === "resident" && <InfoRow label="관리인" value="김관리 · 010-1234-5678" />}<div className="settings-links"><Link to="/terms/service">서비스 이용약관 <IconChevronRightLine /></Link><Link to="/terms/privacy">개인정보 처리방침 <IconChevronRightLine /></Link><ActionButton variant="ghost" color="fg.critical">로그아웃</ActionButton></div></aside></div></>;
}

function AuthPage({ kind }: { kind: "login" | "signup" | "role" }) {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>("resident");
  return <div className="auth-page"><div className="auth-visual"><div className="auth-visual-content"><span className="brand-mark brand-mark--large">집</span><h1>건물 생활을 더 가깝고 편하게</h1><p>입주부터 문의, 민원 처리까지 집사이에서 연결하세요.</p></div></div><main className="auth-form"><Link className="brand brand--mobile" to="/auth/login"><span className="brand-mark">집</span><span>집사이</span></Link>{kind === "login" && <><p className="eyebrow">다시 만나서 반가워요</p><h1>로그인</h1><p>건물 생활을 이어서 관리해 보세요.</p><div className="form-stack"><TextField label="이메일"><TextFieldInput type="email" defaultValue="manager@zips.ai" /></TextField><TextField label="비밀번호"><TextFieldInput type="password" defaultValue="password123!" /></TextField><ActionButton variant="brandSolid" onClick={() => navigate("/manager")}>로그인</ActionButton></div><p className="auth-footer">아직 계정이 없나요? <Link to="/auth/signup">회원가입</Link></p></>}{kind === "signup" && <><p className="eyebrow">집사이 시작하기</p><h1>회원가입</h1><p>필수 정보만 입력하면 바로 시작할 수 있어요.</p><div className="form-stack"><TextField label="이메일" suffix={<ActionButton variant="ghost" size="small">중복 확인</ActionButton>}><TextFieldInput type="email" placeholder="example@email.com" /></TextField><TextField label="비밀번호" description="영문, 숫자, 특수문자를 포함해 8자 이상"><TextFieldInput type="password" /></TextField><TextField label="이름"><TextFieldInput /></TextField><TextField label="연락처"><TextFieldInput placeholder="010-0000-0000" /></TextField><Checkbox inputProps={{ defaultChecked: true }} label="서비스 이용약관과 개인정보 처리방침에 동의합니다." /><ActionButton variant="brandSolid" onClick={() => navigate("/auth/role")}>가입하기</ActionButton></div></>}{kind === "role" && <><p className="eyebrow">마지막 단계예요</p><h1>어떻게 이용하시나요?</h1><p>역할은 처음 한 번만 선택할 수 있어요.</p><RadioGroup aria-label="사용자 역할" value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role)}><div className="role-cards"><RadioGroupItem value="manager" label={<span className="role-card-content"><IconBuilding2Line /><strong>관리자</strong><span>건물과 호실, 민원을 관리해요</span></span>} /><RadioGroupItem value="resident" label={<span className="role-card-content"><IconPersonLine /><strong>입주민</strong><span>AI 문의와 민원 접수를 이용해요</span></span>} /></div></RadioGroup><ActionButton variant="brandSolid" onClick={() => navigate(selectedRole === "manager" ? "/manager" : "/resident/connect")}>선택 완료</ActionButton></>}</main></div>;
}

function ConversationReadonly() { return <><PageTitle eyebrow="민원 #77" title="AI 대화 원본" description="입주민이 민원을 접수한 당시의 대화예요. 관리자는 읽기만 할 수 있어요." /><section className="panel readonly-chat"><div className="message assistant"><span className="message-name">집사이 AI</span><p>불편한 점이나 궁금한 점을 편하게 말씀해 주세요.</p></div><div className="message resident"><span className="message-name">박입주 · 302호</span><p>천장에서 물이 새요. 안방 천장 가운데예요.</p></div><div className="message assistant"><span className="message-name">집사이 AI</span><p>언제부터 물이 떨어졌나요?</p></div><div className="message resident"><span className="message-name">박입주 · 302호</span><p>어제 저녁부터요. 오늘 아침에 더 심해졌어요.</p></div><div className="readonly-notice">관리자 화면에서는 원본 대화에 메시지를 보낼 수 없어요.</div></section></>; }

function TermsPage() {
  const { termsType } = useParams();
  const isPrivacy = termsType === "privacy";
  return <div className="terms-page"><Link className="brand" to="/auth/signup"><span className="brand-mark">집</span><span>집사이</span></Link><article><p className="eyebrow">공통 정책</p><h1>{isPrivacy ? "개인정보 처리방침" : "서비스 이용약관"}</h1><p className="terms-date">시행일 2026. 09. 01</p><h2>제1조 목적</h2><p>{isPrivacy ? "본 방침은 집사이가 처리하는 개인정보의 항목과 이용 목적을 안내합니다." : "본 약관은 집사이가 제공하는 건물 관리 서비스의 이용 조건과 절차를 정합니다."}</p><h2>제2조 서비스 이용</h2><p>사용자는 관리자 또는 입주민 역할에 따라 제공되는 기능을 이용할 수 있습니다. 상세 문구는 실제 정책 확정 단계에서 교체합니다.</p><h2>제3조 개인정보 보호</h2><p>서비스는 기능 제공에 필요한 범위에서 개인정보를 처리하며 관련 법령을 준수합니다.</p></article></div>;
}

export function App() {
  const [, setRole] = useState<Role>("manager");
  const [viewState, setViewState] = useState<ViewState>("default");
  const shell = (content: ReactNode, routeRole: Role) => <AppShell role={routeRole} setRole={setRole} state={viewState} setState={setViewState}>{content}</AppShell>;
  return <Routes>
    <Route path="/" element={<Navigate to="/manager" replace />} />
    <Route path="/auth/login" element={<AuthPage kind="login" />} />
    <Route path="/auth/signup" element={<AuthPage kind="signup" />} />
    <Route path="/auth/role" element={<AuthPage kind="role" />} />
    <Route path="/terms/:termsType" element={<TermsPage />} />
    <Route path="/manager" element={shell(<ManagerHome state={viewState} />, "manager")} />
    <Route path="/manager/building/new" element={shell(<BuildingFormPage />, "manager")} />
    <Route path="/manager/rooms" element={shell(<RoomsPage state={viewState} />, "manager")} />
    <Route path="/manager/rooms/:roomId" element={shell(<RoomDetail state={viewState} />, "manager")} />
    <Route path="/manager/complaints" element={shell(<ComplaintsPage state={viewState} role="manager" />, "manager")} />
    <Route path="/manager/complaints/:complaintId" element={shell(<ComplaintDetail state={viewState} role="manager" />, "manager")} />
    <Route path="/manager/conversations/:conversationId" element={shell(<ConversationReadonly />, "manager")} />
    <Route path="/manager/documents" element={shell(<DocumentsPage state={viewState} />, "manager")} />
    <Route path="/manager/documents/new" element={shell(<DocumentFormPage />, "manager")} />
    <Route path="/manager/insights" element={shell(<InsightsPage state={viewState} />, "manager")} />
    <Route path="/manager/mypage" element={shell(<MyPage role="manager" />, "manager")} />
    <Route path="/manager/notifications" element={shell(<NotificationsPage state={viewState} role="manager" />, "manager")} />
    <Route path="/resident" element={shell(<ResidentHome state={viewState} />, "resident")} />
    <Route path="/resident/connect" element={<ConnectPage />} />
    <Route path="/resident/conversations" element={shell(<ConversationsPage state={viewState} />, "resident")} />
    <Route path="/resident/conversations/new" element={shell(<ChatPage isNew />, "resident")} />
    <Route path="/resident/conversations/:conversationId" element={shell(<ChatPage />, "resident")} />
    <Route path="/resident/complaints" element={shell(<ComplaintsPage state={viewState} role="resident" />, "resident")} />
    <Route path="/resident/complaints/:complaintId" element={shell(<ComplaintDetail state={viewState} role="resident" />, "resident")} />
    <Route path="/resident/mypage" element={shell(<MyPage role="resident" />, "resident")} />
    <Route path="/resident/notifications" element={shell(<NotificationsPage state={viewState} role="resident" />, "resident")} />
    <Route path="*" element={<Navigate to="/manager" replace />} />
  </Routes>;
}
