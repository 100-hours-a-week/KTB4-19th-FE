type ContentBase = {
  complaintId: number;
  buildingId: number;
  title: string;
  occurredAt: string;
};
export type Notification = {
  userNotiId: number;
  notificationId: number;
  content: ContentBase &
    (
      | { type: 'COMPLAINT_CREATED'; roomNo: string }
      | {
          type: 'COMPLAINT_STATUS_CHANGED';
          statusCode: 'PENDING' | 'IN_PROGRESS' | 'DONE';
        }
    );
  readAt: string | null;
  createdAt: string;
};
export type NotificationPage = {
  totalCount: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  notifications: Notification[];
};
export type NotificationRead = {
  userNotiId: number;
  readAt: string;
  unreadCount: number;
};
