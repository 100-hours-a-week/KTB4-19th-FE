export { complaintApi } from '@/entities/complaint';
export { useCreateComplaint } from './api/createComplaint';
export type {
  ComplaintCreateRequest,
  ComplaintCreateResponse,
} from './model/types';
export { residentPhotos } from './lib/representativePhoto.mjs';
export {
  ComplaintSummaryCard,
  type ComplaintDraft,
} from './ui/ComplaintSummaryCard';
