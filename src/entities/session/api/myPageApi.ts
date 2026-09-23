import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api';

export type ManagerMyPageResponse = {
  userId: number;
  userName: string | null;
  email: string;
  phone: string | null;
  buildingId: number | null;
  buildingName: string | null;
  roadAddress: string | null;
};

export type ResidentMyPageResponse = {
  userId: number;
  userName: string | null;
  email: string;
  phone: string | null;
  roomId: number;
  buildingName: string;
  roomNo: string;
  managerName: string | null;
  managerPhone: string | null;
};

const myPageKeys = {
  manager: () => ['my-page', 'manager'] as const,
  resident: () => ['my-page', 'resident'] as const,
};

export const myPageApi = {
  manager: () => apiRequest<ManagerMyPageResponse>('/managers/me'),
  resident: () => apiRequest<ResidentMyPageResponse>('/residents/me'),
};

export function useManagerMyPage(enabled = true) {
  return useQuery({
    queryKey: myPageKeys.manager(),
    queryFn: myPageApi.manager,
    enabled,
  });
}

export function useResidentMyPage(enabled = true) {
  return useQuery({
    queryKey: myPageKeys.resident(),
    queryFn: myPageApi.resident,
    enabled,
  });
}
