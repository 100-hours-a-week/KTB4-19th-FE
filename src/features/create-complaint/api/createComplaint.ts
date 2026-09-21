import { useMutation, useQueryClient } from '@tanstack/react-query';
import { complaintApi, complaintKeys } from '@/entities/complaint';
import { conversationKeys } from '@/entities/conversation';

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: complaintApi.create,
    // 성공 또는 이미 접수된 경우 모두 대화 상태(COMPLAINT_CREATED)를 다시 받아온다.
    onSettled: (_data, _error, request) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: conversationKeys.messages(request.conversationId),
        }),
        queryClient.invalidateQueries({ queryKey: conversationKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: complaintKeys.residentLists(),
        }),
      ]),
  });
}
