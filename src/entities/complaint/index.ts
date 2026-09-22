export {
  complaintApi,
  complaintKeys,
  useManagerComplaint,
  useManagerComplaintSummary,
  useManagerComplaints,
  useResidentComplaint,
  useResidentConnection,
  useResidentComplaints,
  useUpdateManagerComplaintStatus,
  type ComplaintAttachment,
  type ComplaintCreateRequest,
  type ComplaintCreateResponse,
  type ComplaintStatusUpdateResponse,
  type ManagerComplaintDetailResponse,
  type ManagerComplaintItem,
  type ManagerComplaintListResponse,
  type ManagerComplaintListParams,
  type ManagerComplaintSummaryResponse,
  type ResidentComplaintAttachment,
  type ResidentComplaintDetailResponse,
  type ResidentComplaintItem,
  type ResidentComplaintListParams,
  type ResidentComplaintListResponse,
} from './api/complaintApi';
export { complaints } from './model/mock';
export type { ComplaintStatus } from './model/types';
export { ComplaintStatusBadge } from './ui/ComplaintStatusBadge';
