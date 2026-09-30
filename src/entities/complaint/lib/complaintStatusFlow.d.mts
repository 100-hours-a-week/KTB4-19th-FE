import type { ComplaintStatus } from '../model/types';

export const complaintStatusOrder: readonly ComplaintStatus[];

export function nextComplaintStatus(
  status: ComplaintStatus,
): ComplaintStatus | null;

export function canChangeComplaintStatus(
  from: ComplaintStatus,
  to: ComplaintStatus,
): boolean;
