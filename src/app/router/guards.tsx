import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useResidentConnection } from '@/entities/complaint';
import {
  roleHome,
  useAuth,
  useOnboardingStatus,
  type OnboardingStatus,
  type UserRole,
} from '@/entities/session';
import { isApiError } from '@/shared/api';
import { FullPageLoading } from '@/shared/ui';

function managerOnboardingPath(nextStep: OnboardingStatus['nextStep']) {
  if (nextStep === 'BUILDING_REGISTRATION') return '/manager/building/new';
  if (nextStep === 'ROOM_REGISTRATION') return '/manager/building/rooms/bulk';
  return '/manager';
}

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
  if (nextStep === "BUILDING_REGISTRATION" || nextStep === "ROOM_REGISTRATION") {
    return <Navigate to={managerOnboardingPath(nextStep)} replace />;
  }
  if (nextStep === "INVITATION_CODE") return <Navigate to="/resident/connect" replace />;
  return <Navigate to={roleHome(auth.user.userRole)} replace />;
}

/**
 * Guards a manager onboarding step (building/room registration) behind the
 * server's current onboarding status, fetched fresh rather than read from
 * AuthProvider's cached snapshot, so a manager who just finished the flow
 * can't re-enter a prior step by typing its URL. Fails open on fetch error
 * since the backend independently rejects duplicate registration.
 */
export function RequireOnboardingStep({
  step,
  children,
}: {
  step: Extract<
    OnboardingStatus['nextStep'],
    'BUILDING_REGISTRATION' | 'ROOM_REGISTRATION'
  >;
  children: ReactNode;
}) {
  const status = useOnboardingStatus();
  if (status.isPending) return <FullPageLoading />;
  if (status.isError) return children;
  if (status.data.nextStep !== step) {
    return <Navigate to={managerOnboardingPath(status.data.nextStep)} replace />;
  }
  return children;
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
