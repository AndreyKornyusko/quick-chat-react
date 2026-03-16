import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/lib/QuickChatProvider";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";
import { qk } from "@/lib/queryKeys";

export type Profile = Tables<"profiles">;

export const useProfile = () => {
  const { user } = useAuth();
  const supabase = useSupabase();

  return useQuery({
    queryKey: qk.profile(user?.id),
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!user,
  });
};

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  const supabase = useSupabase();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user) throw new Error("Not authenticated");
      // Whitelist mutable fields — prevents mass-assignment of id, created_at, etc.
      const { display_name, bio, avatar_url } = updates;
      const safeUpdates = Object.fromEntries(
        Object.entries({ display_name, bio, avatar_url }).filter(([, v]) => v !== undefined)
      );
      const { error } = await supabase.from("profiles").update(safeUpdates).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      // Scoped to the current user's profile only
      qc.invalidateQueries({ queryKey: qk.profile(user?.id) });
    },
  });
};
