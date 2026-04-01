import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Get matched trainers
  const { data: matches, error } = await supabase
    .from("enquiry_matches")
    .select("*")
    .eq("enquiry_id", id)
    .order("match_score", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get trainer details for each match
  const trainerIds = (matches || []).map((m) => m.trainer_id);
  let trainers: Record<string, unknown>[] = [];
  if (trainerIds.length > 0) {
    const { data } = await supabase
      .from("trainers")
      .select("id, first_name, last_name, email, primary_domains, location_city, location_country, rating_avg, day_rate_usd, status")
      .in("id", trainerIds);
    trainers = data || [];
  }

  // Merge
  const merged = (matches || []).map((m) => ({
    ...m,
    trainer: trainers.find((t) => t.id === m.trainer_id) || null,
  }));

  return NextResponse.json({ matches: merged });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { trainerId, adminNotes } = await request.json();

  if (!trainerId) {
    return NextResponse.json({ error: "trainerId required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("enquiry_matches").upsert(
    {
      enquiry_id: id,
      trainer_id: trainerId,
      admin_notes: adminNotes || null,
      status: "shortlisted",
    },
    { onConflict: "enquiry_id,trainer_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update enquiry status to matching
  await supabase
    .from("enquiries")
    .update({ status: "matching" })
    .eq("id", id)
    .eq("status", "new");

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const trainerId = searchParams.get("trainerId");

  if (!trainerId) {
    return NextResponse.json({ error: "trainerId required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("enquiry_matches")
    .delete()
    .eq("enquiry_id", id)
    .eq("trainer_id", trainerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
