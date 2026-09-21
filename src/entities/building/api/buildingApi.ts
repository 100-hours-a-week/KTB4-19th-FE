import { apiRequest } from "@/shared/api";

export type BuildingRegistrationRequest = {
  buildingName: string | null;
  roadAddress: string;
};

export type BuildingResponse = {
  buildingId: number;
  buildingName: string | null;
  roadAddress: string;
  accessToken?: string | null;
  tokenType?: "Bearer" | null;
};

export const buildingApi = {
  register: (request: BuildingRegistrationRequest) =>
    apiRequest<BuildingResponse>("/managers/me/buildings", { method: "POST", body: request }),
};
