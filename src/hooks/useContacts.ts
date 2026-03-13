import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/lib/QuickChatProvider";
import { useAuth } from "@/contexts/AuthContext";
import { qk } from "@/lib/queryKeys";

export interface Contact {
  id: string;
  contact_id: string;
  profile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    is_online: boolean | null;
    last_seen: string | null;
  };
}

export const useContacts = () => {
  const { user } = useAuth();
  const supabase = useSupabase();
  return useQuery({
    queryKey: qk.contacts(user?.id),
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("contacts")
        .select("id, contact_id")
        .eq("user_id", user.id);
      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Batch: fetch all profiles in one query instead of one per contact
      const contactIds = data.map((c) => c.contact_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, is_online, last_seen")
        .in("id", contactIds);

      const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

      return data
        .map((c) => {
          const profile = profileMap[c.contact_id];
          if (!profile) return null;
          return { id: c.id, contact_id: c.contact_id, profile } satisfies Contact;
        })
        .filter((c): c is Contact => c !== null);
    },
    enabled: !!user,
  });
};

export const useAddContact = () => {
  const { user } = useAuth();
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contactId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("contacts").insert({ user_id: user.id, contact_id: contactId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.contacts(user?.id) }),
  });
};

export const useRemoveContact = () => {
  const { user } = useAuth();
  const supabase = useSupabase();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contactRowId: string) => {
      const { error } = await supabase.from("contacts").delete().eq("id", contactRowId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.contacts(user?.id) }),
  });
};

export const useSearchUsers = (query: string) => {
  const { user } = useAuth();
  const supabase = useSupabase();
  return useQuery({
    queryKey: qk.searchUsers(query),
    queryFn: async () => {
      if (!user || query.length < 2) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url, is_online")
        .neq("id", user.id)
        .ilike("display_name", `%${query}%`)
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user && query.length >= 2,
  });
};
