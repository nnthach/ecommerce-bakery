import { supabaseAdmin } from "@/lib/supabase";

export async function POST() {
  const { error } = await supabaseAdmin.rpc("publish_daily_menu");

  if (error) throw error;

  return Response.json({ success: true });
}
