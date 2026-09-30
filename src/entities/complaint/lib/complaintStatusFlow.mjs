export const complaintStatusOrder = ['PENDING', 'IN_PROGRESS', 'DONE'];

export function nextComplaintStatus(status) {
  const index = complaintStatusOrder.indexOf(status);
  if (index < 0) return null;
  return complaintStatusOrder[index + 1] ?? null;
}

export function canChangeComplaintStatus(from, to) {
  return nextComplaintStatus(from) === to;
}
