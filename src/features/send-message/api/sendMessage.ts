import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  conversationApi,
  conversationKeys,
  conversationMessagesQuery,
  type Message,
  type MessagesData,
  type MessageSendResponse,
} from '@/entities/conversation';
import { fileApi } from '@/entities/file';
import type { SelectedImage } from '../lib/selectedImage';

export type MessageDraft = { content: string; images: SelectedImage[] };

export class ImageUploadError extends Error {
  constructor() {
    super('사진을 올리지 못했어요.');
    this.name = 'ImageUploadError';
  }
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ content, images }: MessageDraft) => {
      const attachmentIds = await uploadImages(images);
      const created = await conversationApi.start({ content, attachmentIds });
      // 화면 전환 전에 대화 상세를 미리 받아 전송 중 상태가 끊기지 않게 한다.
      await queryClient.prefetchInfiniteQuery(
        conversationMessagesQuery(created.conversationId),
      );
      return created;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() }),
  });
}

export function useSendMessage(conversationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ content, images }: MessageDraft) => {
      const attachmentIds = await uploadImages(images);
      return conversationApi.send(conversationId, { content, attachmentIds });
    },
    onSuccess: (sent) => {
      queryClient.setQueryData<MessagesData>(
        conversationKeys.messages(conversationId),
        (data) =>
          appendTurn(data, [toResidentMessage(sent), sent.assistantMessage]),
      );
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
}

export function useResolveConversation(conversationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => conversationApi.resolve(conversationId),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: conversationKeys.messages(conversationId),
        }),
        queryClient.invalidateQueries({ queryKey: conversationKeys.lists() }),
      ]),
  });
}

async function uploadImages(images: SelectedImage[]) {
  try {
    return await Promise.all(
      images.map(async ({ file }) => {
        const upload = await fileApi.createUpload(file);
        await fileApi.uploadToS3(upload, file);
        await fileApi.complete(upload.attachmentId);
        return upload.attachmentId;
      }),
    );
  } catch {
    throw new ImageUploadError();
  }
}

/** 이번 턴의 메시지를 최신 페이지에 반영한다. 접수 확인 카드는 AI 메시지에 실려 온다. */
function appendTurn(
  data: MessagesData | undefined,
  messages: Message[],
): MessagesData | undefined {
  if (!data || data.pages.length === 0) return data;
  const [latest, ...older] = data.pages;
  return {
    ...data,
    pages: [
      { ...latest, messages: [...latest.messages, ...messages] },
      ...older,
    ],
  };
}

function toResidentMessage(sent: MessageSendResponse): Message {
  return {
    messageId: sent.messageId,
    senderType: sent.senderType,
    messageType: sent.messageType,
    content: sent.content,
    attachments: sent.attachments,
    createdAt: sent.createdAt,
  };
}
