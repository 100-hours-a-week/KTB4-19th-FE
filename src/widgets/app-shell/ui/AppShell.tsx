import { IconBellLine } from "@karrotmarket/react-monochrome-icon";
import { NotificationBadge } from "@seed-design/react";
import type { ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { SegmentedControl, SegmentedControlItem } from "seed-design/ui/segmented-control";
import { useAuth } from "@/entities/session";
import { PreviewStateToolbar } from "@/features/switch-preview-state";
import type { RouteRole } from "@/shared/config";
import type { ViewState } from "@/shared/ui";
import { managerNav, residentNav } from "../model/navigation";

type Props = {
  role: RouteRole;
  state: ViewState;
  onStateChange: (state: ViewState) => void;
  children: ReactNode;
};

export function AppShell({ role, state, onStateChange, children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const items = role === "manager" ? managerNav : residentNav;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to={role === "manager" ? "/manager" : "/resident"} aria-label="집사이 홈">
          <span className="brand-mark">집</span><span>집사이</span>
        </Link>
        <div className="role-switch">
          <SegmentedControl aria-label="프로토타입 사용자 역할" value={role} onValueChange={(value) => navigate(value === "manager" ? "/manager" : "/resident")}>
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
        <SidebarProfile role={role} />
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div><span className="topbar-building">A타워</span><span className="prototype-badge">MOCK PROTOTYPE</span></div>
          <Link className="notification-link" to={`/${role}/notifications`} aria-label="알림 2개"><IconBellLine /><NotificationBadge>2</NotificationBadge></Link>
        </header>
        <main className="content" key={location.pathname}>{children}</main>
        <PreviewStateToolbar state={state} onStateChange={onStateChange} />
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

function SidebarProfile({ role }: { role: RouteRole }) {
  const auth = useAuth();
  const fallbackName = role === "manager" ? "김관리" : "박입주";
  const name = auth.user?.userName ?? fallbackName;
  return <div className="sidebar-profile"><span className="avatar">{name.slice(0, 1)}</span><div><strong>{name}</strong><small>{auth.user?.email ?? "A타워"}</small></div></div>;
}
