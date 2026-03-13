import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/lib/QuickChatProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { qk } from "@/lib/queryKeys";

export interface ConversationWithDetails {
  id: string;
  type: "private" | "group";
  name: string | null;
  avatar_url: string | null;
  updated_at: string;
  members: { user_id: string; role: string; profile: { id: string; display_name: string; avatar_url: string | null; is_online: boolean | null; last_seen: string | null } }[];
  last_message?: { content: string | null; type: string; created_at: string; sender_id: string } | null;
  unread_count: number;
}

export const useConversations = () => {
  const { user } = useAuth();
  const supabase = useSupabase();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: qk.conversations(user?.id),
    queryFn: async () => {
      if (!user) return [];

      // 1. Get conversation IDs for this user
      const { data: convMembers, error: cmErr } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", user.id);
      if (cmErr) throw cmErr;

      const convIds = convMembers?.map((cm) => cm.conversation_id) ?? [];
      if (convIds.length === 0) return [];

      // 2. Fetch all conversations in one query
      const { data: conversations, error: cErr } = await supabase
        .from("conversations")
        .select("*")
        .in("id", convIds)
        .order("updated_at", { ascending: false });
      if (cErr) throw cErr;
      if (!conversations || conversations.length === 0) return [];

      // 3. Batch: fetch ALL members for ALL conversations in one query
      const { data: allMembers } = await supabase
        .from("conversation_members")
        .select("conversation_id, user_id, role")
        .in("conversation_id", convIds);

      // 4. Batch: fetch ALL profiles for ALL members in one query
      const allMemberUserIds = [...new Set((allMembers ?? []).map((m) => m.user_id))];
      const profileMap: Record<string, { id: string; display_name: string; avatar_url: string | null; is_online: boolean | null; last_seen: string | null }> = {};
      if (allMemberUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url, is_online, last_seen")
          .in("id", allMemberUserIds);
        (profiles ?? []).forEach((p) => { profileMap[p.id] = p; });
      }

      // Build per-conversation member list from batch results
      const membersByConv: Record<string, { user_id: string; role: string; profile: typeof profileMap[string] }[]> = {};
      for (const m of allMembers ?? []) {
        if (!membersByConv[m.conversation_id]) membersByConv[m.conversation_id] = [];
        const profile = profileMap[m.user_id];
        if (profile) membersByConv[m.conversation_id].push({ user_id: m.user_id, role: m.role, profile });
      }

      // 5. Batch: fetch ALL messages for unread counting in one query
      const { data: allMsgs } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id")
        .in("conversation_id", convIds)
        .eq("is_deleted", false)
        .neq("sender_id", user.id);

      const allMsgIds = (allMsgs ?? []).map((m) => m.id);
      const msgsByConv: Record<string, string[]> = {};
      for (const m of allMsgs ?? []) {
        if (!msgsByConv[m.conversation_id]) msgsByConv[m.conversation_id] = [];
        msgsByConv[m.conversation_id].push(m.id);
      }

      // 6. Batch: fetch ALL reads in one query
      const readSet = new Set<string>();
      if (allMsgIds.length > 0) {
        // Batch in chunks of 500 to stay within URL limits
        for (let i = 0; i < allMsgIds.length; i += 500) {
          const chunk = allMsgIds.slice(i, i + 500);
          const { data: reads } = await supabase
            .from("message_reads")
            .select("message_id")
            .eq("user_id", user.id)
            .in("message_id", chunk);
          (reads ?? []).forEach((r) => readSet.add(r.message_id));
        }
      }

      // 7. Batch: fetch last messages for all conversations in parallel
      const lastMsgResults = await Promise.all(
        conversations.map((conv) =>
          supabase
            .from("messages")
            .select("content, type, created_at, sender_id")
            .eq("conversation_id", conv.id)
            .eq("is_deleted", false)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()
        )
      );

      return conversations.map((conv, i) => {
        const convMsgIds = msgsByConv[conv.id] ?? [];
        const unreadCount = convMsgIds.filter((id) => !readSet.has(id)).length;
        return {
          id: conv.id,
          type: conv.type,
          name: conv.name,
          avatar_url: conv.avatar_url,
          updated_at: conv.updated_at,
          members: membersByConv[conv.id] ?? [],
          last_message: lastMsgResults[i].data ?? null,
          unread_count: unreadCount,
        } satisfies ConversationWithDetails;
      });
    },
    enabled: !!user,
    // refetchInterval removed — realtime subscription handles updates
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("conversations-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        qc.invalidateQueries({ queryKey: qk.conversations(user.id) });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "conversation_members" }, () => {
        qc.invalidateQueries({ queryKey: qk.conversations(user.id) });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, qc, supabase]);

  return query;
};

export const useCreatePrivateConversation = () => {
  const { user } = useAuth();
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { data: myConvs } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", user.id);

      const { data: theirConvs } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", contactId);

      const myIds = new Set(myConvs?.map((c) => c.conversation_id));
      const sharedIds = theirConvs?.filter((c) => myIds.has(c.conversation_id)).map((c) => c.conversation_id) ?? [];

      if (sharedIds.length > 0) {
        const { data: existing } = await supabase
          .from("conversations")
          .select("id")
          .in("id", sharedIds)
          .eq("type", "private")
          .limit(1)
          .maybeSingle();
        if (existing) return existing.id;
      }

      const { data: conv, error } = await supabase
        .from("conversations")
        .insert({ type: "private", created_by: user.id })
        .select("id")
        .single();
      if (error) throw error;

      const { error: ownerErr } = await supabase.from("conversation_members").insert({ conversation_id: conv.id, user_id: user.id, role: "owner" });
      if (ownerErr) throw ownerErr;
      const { error: memberErr } = await supabase.from("conversation_members").insert({ conversation_id: conv.id, user_id: contactId, role: "member" });
      if (memberErr) throw memberErr;

      return conv.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.conversations(user?.id) });
    },
  });
};

export const useCreateGroupConversation = () => {
  const { user } = useAuth();
  const supabase = useSupabase();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, memberIds }: { name: string; memberIds: string[] }) => {
      if (!user) throw new Error("Not authenticated");

      const { data: conv, error } = await supabase
        .from("conversations")
        .insert({ type: "group", name, created_by: user.id })
        .select("id")
        .single();
      if (error) throw error;

      const { error: ownerErr } = await supabase.from("conversation_members").insert({ conversation_id: conv.id, user_id: user.id, role: "owner" as const });
      if (ownerErr) throw ownerErr;

      if (memberIds.length > 0) {
        const otherMembers = memberIds.map((id) => ({ conversation_id: conv.id, user_id: id, role: "member" as const }));
        const { error: membersErr } = await supabase.from("conversation_members").insert(otherMembers);
        if (membersErr) throw membersErr;
      }
      return conv.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.conversations(user?.id) });
    },
  });
};
