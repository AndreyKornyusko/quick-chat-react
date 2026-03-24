import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/lib/QuickChatProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo } from "react";
import type { Tables } from "@/integrations/supabase/types";
import { qk } from "@/lib/queryKeys";

const PAGE_SIZE = 30;

export type Message = Tables<"messages"> & {
  sender_profile?: { display_name: string; avatar_url: string | null };
  reply_to?: { content: string | null; sender_id: string } | null;
  forwarded_from_profile?: { display_name: string; sender_id: string } | null;
  read_by?: string[];
  _optimistic?: boolean;
  _status?: "sending" | "failed";
  _errorMsg?: string;
  _tempId?: string;
};

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const supabase = useSupabase();
  const qc = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: qk.messages(conversationId),
    queryFn: async ({ pageParam = 0 }) => {
      if (!conversationId || !user) return [];

      const from = pageParam;
      const to = pageParam + PAGE_SIZE - 1;

      const { data: msgs, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      if (!msgs || msgs.length === 0) return [];

      // --- Batch all enrichment queries ---

      // 1. Sender profiles (batch)
      const senderIds = [...new Set(msgs.map((m) => m.sender_id))];
      const { data: senderProfiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", senderIds);
      const senderMap = Object.fromEntries((senderProfiles ?? []).map((p) => [p.id, p]));

      // 2. Reply-to messages (batch)
      const replyIds = [...new Set(msgs.map((m) => m.reply_to_id).filter((id): id is string => !!id))];
      const replyMap: Record<string, { content: string | null; sender_id: string }> = {};
      if (replyIds.length > 0) {
        const { data: replyMsgs } = await supabase
          .from("messages")
          .select("id, content, sender_id")
          .in("id", replyIds);
        (replyMsgs ?? []).forEach((r) => { replyMap[r.id] = { content: r.content, sender_id: r.sender_id }; });
      }

      // 3. Forwarded-from messages + their profiles (batch)
      const fwdIds = [...new Set(msgs.map((m) => m.forwarded_from_id).filter((id): id is string => !!id))];
      const fwdProfileMap: Record<string, { display_name: string; sender_id: string }> = {};
      if (fwdIds.length > 0) {
        const { data: fwdMsgs } = await supabase
          .from("messages")
          .select("id, sender_id")
          .in("id", fwdIds);
        const fwdSenderIds = [...new Set((fwdMsgs ?? []).map((m) => m.sender_id))];
        if (fwdSenderIds.length > 0) {
          const { data: fwdProfiles } = await supabase
            .from("profiles")
            .select("id, display_name")
            .in("id", fwdSenderIds);
          const fwdSenderMap = Object.fromEntries((fwdProfiles ?? []).map((p) => [p.id, p.display_name]));
          (fwdMsgs ?? []).forEach((m) => {
            fwdProfileMap[m.id] = { display_name: fwdSenderMap[m.sender_id] ?? "Unknown", sender_id: m.sender_id };
          });
        }
      }

      // 4. Read receipts (batch)
      const msgIds = msgs.map((m) => m.id);
      const readsByMsg: Record<string, string[]> = {};
      msgIds.forEach((id) => { readsByMsg[id] = []; });
      const { data: reads } = await supabase
        .from("message_reads")
        .select("message_id, user_id")
        .in("message_id", msgIds);
      (reads ?? []).forEach((r) => {
        if (readsByMsg[r.message_id]) readsByMsg[r.message_id].push(r.user_id);
      });

      // Assemble enriched messages
      return msgs.map((msg) => ({
        ...msg,
        sender_profile: senderMap[msg.sender_id] ?? undefined,
        reply_to: msg.reply_to_id ? (replyMap[msg.reply_to_id] ?? null) : null,
        forwarded_from_profile: msg.forwarded_from_id ? (fwdProfileMap[msg.forwarded_from_id] ?? null) : null,
        read_by: readsByMsg[msg.id] ?? [],
      })) satisfies Message[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length === PAGE_SIZE) {
        return allPages.length * PAGE_SIZE;
      }
      return undefined;
    },
    enabled: !!conversationId && !!user,
  });

  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, () => {
        qc.invalidateQueries({ queryKey: qk.messages(conversationId) });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "message_reads", filter: `message_id=in.(select id from messages where conversation_id=eq.${conversationId})` }, () => {
        qc.invalidateQueries({ queryKey: qk.messages(conversationId) });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, qc, supabase]);

  const allMessages = useMemo(() => {
    if (!query.data) return [];
    const flat: Message[] = [];
    const pages = [...query.data.pages].reverse();
    for (const page of pages) {
      flat.push(...[...page].reverse());
    }
    return flat;
  }, [query.data]);

  return {
    messages: allMessages,
    isLoading: query.isLoading,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: !!query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
};

export const useUnreadMessageIds = (conversationId: string | null) => {
  const { user } = useAuth();
  const supabase = useSupabase();

  const query = useQuery({
    queryKey: qk.unreadIds(conversationId, user?.id),
    queryFn: async () => {
      if (!conversationId || !user) return new Set<string>();

      const { data: msgs } = await supabase
        .from("messages")
        .select("id")
        .eq("conversation_id", conversationId)
        .eq("is_deleted", false)
        .neq("sender_id", user.id);

      if (!msgs || msgs.length === 0) return new Set<string>();

      const msgIds = msgs.map((m) => m.id);
      const { data: reads } = await supabase
        .from("message_reads")
        .select("message_id")
        .eq("user_id", user.id)
        .in("message_id", msgIds);

      const readSet = new Set((reads ?? []).map((r) => r.message_id));
      return new Set(msgs.filter((m) => !readSet.has(m.id)).map((m) => m.id));
    },
    enabled: !!conversationId && !!user,
  });

  return query.data ?? new Set<string>();
};

export const useSendMessage = () => {
  const { user } = useAuth();
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (msg: {
      conversation_id: string;
      content?: string;
      type?: "text" | "photo" | "video" | "file" | "voice";
      file_url?: string;
      file_name?: string;
      file_size?: number;
      reply_to_id?: string;
      forwarded_from_id?: string;
      _tempId?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { _tempId, ...dbMsg } = msg;
      const { data, error } = await supabase.from("messages").insert({
        ...dbMsg,
        sender_id: user.id,
        type: dbMsg.type || "text",
      }).select("*").single();
      if (error) throw error;
      return { data, _tempId };
    },
    onMutate: async (msg) => {
      if (!user) return;
      const queryKey = qk.messages(msg.conversation_id);
      await qc.cancelQueries({ queryKey });

      const previous = qc.getQueryData(queryKey);

      // Look up reply_to from cache so the preview renders immediately
      let cachedReplyTo: { content: string | null; sender_id: string } | null = null;
      if (msg.reply_to_id) {
        const cached: any = previous;
        if (cached?.pages) {
          outer: for (const page of cached.pages as Message[][]) {
            for (const m of page) {
              if (m.id === msg.reply_to_id) {
                cachedReplyTo = { content: m.content, sender_id: m.sender_id };
                break outer;
              }
            }
          }
        }
      }

      const optimisticMessage: Message = {
        id: msg._tempId || `temp-${crypto.randomUUID()}`,
        conversation_id: msg.conversation_id,
        sender_id: user.id,
        content: msg.content ?? null,
        type: (msg.type || "text") as any,
        file_url: msg.file_url ?? null,
        file_name: msg.file_name ?? null,
        file_size: msg.file_size ?? null,
        reply_to_id: msg.reply_to_id ?? null,
        forwarded_from_id: msg.forwarded_from_id ?? null,
        is_edited: false,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender_profile: { display_name: user.user_metadata?.display_name || "You", avatar_url: null },
        read_by: [],
        reply_to: cachedReplyTo,
        _optimistic: true as any,
        _status: "sending" as any,
      };

      qc.setQueryData(queryKey, (old: any) => {
        if (!old?.pages) return old;
        const newPages = [...old.pages];
        newPages[0] = [optimisticMessage, ...(newPages[0] || [])];
        return { ...old, pages: newPages };
      });

      return { previous, tempId: optimisticMessage.id };
    },
    onSuccess: (result, vars) => {
      const queryKey = qk.messages(vars.conversation_id);
      qc.setQueryData(queryKey, (old: any) => {
        if (!old?.pages) return old;
        // Look up reply_to from cache so the preview persists after optimistic → real swap
        let reply_to: { content: string | null; sender_id: string } | null = null;
        if (result.data.reply_to_id) {
          outer: for (const page of old.pages as Message[][]) {
            for (const m of page) {
              if (m.id === result.data.reply_to_id) {
                reply_to = { content: m.content, sender_id: m.sender_id };
                break outer;
              }
            }
          }
        }
        const realMsg: Message = {
          ...result.data,
          sender_profile: { display_name: user!.user_metadata?.display_name || "You", avatar_url: null },
          read_by: [],
          reply_to,
        };
        return {
          ...old,
          pages: old.pages.map((page: Message[]) =>
            page.map((m: any) => (m.id === result._tempId || m.id === vars._tempId) ? realMsg : m)
          ),
        };
      });
      qc.invalidateQueries({ queryKey: qk.conversations(user?.id) });
    },
    onError: (_err, vars, context) => {
      const queryKey = qk.messages(vars.conversation_id);
      qc.setQueryData(queryKey, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: Message[]) =>
            page.map((m: any) => (m.id === context?.tempId || m.id === vars._tempId)
              ? { ...m, _status: "failed", _errorMsg: _err instanceof Error ? _err.message : "Send failed" }
              : m
            )
          ),
        };
      });
    },
  });
};

export const useEditMessage = () => {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content, conversationId }: { id: string; content: string; conversationId: string }) => {
      const { error } = await supabase.from("messages").update({ content, is_edited: true }).eq("id", id);
      if (error) throw error;
      return conversationId;
    },
    onSuccess: (conversationId) => {
      qc.invalidateQueries({ queryKey: qk.messages(conversationId) });
    },
  });
};

export const useDeleteMessage = () => {
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, conversationId }: { id: string; conversationId: string }) => {
      const { error } = await supabase.from("messages").update({ is_deleted: true, content: null }).eq("id", id);
      if (error) throw error;
      return conversationId;
    },
    onSuccess: (conversationId) => {
      qc.invalidateQueries({ queryKey: qk.messages(conversationId) });
    },
  });
};

export const useMarkAsRead = () => {
  const { user } = useAuth();
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageIds, conversationId }: { messageIds: string[]; conversationId: string }) => {
      if (!user || messageIds.length === 0) return;
      const inserts = messageIds.map((message_id) => ({ message_id, user_id: user.id }));
      await supabase.from("message_reads").upsert(inserts, { onConflict: "message_id,user_id" });
      return conversationId;
    },
    onSuccess: (conversationId) => {
      if (conversationId) {
        qc.invalidateQueries({ queryKey: qk.messages(conversationId) });
        qc.invalidateQueries({ queryKey: qk.conversations(user?.id) });
        qc.invalidateQueries({ queryKey: qk.unreadIds(conversationId, user?.id) });
      }
    },
  });
};
