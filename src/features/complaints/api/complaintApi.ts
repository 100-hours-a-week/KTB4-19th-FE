import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../shared/api/client";
import { conversationKeys } from "../../conversations/api/conversationQueries";
import type { ComplaintCreateRequest, ComplaintCreateResponse } from "../model/types";

export const complaintApi = {
  create: (request: ComplaintCreateRequest) =>
    apiRequest<ComplaintCreateResponse>("/residents/me/complaints", { method: "POST", body: request }),
};

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: complaintApi.create,
    // 성공 또는 이미 접수된 경우 모두 대화 상태(COMPLAINT_CREATED)를 다시 받아온다.
    onSettled: (_data, _error, request) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: conversationKeys.messages(request.conversationId) }),
        queryClient.invalidateQueries({ queryKey: conversationKeys.lists() }),
      ]),
  });
}
