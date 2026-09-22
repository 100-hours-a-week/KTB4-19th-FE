import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api';

const managerBuildingBase = '/managers/me/building';

export type BuildingRegistrationRequest = {
  buildingName: string | null;
  roadAddress: string;
};

export type BuildingResponse = {
  buildingId: number;
  buildingName: string | null;
  roadAddress: string;
};

export type BuildingDetailResponse = BuildingResponse & {
  totalRoomCount: number;
  updatedAt: string;
};

export const buildingApi = {
  register: (request: BuildingRegistrationRequest) =>
    apiRequest<BuildingResponse>(managerBuildingBase, {
      method: 'POST',
      body: request,
    }),
  detail: () => apiRequest<BuildingDetailResponse>(managerBuildingBase),
};

export const buildingKeys = {
  detail: () => ['buildings', 'manager', 'detail'] as const,
};

export function useManagerBuilding(enabled = true) {
  return useQuery({
    queryKey: buildingKeys.detail(),
    queryFn: () => buildingApi.detail(),
    enabled,
  });
}
