import { createAdminClient } from "@/lib/supabase/admin";
import { getTrainerEmail } from "@/lib/get-trainer";
import { NextResponse } from "next/server";

export async function GET() {
  const email = await getTrainerEmail();
  if (!email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Get trainer ID
  const { data: trainer } = await supabase
    .from("trainers")
    .select("id")
    .eq("email", email)
    .single();

  if (!trainer) {
    return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
  }

  // Get sessions
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("trainer_id", trainer.id)
    .order("session_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions: sessions || [] });
}
