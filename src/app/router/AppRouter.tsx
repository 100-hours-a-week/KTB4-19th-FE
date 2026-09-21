import { useState, type ReactNode } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { BuildingRegisterPage } from "@/pages/building-register";
import { BulkRoomRegisterPage } from "@/pages/bulk-room-register";
import { ComplaintDetailPage } from "@/pages/complaint-detail";
import { ComplaintsPage } from "@/pages/complaints";
import { DocumentRegisterPage } from "@/pages/document-register";
import { DocumentsPage } from "@/pages/documents";
import { InsightsPage } from "@/pages/insights";
import { LoginPage } from "@/pages/login";
import { ManagerConversationPage } from "@/pages/manager-conversation";
import { ManagerHomePage } from "@/pages/manager-home";
import { ManagerProfilePage } from "@/pages/manager-profile";
import { MyPage } from "@/pages/mypage";
import { NotificationsPage } from "@/pages/notifications";
import { ChatPage, NewChatPage } from "@/pages/resident-chat";
import { ResidentConnectPage } from "@/pages/resident-connect";
import { ConversationsPage } from "@/pages/resident-conversations";
import { ResidentHomePage } from "@/pages/resident-home";
import { RoleSelectPage } from "@/pages/role-select";
import { RoomDetailPage } from "@/pages/room-detail";
import { RoomsPage } from "@/pages/rooms";
import { SignupPage } from "@/pages/signup";
import { TermsPage } from "@/pages/terms";
import type { RouteRole } from "@/shared/config";
import type { ViewState } from "@/shared/ui";
import { Logo } from "@/shared/ui";
import { AppShell } from "@/widgets/app-shell";
import { HomeRedirect, RequireAuth, RequireRole } from "./guards";

export function AppRouter() {
  const [viewState, setViewState] = useState<ViewState>("default");
  const shell = (content: ReactNode, routeRole: RouteRole) => <AppShell role={routeRole} state={viewState} onStateChange={setViewState}>{content}</AppShell>;
  // 입주민 화면은 실제 로그인·역할(RESIDENT)이 필요하다. 관리자 화면은 아직 mock 프로토타입이다.
  const residentShell = (content: ReactNode) => <RequireRole role="RESIDENT">{shell(content, "resident")}</RequireRole>;
  const managerShell = (content: ReactNode) => <RequireRole role="MANAGER">{shell(content, "manager")}</RequireRole>;
  const managerOnboardingShell = (content: ReactNode) => (
    <RequireAuth>
      <main className="focused-flow manager-onboarding-flow">
        <Link className="focused-brand" to="/manager" aria-label="집사이"><Logo /></Link>
        {content}
      </main>
    </RequireAuth>
  );
  return <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="/auth/login" element={<LoginPage />} />
    <Route path="/auth/signup" element={<SignupPage />} />
    <Route path="/auth/role" element={<RoleSelectPage />} />
    <Route path="/terms/:termsType" element={<TermsPage />} />
    <Route path="/manager" element={shell(<ManagerHomePage state={viewState} />, "manager")} />
    <Route path="/manager/onboarding/profile" element={<ManagerProfilePage />} />
    <Route path="/manager/building/new" element={managerOnboardingShell(<BuildingRegisterPage />)} />
    <Route path="/manager/buildings/:buildingId/rooms/bulk" element={managerOnboardingShell(<BulkRoomRegisterPage />)} />
    <Route path="/manager/rooms" element={shell(<RoomsPage state={viewState} />, "manager")} />
    <Route path="/manager/rooms/:roomId" element={shell(<RoomDetailPage state={viewState} />, "manager")} />
    <Route path="/manager/complaints" element={shell(<ComplaintsPage state={viewState} role="manager" />, "manager")} />
    <Route path="/manager/complaints/:complaintId" element={shell(<ComplaintDetailPage state={viewState} role="manager" />, "manager")} />
    <Route path="/manager/conversations/:conversationId" element={shell(<ManagerConversationPage />, "manager")} />
    <Route path="/manager/documents" element={shell(<DocumentsPage state={viewState} />, "manager")} />
    <Route path="/manager/documents/new" element={shell(<DocumentRegisterPage />, "manager")} />
    <Route path="/manager/insights" element={shell(<InsightsPage state={viewState} />, "manager")} />
    <Route path="/manager/mypage" element={shell(<MyPage role="manager" />, "manager")} />
    <Route path="/manager/notifications" element={shell(<NotificationsPage state={viewState} role="manager" />, "manager")} />
    <Route path="/resident" element={residentShell(<ResidentHomePage state={viewState} />)} />
    <Route path="/resident/connect" element={<RequireAuth><ResidentConnectPage /></RequireAuth>} />
    <Route path="/resident/conversations" element={residentShell(<ConversationsPage />)} />
    <Route path="/resident/conversations/new" element={residentShell(<NewChatPage />)} />
    <Route path="/resident/conversations/:conversationId" element={residentShell(<ChatPage />)} />
    <Route path="/resident/complaints" element={residentShell(<ComplaintsPage state={viewState} role="resident" />)} />
    <Route path="/resident/complaints/:complaintId" element={residentShell(<ComplaintDetailPage state={viewState} role="resident" />)} />
    <Route path="/resident/mypage" element={residentShell(<MyPage role="resident" />)} />
    <Route path="/resident/notifications" element={residentShell(<NotificationsPage state={viewState} role="resident" />)} />
    <Route path="*" element={<HomeRedirect />} />
  </Routes>;
}
