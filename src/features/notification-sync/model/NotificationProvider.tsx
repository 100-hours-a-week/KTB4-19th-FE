import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { conversationReplyEvents } from '@/entities/conversation';
import { useAuth, useOnboardingStatus } from '@/entities/session';
import {
  notificationBase,
  notificationKeys,
  startNotificationStream,
  useNotificationList,
  useNotificationCount,
  type StreamStatus,
} from '@/entities/notification';
import { reissueAccessToken, tokenStore } from '@/shared/api';
import { apiBase } from '@/shared/config';

const context = createContext<{
  userId: number | null;
  status: StreamStatus;
  refresh: () => void;
  retry: () => void;
} | null>(null);
export function NotificationProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { pathname } = useLocation();
  const home =
    auth.status !== 'authenticated' || auth.user.userRole === 'NONE'
      ? null
      : auth.user.userRole === 'MANAGER'
        ? '/manager'
        : '/resident';
  const inApp =
    home !== null &&
    (pathname === home || pathname.startsWith(`${home}/`)) &&
    ![
      '/manager/onboarding/profile',
      '/manager/building/new',
      '/manager/building/rooms/bulk',
      '/resident/connect',
    ].includes(pathname);
  const completedOnboarding =
    inApp &&
    auth.status === 'authenticated' &&
    auth.user.onboarding?.userRole === auth.user.userRole &&
    auth.user.onboarding.nextStep === 'HOME'
      ? auth.user.onboarding
      : undefined;
  const onboarding = useOnboardingStatus(inApp, completedOnboarding);
  const userId =
    auth.status === 'authenticated' &&
    inApp &&
    onboarding.isSuccess &&
    onboarding.data.userRole === auth.user.userRole &&
    onboarding.data.nextStep === 'HOME'
      ? auth.user.userId
      : null;
  const client = useQueryClient();
  const [status, setStatus] = useState<StreamStatus>('connecting');
  const [attempt, setAttempt] = useState(0);
  useNotificationList(userId);
  useNotificationCount(userId);
  useEffect(() => {
    if (userId === null) return;
    let live = true;
    const sync = () => {
      if (live)
        void client.invalidateQueries({
          queryKey: notificationKeys.account(userId),
        });
    };
    const stop = startNotificationStream({
      url: `${apiBase}${notificationBase}/stream`,
      tokens: tokenStore,
      reissue: reissueAccessToken,
      sync,
      relayEvents: conversationReplyEvents,
      onStatus: (value) => {
        if (live) setStatus(value);
      },
    });
    const unsubscribe = tokenStore.subscribe((token) => {
      if (token === null) {
        live = false;
        stop();
        void client.cancelQueries({
          queryKey: notificationKeys.account(userId),
        });
        client.removeQueries({ queryKey: notificationKeys.account(userId) });
      }
    });
    return () => {
      live = false;
      stop();
      unsubscribe();
    };
  }, [userId, client, attempt]);
  useEffect(
    () => () => {
      if (userId !== null) {
        void client.cancelQueries({
          queryKey: notificationKeys.account(userId),
        });
        client.removeQueries({ queryKey: notificationKeys.account(userId) });
      }
    },
    [client, userId],
  );
  const refresh = () => {
    if (userId === null) return;
    void client.invalidateQueries({
      queryKey: notificationKeys.account(userId),
    });
  };
  const retry = () => {
    if (userId === null) return;
    refresh();
    setAttempt((value) => value + 1);
  };
  return (
    <context.Provider value={{ userId, status, refresh, retry }}>
      {children}
    </context.Provider>
  );
}
export function useNotificationSession() {
  const value = useContext(context);
  if (!value) throw new Error('NotificationProvider is required');
  return value;
}
