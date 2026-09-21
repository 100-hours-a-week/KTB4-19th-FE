import { apiRequest } from '@/shared/api';

const managerBuildingsBase = '/managers/me/buildings';

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
    apiRequest<BuildingResponse>(managerBuildingsBase, {
      method: 'POST',
      body: request,
    }),
  detail: (buildingId: number) =>
    apiRequest<BuildingDetailResponse>(`${managerBuildingsBase}/${buildingId}`),
};
