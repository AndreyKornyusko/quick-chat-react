import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/lib/QuickChatProvider";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;

export const useProfile = () => {
  const { user } = useAuth();
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["profile", user?.id],
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
      const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
