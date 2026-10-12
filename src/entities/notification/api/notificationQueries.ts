import {
  useInfiniteQuery,
  useQuery,
  type InfiniteData,
} from '@tanstack/react-query';
import { apiRequest } from '@/shared/api';
import type { NotificationPage, NotificationRead } from '../model/types';

export const notificationBase = '/users/me/notifications';
export const notificationKeys = {
  account: (userId: number | null) => ['notifications', userId] as const,
  list: (userId: number | null) =>
    [...notificationKeys.account(userId), 'list'] as const,
  count: (userId: number | null) =>
    [...notificationKeys.account(userId), 'unread-count'] as const,
};
export type NotificationData = InfiniteData<NotificationPage, number>;

export function useNotificationList(userId: number | null) {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(userId),
    queryFn: ({ pageParam, signal }) =>
      apiRequest<NotificationPage>(notificationBase, {
        query: { page: pageParam, size: 20 },
        signal,
      }),
    initialPageParam: 0,
    getNextPageParam: (page) => (page.hasNext ? page.page + 1 : undefined),
    enabled: userId !== null,
    refetchOnWindowFocus: false,
  });
}
export function useNotificationCount(userId: number | null) {
  return useQuery({
    queryKey: notificationKeys.count(userId),
    queryFn: ({ signal }) =>
      apiRequest<{ unreadCount: number }>(`${notificationBase}/unread-count`, {
        signal,
      }),
    enabled: userId !== null,
    refetchOnWindowFocus: false,
  });
}
export function markNotificationRead(userNotiId: number, signal: AbortSignal) {
  return apiRequest<NotificationRead>(`${notificationBase}/${userNotiId}`, {
    method: 'PATCH',
    body: { isRead: true },
    signal,
  });
}
