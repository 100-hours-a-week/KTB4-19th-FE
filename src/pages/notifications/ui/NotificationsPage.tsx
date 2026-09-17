import { IconBellLine } from "@karrotmarket/react-monochrome-icon";
import { Link } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { notifications } from "@/entities/notification";
import type { RouteRole } from "@/shared/config";
import { PageTitle, StateBoundary, type ViewState } from "@/shared/ui";

export function NotificationsPage({ state, role }: { state: ViewState; role: RouteRole }) {
  return <><PageTitle eyebrow="새 소식" title="알림" description="민원과 입주 상태의 중요한 변화를 알려드려요." action={<ActionButton variant="ghost">모두 읽음</ActionButton>} /><section className="panel list-panel"><StateBoundary state={state} emptyTitle="새 알림이 없어요"><div className="list-stack">{notifications.map((item) => <Link to={`/${role}/complaints/77`} className={`notification-row ${item.unread ? "unread" : ""}`} key={item.id}><span className="notification-icon"><IconBellLine /></span><div><strong>{item.title}</strong><p>{item.body}</p><small>{item.time}</small></div>{item.unread && <span className="unread-dot" aria-label="읽지 않음" />}</Link>)}</div></StateBoundary></section></>;
}
