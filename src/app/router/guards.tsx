import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useResidentConnection } from '@/entities/complaint';
import { roleHome, useAuth, type UserRole } from '@/entities/session';
import { isApiError } from '@/shared/api';
import { FullPageLoading } from '@/shared/ui';

export function RequireRole({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.status === 'loading') return <FullPageLoading />;
  if (auth.status === 'anonymous') {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }
  if (auth.user.userRole !== role)
    return <Navigate to={roleHome(auth.user.userRole)} replace />;
  return children;
}

export function HomeRedirect() {
  const auth = useAuth();
  if (auth.status === "loading") return <FullPageLoading />;
  if (auth.status === "anonymous") return <Navigate to="/auth/login" replace />;
  const nextStep = auth.user.onboarding?.nextStep;
  if (nextStep === "ROLE_SELECTION") return <Navigate to="/auth/role" replace />;
  if (nextStep === "BUILDING_REGISTRATION") return <Navigate to="/manager/building/new" replace />;
  if (nextStep === "ROOM_REGISTRATION") {
    return <Navigate to="/manager/building/rooms/bulk" replace />;
  }
  if (nextStep === "INVITATION_CODE") return <Navigate to="/resident/connect" replace />;
  return <Navigate to={roleHome(auth.user.userRole)} replace />;
}

export function RequireResidentConnection({
  children,
}: {
  children: ReactNode;
}) {
  const connection = useResidentConnection();

  if (connection.isPending) return <FullPageLoading />;
  if (isApiError(connection.error) && connection.error.status === 403) {
    return <Navigate to="/resident/connect" replace />;
  }
  return children;
}
