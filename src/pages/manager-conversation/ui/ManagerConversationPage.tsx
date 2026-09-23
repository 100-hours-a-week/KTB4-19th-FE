import { useParams } from 'react-router-dom';
import {
  ConversationMessage,
  useManagerConversationMessages,
} from '@/entities/conversation';
import { isApiError } from '@/shared/api';
import { PageTitle, StateBoundary, type ViewState } from '@/shared/ui';

export function ManagerConversationPage() {
  const { conversationId } = useParams();
  const id = Number(conversationId);
  if (!Number.isInteger(id) || id < 1) {
    return <ConversationUnavailable title="대화를 찾을 수 없어요" />;
  }
  return <ManagerConversation key={id} conversationId={id} />;
}

function ManagerConversation({ conversationId }: { conversationId: number }) {
  const messagesQuery = useManagerConversationMessages(conversationId);
  const pages = messagesQuery.data?.pages;
  const conversation = pages?.[0];
  const messages = pages?.flatMap((page) => page.messages) ?? [];

  if (messagesQuery.isError) {
    const error = messagesQuery.error;
    if (isApiError(error) && error.status === 403) {
      return <ConversationUnavailable title="이 대화에 접근할 수 없어요" />;
    }
    if (isApiError(error) && error.status === 404) {
      return <ConversationUnavailable title="원본 대화를 찾을 수 없어요" />;
    }
  }

  const viewState: ViewState = messagesQuery.isPending
    ? 'loading'
    : messagesQuery.isError
      ? 'error'
      : messages.length === 0
        ? 'empty'
        : 'default';

  return (
    <>
      <PageTitle
        eyebrow={
          conversation?.complaintId ? `민원 #${conversation.complaintId}` : '민원'
        }
        title={conversation?.conversationTitle ?? 'AI 대화 원본'}
        description="입주민이 민원을 접수한 당시의 대화예요. 관리자는 읽기만 할 수 있어요."
      />
      <section className="panel readonly-chat">
        <StateBoundary
          state={viewState}
          onRetry={() => messagesQuery.refetch()}
          emptyTitle="대화 내용이 없어요"
        >
          {messagesQuery.hasNextPage && (
            <button
              className="text-link"
              type="button"
              onClick={() => messagesQuery.fetchNextPage()}
              disabled={messagesQuery.isFetchingNextPage}
            >
              {messagesQuery.isFetchingNextPage
                ? '불러오는 중'
                : '이전 대화 더 보기'}
            </button>
          )}
          {messages.map((message) => (
            <ConversationMessage key={message.messageId} message={message} />
          ))}
          <div className="readonly-notice">
            관리자 화면에서는 원본 대화에 메시지를 보낼 수 없어요.
          </div>
        </StateBoundary>
      </section>
    </>
  );
}

function ConversationUnavailable({ title }: { title: string }) {
  return (
    <>
      <PageTitle title={title} />
      <section className="panel readonly-chat">
        <div className="readonly-notice">
          민원 상세에서 다시 들어와 주세요.
        </div>
      </section>
    </>
  );
}
