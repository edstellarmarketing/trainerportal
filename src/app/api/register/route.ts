import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const rawData = formData.get("data");
    if (!rawData || typeof rawData !== "string") {
      return NextResponse.json(
        { error: "Missing form data" },
        { status: 400 }
      );
    }

    const data = JSON.parse(rawData);
    const supabase = createAdminClient();

    // Upload files to Supabase Storage
    const headshot = formData.get("headshot") as File | null;
    const sampleOutline = formData.get("sampleOutline") as File | null;
    const sampleSlides = formData.get("sampleSlides") as File | null;

    const timestamp = Date.now();
    const emailSlug = data.email.replace(/[^a-zA-Z0-9]/g, "_");

    let headshotUrl: string | null = null;
    let sampleOutlineUrl: string | null = null;
    let sampleSlidesUrl: string | null = null;

    if (headshot && headshot.size > 0) {
      const ext = headshot.name.split(".").pop();
      const path = `trainers/${emailSlug}/headshot_${timestamp}.${ext}`;
      const { error } = await supabase.storage
        .from("uploads")
        .upload(path, headshot);
      if (!error) {
        const { data: urlData } = supabase.storage
          .from("uploads")
          .getPublicUrl(path);
        headshotUrl = urlData.publicUrl;
      }
    }

    if (sampleOutline && sampleOutline.size > 0) {
      const ext = sampleOutline.name.split(".").pop();
      const path = `trainers/${emailSlug}/outline_${timestamp}.${ext}`;
      const { error } = await supabase.storage
        .from("uploads")
        .upload(path, sampleOutline);
      if (!error) {
        const { data: urlData } = supabase.storage
          .from("uploads")
          .getPublicUrl(path);
        sampleOutlineUrl = urlData.publicUrl;
      }
    }

    if (sampleSlides && sampleSlides.size > 0) {
      const ext = sampleSlides.name.split(".").pop();
      const path = `trainers/${emailSlug}/slides_${timestamp}.${ext}`;
      const { error } = await supabase.storage
        .from("uploads")
        .upload(path, sampleSlides);
      if (!error) {
        const { data: urlData } = supabase.storage
          .from("uploads")
          .getPublicUrl(path);
        sampleSlidesUrl = urlData.publicUrl;
      }
    }

    // Insert trainer record with domains, certs, topics as direct fields
    const { data: trainer, error: trainerError } = await supabase
      .from("trainers")
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        location_city: data.locationCity,
        location_country: data.locationCountry,
        linkedin_url: data.linkedinUrl || null,
        bio: data.bio || null,
        headshot_url: headshotUrl,

        // Domains stored directly as text arrays
        primary_domains: data.primaryDomains || [],
        secondary_domains: data.secondaryDomains || [],

        // Topics
        topics_trained: data.topicsTrained || [],

        // Experience
        years_of_experience:
          data.yearsOfExperience !== "" ? data.yearsOfExperience : null,
        total_sessions_delivered:
          data.totalSessionsDelivered !== ""
            ? data.totalSessionsDelivered
            : null,
        preferred_group_size_min:
          data.preferredGroupSizeMin !== ""
            ? data.preferredGroupSizeMin
            : null,
        preferred_group_size_max:
          data.preferredGroupSizeMax !== ""
            ? data.preferredGroupSizeMax
            : null,
        delivery_formats: data.deliveryFormats || [],

        // Certifications stored as JSONB
        certifications: data.certifications || [],

        // Content
        sample_outline_url: sampleOutlineUrl,
        sample_slides_url: sampleSlidesUrl,
        sample_video_url: data.sampleVideoUrl || null,

        // Availability & rates
        availability: data.availabilitySlots || [],
        day_rate_usd: data.dayRateUsd !== "" ? data.dayRateUsd : null,
        hourly_rate_usd: data.hourlyRateUsd !== "" ? data.hourlyRateUsd : null,
        rate_notes: data.rateNotes || null,

        status: "pending",
        submitted_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (trainerError) {
      console.error("Trainer insert error:", trainerError);
      return NextResponse.json(
        { error: trainerError.message },
        { status: 500 }
      );
    }

    const trainerId = trainer.id;

    // Create initial verification step
    await supabase.from("verification_steps").insert({
      trainer_id: trainerId,
      step_number: 1,
      step_name: "profile_screening",
      status: "pending",
    });

    return NextResponse.json({ success: true, trainerId });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
