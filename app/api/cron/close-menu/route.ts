import { deleteCacheByResource } from "@/lib/redis-cache";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST() {
  const { error } = await supabaseAdmin.rpc("close_daily_menu");

  if (error) throw error;

  void deleteCacheByResource("products");

  return Response.json({ success: true });
}
