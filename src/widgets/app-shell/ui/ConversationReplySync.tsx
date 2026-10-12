import { useNotificationSession } from '@/features/notification-sync';
import { useConversationReplySync } from '@/features/send-message';

export function ConversationReplySync() {
  const { status } = useNotificationSession();
  useConversationReplySync(status);
  return null;
}
