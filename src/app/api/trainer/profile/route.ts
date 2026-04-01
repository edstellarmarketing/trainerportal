import { createAdminClient } from "@/lib/supabase/admin";
import { getTrainerEmail } from "@/lib/get-trainer";
import { NextResponse } from "next/server";

export async function GET() {
  const email = await getTrainerEmail();
  if (!email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("trainers")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Trainer profile not found" },
      { status: 404 }
    );
  }

  // Calculate profile completeness
  const fields = [
    data.first_name,
    data.last_name,
    data.email,
    data.phone,
    data.location_city,
    data.location_country,
    data.bio,
    data.linkedin_url,
    data.headshot_url,
    data.primary_domains?.length > 0,
    data.years_of_experience != null,
    data.delivery_formats?.length > 0,
    data.topics_trained?.length > 0,
    data.certifications?.length > 0,
    data.day_rate_usd != null,
    data.hourly_rate_usd != null,
  ];
  const filled = fields.filter(Boolean).length;
  const completeness = Math.round((filled / fields.length) * 100);

  // Suggestions for incomplete fields
  const suggestions: string[] = [];
  if (!data.bio) suggestions.push("Add a professional bio");
  if (!data.linkedin_url) suggestions.push("Add your LinkedIn URL");
  if (!data.headshot_url) suggestions.push("Upload a headshot photo");
  if (!data.primary_domains?.length) suggestions.push("Select your training domains");
  if (!data.topics_trained?.length) suggestions.push("List your training topics");
  if (!data.certifications?.length) suggestions.push("Add your certifications");
  if (data.day_rate_usd == null) suggestions.push("Set your day rate");

  return NextResponse.json({ trainer: data, completeness, suggestions });
}

export async function PUT(request: Request) {
  const email = await getTrainerEmail();
  if (!email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const supabase = createAdminClient();

  const fieldMap: Record<string, string> = {
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
    sampleVideoUrl: "sample_video_url",
    dayRateUsd: "day_rate_usd",
    hourlyRateUsd: "hourly_rate_usd",
    rateNotes: "rate_notes",
    availability: "availability",
  };

  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
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
    .eq("email", email);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
