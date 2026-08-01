import { createClient } from "@/app/lib/supabase/client";

export async function getPostAuthDestination(userId: string): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.username ? "/" : "/auth/onboarding";
}
