import type { ComplaintStatus } from "@/entities/complaint";

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
  location: string;
  occurredTime: string;
  symptom: string;
  attachmentCount: number;
  createdAt: string;
};
