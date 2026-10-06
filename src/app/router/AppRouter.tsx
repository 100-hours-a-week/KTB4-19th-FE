import { type ReactNode } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { ManagerBuildingBoundary } from '@/entities/building';
import { BuildingRegisterPage } from '@/pages/building-register';
import { BulkRoomRegisterPage } from '@/pages/bulk-room-register';
import { ComplaintDetailPage } from '@/pages/complaint-detail';
import { ComplaintsPage } from '@/pages/complaints';
import { DocumentRegisterPage } from '@/pages/document-register';
import { DocumentDetailPage } from '@/pages/document-detail';
import { DocumentsPage } from '@/pages/documents';
import { LoginPage } from '@/pages/login';
import { ManagerConversationPage } from '@/pages/manager-conversation';
import { ManagerHomePage } from '@/pages/manager-home';
import { ManagerProfilePage } from '@/pages/manager-profile';
import { MyPage } from '@/pages/mypage';
import { NotificationsPage } from '@/pages/notifications';
import { ChatPage, NewChatPage } from '@/pages/resident-chat';
import { ResidentConnectPage } from '@/pages/resident-connect';
import { ConversationsPage } from '@/pages/resident-conversations';
import { ResidentHomePage } from '@/pages/resident-home';
import { RoleSelectPage } from '@/pages/role-select';
import { RoomDetailPage } from '@/pages/room-detail';
import { RoomsPage } from '@/pages/rooms';
import { SignupPage } from '@/pages/signup';
import { TermsPage } from '@/pages/terms';
import type { RouteRole } from '@/shared/config';
import { Logo } from '@/shared/ui';
import { AppShell } from '@/widgets/app-shell';
import {
  HomeRedirect,
  RequireOnboardingStep,
  RequireResidentConnection,
  RequireRole,
} from './guards';

export function AppRouter() {
  const shell = (content: ReactNode, routeRole: RouteRole) => (
    <AppShell role={routeRole}>{content}</AppShell>
  );
  const residentShell = (content: ReactNode) => (
    <RequireRole role="RESIDENT">
      <RequireResidentConnection>
        {shell(content, 'resident')}
      </RequireResidentConnection>
    </RequireRole>
  );
  const managerShell = (content: ReactNode) => (
    <RequireRole role="MANAGER">{shell(content, 'manager')}</RequireRole>
  );
  const managerOnboardingShell = (
    content: ReactNode,
    step: 'BUILDING_REGISTRATION' | 'ROOM_REGISTRATION',
  ) => (
    <RequireRole role="MANAGER">
      <RequireOnboardingStep step={step}>
        <main className="focused-flow manager-onboarding-flow">
          <Link className="focused-brand" to="/manager" aria-label="zipsAI">
            <Logo />
          </Link>
          {content}
        </main>
      </RequireOnboardingStep>
    </RequireRole>
  );
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignupPage />} />
      <Route path="/auth/role" element={<RoleSelectPage />} />
      <Route path="/terms/:termsType" element={<TermsPage />} />
      <Route path="/manager" element={managerShell(<ManagerHomePage />)} />
      <Route
        path="/manager/onboarding/profile"
        element={
          <RequireRole role="MANAGER">
            <ManagerProfilePage />
          </RequireRole>
        }
      />
      <Route
        path="/manager/building/new"
        element={managerOnboardingShell(
          <BuildingRegisterPage />,
          'BUILDING_REGISTRATION',
        )}
      />
      <Route
        path="/manager/building/rooms/bulk"
        element={managerOnboardingShell(
          <BulkRoomRegisterPage />,
          'ROOM_REGISTRATION',
        )}
      />
      <Route
        path="/manager/rooms"
        element={managerShell(
          <ManagerBuildingBoundary>
            <RoomsPage />
          </ManagerBuildingBoundary>,
        )}
      />
      <Route
        path="/manager/rooms/:roomId"
        element={managerShell(<RoomDetailPage />)}
      />
      <Route
        path="/manager/complaints"
        element={managerShell(
          <ManagerBuildingBoundary>
            <ComplaintsPage role="manager" />
          </ManagerBuildingBoundary>,
        )}
      />
      <Route
        path="/manager/complaints/:complaintId"
        element={managerShell(<ComplaintDetailPage role="manager" />)}
      />
      <Route
        path="/manager/conversations/:conversationId"
        element={managerShell(<ManagerConversationPage />)}
      />
      <Route
        path="/manager/documents"
        element={managerShell(
          <ManagerBuildingBoundary>
            <DocumentsPage />
          </ManagerBuildingBoundary>,
        )}
      />
      <Route
        path="/manager/documents/new"
        element={managerShell(<DocumentRegisterPage />)}
      />
      <Route path="/manager/documents/:documentId" element={managerShell(<DocumentDetailPage />)} />
      <Route
        path="/manager/mypage"
        element={managerShell(<MyPage role="manager" />)}
      />
      <Route
        path="/manager/notifications"
        element={managerShell(<NotificationsPage role="manager" />)}
      />
      <Route path="/resident" element={residentShell(<ResidentHomePage />)} />
      <Route path="/resident/connect" element={<ResidentConnectPage />} />
      <Route
        path="/resident/conversations"
        element={residentShell(<ConversationsPage />)}
      />
      <Route
        path="/resident/conversations/new"
        element={residentShell(<NewChatPage />)}
      />
      <Route
        path="/resident/conversations/:conversationId"
        element={residentShell(<ChatPage />)}
      />
      <Route
        path="/resident/complaints"
        element={residentShell(<ComplaintsPage role="resident" />)}
      />
      <Route
        path="/resident/complaints/:complaintId"
        element={residentShell(<ComplaintDetailPage role="resident" />)}
      />
      <Route
        path="/resident/mypage"
        element={residentShell(<MyPage role="resident" />)}
      />
      <Route
        path="/resident/notifications"
        element={residentShell(<NotificationsPage role="resident" />)}
      />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
