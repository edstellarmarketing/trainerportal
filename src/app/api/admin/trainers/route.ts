import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "created_at";
  const order = searchParams.get("order") || "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  let query = supabase
    .from("trainers")
    .select("*", { count: "exact" });

  // Search by name, email, city
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,location_city.ilike.%${search}%`
    );
  }

  // Filter by status
  if (status) {
    query = query.eq("status", status);
  }

  // Sort
  const ascending = order === "asc";
  query = query.order(sort, { ascending });

  // Pagination
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    trainers: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, status, reviewerNotes } = body;

  if (!id || !status) {
    return NextResponse.json(
      { error: "id and status are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const updates: Record<string, unknown> = { status };
  if (status === "approved") {
    updates.approved_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("trainers")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log verification step if approving/rejecting
  if (status === "approved" || status === "rejected") {
    await supabase.from("verification_steps").upsert(
      {
        trainer_id: id,
        step_number: 1,
        step_name: "profile_screening",
        status: status === "approved" ? "approved" : "rejected",
        reviewer_notes: reviewerNotes || null,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "trainer_id,step_number" }
    );
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, ...fields } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const updates: Record<string, unknown> = {};
  const fieldMap: Record<string, string> = {
    firstName: "first_name",
    lastName: "last_name",
    email: "email",
    phone: "phone",
    locationCity: "location_city",
    locationCountry: "location_country",
    linkedinUrl: "linkedin_url",
    bio: "bio",
    primaryDomains: "primary_domains",
    secondaryDomains: "secondary_domains",
    topicsTrained: "topics_trained",
    yearsOfExperience: "years_of_experience",
    totalSessionsDelivered: "total_sessions_delivered",
    preferredGroupSizeMin: "preferred_group_size_min",
    preferredGroupSizeMax: "preferred_group_size_max",
    deliveryFormats: "delivery_formats",
    certifications: "certifications",
    sampleVideoUrl: "sample_video_url",
    dayRateUsd: "day_rate_usd",
    hourlyRateUsd: "hourly_rate_usd",
    rateNotes: "rate_notes",
  };

  for (const [key, value] of Object.entries(fields)) {
    const dbCol = fieldMap[key];
    if (dbCol) {
      updates[dbCol] = value === "" ? null : value;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error } = await supabase
    .from("trainers")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
