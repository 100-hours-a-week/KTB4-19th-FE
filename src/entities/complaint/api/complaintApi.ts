import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api';
import type { ComplaintStatus } from '../model/types';

const managerBuildingBase = '/managers/me/building';
const managerComplaintsBase = '/managers/me/complaints';
const residentComplaintsBase = '/residents/me/complaints';

export type ManagerComplaintItem = {
  complaintId: number;
  buildingName: string;
  roomNo: string;
  title: string;
  statusCode: ComplaintStatus;
  statusLabel: string;
  urgency: number;
  isUrgent: boolean;
  fileUrl: string | null;
  createdAt: string;
};

export type ManagerComplaintListResponse = {
  totalCount: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  complaints: ManagerComplaintItem[];
};

export type ManagerComplaintSummaryResponse = {
  pendingCount: number;
  inProgressCount: number;
  weeklyDoneCount: number;
  totalCount: number;
};

export type ManagerComplaintDetailResponse = {
  complaintId: number;
  conversationId: number;
  conversationAvailable: boolean;
  buildingName: string;
  roomNo: string;
  title: string;
  statusCode: ComplaintStatus;
  statusLabel: string;
  urgency: number;
  isUrgent: boolean;
  location: string | null;
  occurredTime: string | null;
  symptom: string | null;
  aiSummary: string | null;
  attachmentCount: number;
  attachments: ComplaintAttachment[];
  createdAt: string;
  resolvedAt: string | null;
};

export type ComplaintAttachment = {
  attachmentId: number;
  fileUrl: string | null;
  originalName: string;
  fileType: string;
  fileSize: number;
  seq: number;
};

export type ComplaintStatusUpdateResponse = {
  complaintId: number;
  statusCode: ComplaintStatus;
  statusLabel: string;
  resolvedAt: string | null;
  updatedAt: string;
};

export type ResidentComplaintItem = {
  complaintId: number;
  title: string;
  statusCode: ComplaintStatus;
  statusLabel: string;
  fileUrl: string;
  createdAt: string;
};

export type ResidentComplaintListResponse = {
  totalCount: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  complaints: ResidentComplaintItem[];
};

export type ResidentComplaintAttachment = {
  attachmentId: number;
  fileUrl: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  seq: number;
};

export type ResidentComplaintDetailResponse = {
  complaintId: number;
  conversationId: number;
  conversationAvailable: boolean;
  buildingName: string;
  roomNo: string;
  title: string;
  statusCode: ComplaintStatus;
  statusLabel: string;
  location: string;
  occurredTime: string;
  symptom: string;
  aiSummary: string;
  attachmentCount: number;
  attachments: ResidentComplaintAttachment[];
  createdAt: string;
  resolvedAt: string;
};

export type ComplaintCreateRequest = {
  conversationId: number;
  location: string | null;
  occurredTime: string | null;
  symptom: string | null;
  attachmentIds: number[];
};

export type ComplaintCreateResponse = {
  complaintId: number;
  conversationId: number;
  title: string;
  statusCode: ComplaintStatus;
  statusLabel: string;
  buildingName: string;
  roomNo: string;
  location: string | null;
  occurredTime: string | null;
  symptom: string | null;
  attachmentCount: number;
  createdAt: string;
};

export type ManagerComplaintListParams = {
  keyword?: string;
  status?: readonly ComplaintStatus[];
  urgentOnly?: boolean;
  page?: number;
  size?: number;
};

export type ResidentComplaintListParams = {
  keyword?: string;
  status?: readonly ComplaintStatus[];
  page?: number;
  size?: number;
};

type NormalizedResidentComplaintListParams = Required<
  Pick<ResidentComplaintListParams, 'page' | 'size'>
> &
  Omit<ResidentComplaintListParams, 'page' | 'size'>;

export const complaintKeys = {
  all: ['complaints'] as const,
  managerLists: () => [...complaintKeys.all, 'manager', 'list'] as const,
  managerList: (
    params: Required<Pick<ManagerComplaintListParams, 'page' | 'size'>> &
      Omit<ManagerComplaintListParams, 'page' | 'size'>,
  ) => [...complaintKeys.managerLists(), params] as const,
  managerDetail: (complaintId: number) =>
    [...complaintKeys.all, 'manager', 'detail', complaintId] as const,
  residentLists: () => [...complaintKeys.all, 'resident', 'list'] as const,
  residentList: (params: NormalizedResidentComplaintListParams) =>
    [...complaintKeys.residentLists(), params] as const,
  residentDetail: (complaintId: number) =>
    [...complaintKeys.all, 'resident', 'detail', complaintId] as const,
  residentConnection: () =>
    [...complaintKeys.all, 'resident', 'connection'] as const,
};

export const complaintApi = {
  managerList: (params: ManagerComplaintListParams = {}) =>
    apiRequest<ManagerComplaintListResponse>(managerComplaintsBase, {
      query: {
        keyword: params.keyword,
        status: params.status,
        urgentOnly: params.urgentOnly,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    }),
  managerDetail: (complaintId: number) =>
    apiRequest<ManagerComplaintDetailResponse>(
      `${managerComplaintsBase}/${complaintId}`,
    ),
  updateManagerStatus: (complaintId: number, statusCode: ComplaintStatus) =>
    apiRequest<ComplaintStatusUpdateResponse>(
      `${managerComplaintsBase}/${complaintId}`,
      {
        method: 'PATCH',
        body: { statusCode },
      },
    ),
  managerSummary: () =>
    apiRequest<ManagerComplaintSummaryResponse>(
      `${managerBuildingBase}/complaints/summary`,
    ),
  create: (request: ComplaintCreateRequest) =>
    apiRequest<ComplaintCreateResponse>(residentComplaintsBase, {
      method: 'POST',
      body: request,
    }),
  residentList: (params: ResidentComplaintListParams = {}) =>
    apiRequest<ResidentComplaintListResponse>(residentComplaintsBase, {
      query: {
        keyword: params.keyword,
        status: params.status,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    }),
  residentDetail: (complaintId: number) =>
    apiRequest<ResidentComplaintDetailResponse>(
      `${residentComplaintsBase}/${complaintId}`,
    ),
};

export function useManagerComplaints(params: ManagerComplaintListParams = {}) {
  const normalized = {
    keyword: params.keyword?.trim() || undefined,
    status: params.status,
    urgentOnly: params.urgentOnly,
    page: params.page ?? 0,
    size: params.size ?? 20,
  };
  return useQuery({
    queryKey: complaintKeys.managerList(normalized),
    queryFn: () => complaintApi.managerList(normalized),
  });
}

export function useManagerComplaint(complaintId: number) {
  return useQuery({
    queryKey: complaintKeys.managerDetail(complaintId),
    queryFn: () => complaintApi.managerDetail(complaintId),
  });
}

export function useResidentComplaints(
  params: ResidentComplaintListParams = {},
) {
  const normalized: NormalizedResidentComplaintListParams = {
    keyword: params.keyword?.trim() || undefined,
    status: params.status,
    page: params.page ?? 0,
    size: params.size ?? 20,
  };
  return useQuery({
    queryKey: complaintKeys.residentList(normalized),
    queryFn: () => complaintApi.residentList(normalized),
  });
}

// ponytail: reuse the existing resident complaint permission check until the BE exposes a room-status endpoint.
export function useResidentConnection() {
  return useQuery({
    queryKey: complaintKeys.residentConnection(),
    queryFn: () => complaintApi.residentList({ page: 0, size: 1 }),
    retry: false,
  });
}

export function useResidentComplaint(complaintId: number) {
  return useQuery({
    queryKey: complaintKeys.residentDetail(complaintId),
    queryFn: () => complaintApi.residentDetail(complaintId),
  });
}

export function useUpdateManagerComplaintStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      complaintId,
      statusCode,
    }: {
      complaintId: number;
      statusCode: ComplaintStatus;
    }) => complaintApi.updateManagerStatus(complaintId, statusCode),
    onSuccess: (_result, { complaintId }) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: complaintKeys.managerLists(),
        }),
        queryClient.invalidateQueries({
          queryKey: complaintKeys.managerDetail(complaintId),
        }),
      ]),
  });
}
