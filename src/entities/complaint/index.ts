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
export type { ComplaintStatus, ComplaintType } from './model/types';
export { ComplaintStatusBadge } from './ui/ComplaintStatusBadge';
export { ComplaintTypeBadge } from './ui/ComplaintTypeBadge';
export { ComplaintPhotoGrid } from './ui/ComplaintPhotoGrid';
export { ComplaintThumbnail } from './ui/ComplaintThumbnail';
export {
  canChangeComplaintStatus,
  complaintStatusOrder,
  nextComplaintStatus,
} from './lib/complaintStatusFlow.mjs';
