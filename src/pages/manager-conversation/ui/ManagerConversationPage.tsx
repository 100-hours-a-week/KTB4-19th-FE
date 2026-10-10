import { useParams } from 'react-router-dom';
import { ActionButton } from 'seed-design/ui/action-button';
import {
  ConversationMessage,
  orderedMessages,
  useManagerConversationMessages,
  useOlderMessages,
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
  const { olderMessagesRef, loadOlderMessages } =
    useOlderMessages(messagesQuery);
  const pages = messagesQuery.data?.pages;
  const conversation = pages?.[0];
  const messages = pages ? orderedMessages(pages) : [];

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
          conversation?.complaintId
            ? `민원 #${conversation.complaintId}`
            : '민원'
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
            <div className="chat-load-more" ref={olderMessagesRef}>
              {messagesQuery.isFetchNextPageError ? (
                <ActionButton
                  variant="neutralWeak"
                  size="small"
                  onClick={loadOlderMessages}
                >
                  이전 대화 다시 불러오기
                </ActionButton>
              ) : (
                messagesQuery.isFetchingNextPage && (
                  <div className="skeleton-row" aria-label="불러오는 중" />
                )
              )}
            </div>
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
        <div className="readonly-notice">민원 상세에서 다시 들어와 주세요.</div>
      </section>
    </>
  );
}
