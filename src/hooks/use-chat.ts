import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth';
import {
  getChatMessages,
  markChatMessagesRead,
  sendChatMessage,
  type ChatMessageModel,
} from '@/lib/api';

export const chatKeys = {
  all: ['chat-messages'] as const,
};

/** Loads the conversation and polls every 15s — only while `enabled` (widget open) and logged in */
export function useChatMessages(enabled: boolean) {
  const { user } = useAuth();
  return useQuery({
    queryKey: chatKeys.all,
    queryFn: () => getChatMessages(),
    enabled: enabled && !!user,
    refetchInterval: enabled && !!user ? 15_000 : false,
    refetchOnWindowFocus: true,
  });
}

export function useSendChatMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (msg) => {
      if (msg) {
        qc.setQueryData<ChatMessageModel[]>(chatKeys.all, (old) => [...(old ?? []), msg]);
      } else {
        qc.invalidateQueries({ queryKey: chatKeys.all });
      }
    },
  });
}

export function useMarkChatRead() {
  return useMutation({ mutationFn: markChatMessagesRead });
}
