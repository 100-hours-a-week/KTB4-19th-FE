import type { ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/entities/session';
import { ViewModeToggle } from '@/features/switch-view-mode';
import type { RouteRole } from '@/shared/config';
import { Logo } from '@/shared/ui';
import { managerNav, residentNav } from '../model/navigation';

type Props = {
  role: RouteRole;
  children: ReactNode;
};

export function AppShell({ role, children }: Props) {
  const location = useLocation();
  const items = role === 'manager' ? managerNav : residentNav;
  const withRouteContext = (to: string) =>
    role === 'manager' && location.search ? `${to}${location.search}` : to;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link
          className="brand"
          to={withRouteContext(role === 'manager' ? '/manager' : '/resident')}
          aria-label="집사이 홈"
        >
          <Logo />
        </Link>
        <nav
          className="main-nav"
          aria-label={`${role === 'manager' ? '관리자' : '입주민'} 메뉴`}
        >
          {items.map(([to, label, NavIcon]) => (
            <NavLink
              key={to}
              to={withRouteContext(to)}
              end={to === `/${role}`}
              className={({ isActive }) =>
                isActive ? 'nav-item active' : 'nav-item'
              }
            >
              <NavIcon aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <SidebarProfile role={role} />
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-actions">
            <ViewModeToggle className="view-mode-toggle--topbar" />
          </div>
        </header>
        <main className="content" key={location.pathname}>
          {children}
        </main>
        <nav className="bottom-nav" aria-label="모바일 메뉴">
          {items.slice(0, 4).map(([to, label, NavIcon]) => (
            <NavLink
              key={to}
              to={withRouteContext(to)}
              end={to === `/${role}`}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <NavIcon aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

function SidebarProfile({ role }: { role: RouteRole }) {
  const auth = useAuth();
  const fallbackName = role === 'manager' ? '김관리' : '박입주';
  const name = auth.user?.userName ?? fallbackName;
  return (
    <div className="sidebar-profile">
      <span className="avatar">{name.slice(0, 1)}</span>
      <div>
        <strong>{name}</strong>
        <small>{auth.user?.email ?? 'A타워'}</small>
      </div>
    </div>
  );
}
