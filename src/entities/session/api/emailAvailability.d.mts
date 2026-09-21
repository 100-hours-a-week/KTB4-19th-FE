export function emailAvailabilityFeedback(result: {
  isAvailable?: boolean;
  error?: string;
}): { message: string; tone: 'positive' | 'critical' };
