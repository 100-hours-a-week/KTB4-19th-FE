import { IconChevronRightLine, IconDot3HorizontalChatbubbleLeftLine } from "@karrotmarket/react-monochrome-icon";
import { Badge } from "@seed-design/react";
import { Link } from "react-router-dom";
import { ActionButton } from "seed-design/ui/action-button";
import { formatListTime } from "../../../shared/ui/formatDateTime";
import { useConversationList } from "../api/conversationQueries";
import type { ConversationListItem, ConversationType } from "../model/types";

const typeLabel: Record<ConversationType, string> = { INQUIRY: "생활 문의", COMPLAINT: "민원" };

const statusTone: Record<string, "neutral" | "informative" | "positive"> = {
  ACTIVE: "informative",
  RESOLVED: "positive",
  PENDING: "neutral",
  IN_PROGRESS: "informative",
  DONE: "positive",
};

type Props = {
  keyword?: string;
  size?: number;
  /** true면 첫 페이지만 보여주고 더 보기를 숨긴다. */
  compact?: boolean;
};

export function ConversationList({ keyword, size, compact = false }: Props) {
  const query = useConversationList({ keyword, size });

  if (query.isPending) {
    return (
      <div className="skeleton-stack" aria-label="불러오는 중">
        {[1, 2, 3].map((item) => <div className="skeleton-row" key={item} />)}
      </div>
    );
  }
  if (query.isError) {
    return (
      <div className="result-state result-state--compact">
        <h2>대화 목록을 불러오지 못했어요</h2>
        <p>잠시 후 다시 시도해 주세요.</p>
        <ActionButton variant="neutralOutline" onClick={() => query.refetch()}>다시 시도</ActionButton>
      </div>
    );
  }

  const conversations = query.data.pages.flatMap((page) => page.conversations);
  if (conversations.length === 0) {
    return (
      <div className="result-state result-state--compact">
        <h2>{keyword ? "검색 결과가 없어요" : "아직 대화가 없어요"}</h2>
        <p>{keyword ? "다른 검색어로 찾아보세요." : "AI 도우미에게 불편한 점이나 궁금한 점을 물어보세요."}</p>
        {!keyword && <Link to="/resident/conversations/new"><ActionButton variant="brandSolid">새 대화 시작</ActionButton></Link>}
      </div>
    );
  }

  return (
    <div className="list-stack">
      {conversations.map((item) => <ConversationRow item={item} key={item.conversationId} />)}
      {!compact && query.hasNextPage && (
        <ActionButton variant="neutralOutline" loading={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
          더 보기
        </ActionButton>
      )}
    </div>
  );
}

function ConversationRow({ item }: { item: ConversationListItem }) {
  return (
    <Link className="list-row" to={`/resident/conversations/${item.conversationId}`}>
      <span className="conversation-icon"><IconDot3HorizontalChatbubbleLeftLine /></span>
      <div className="grow">
        <div className="row-title">
          <strong>{item.conversationTitle}</strong>
          <Badge tone={statusTone[item.statusCode] ?? "neutral"} variant="weak">{item.statusLabel}</Badge>
        </div>
        <p>{typeLabel[item.conversationType]} · {formatListTime(item.lastMessageAt)}</p>
      </div>
      <IconChevronRightLine />
    </Link>
  );
}
