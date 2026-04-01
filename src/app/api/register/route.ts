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

    // Insert trainer record
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
        delivery_formats: data.deliveryFormats,
        sample_outline_url: sampleOutlineUrl,
        sample_slides_url: sampleSlidesUrl,
        sample_video_url: data.sampleVideoUrl || null,
        availability: data.availabilitySlots,
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

    // Resolve domain values — could be UUIDs or domain names
    async function resolveDomainIds(values: string[]): Promise<string[]> {
      if (!values || values.length === 0) return [];

      // Check if values look like UUIDs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const areUuids = values.every((v) => uuidRegex.test(v));

      if (areUuids) return values;

      // Values are domain names — look up IDs
      const { data: domainRows } = await supabase
        .from("domains")
        .select("id, name")
        .in("name", values);

      if (!domainRows) return [];

      const nameToId = new Map(domainRows.map((d) => [d.name.toLowerCase(), d.id]));
      return values
        .map((name) => nameToId.get(name.toLowerCase()))
        .filter((id): id is string => !!id);
    }

    // Insert trainer_domains (primary)
    console.log("Raw primaryDomains from request:", JSON.stringify(data.primaryDomains));
    console.log("Raw secondaryDomains from request:", JSON.stringify(data.secondaryDomains));

    const primaryIds = await resolveDomainIds(data.primaryDomains || []);
    console.log("Resolved primaryIds:", JSON.stringify(primaryIds));

    if (primaryIds.length > 0) {
      const primaryRows = primaryIds.map((domainId: string) => ({
        trainer_id: trainerId,
        domain_id: domainId,
        is_primary: true,
      }));
      const { error: priErr } = await supabase.from("trainer_domains").insert(primaryRows);
      if (priErr) console.error("trainer_domains primary insert error:", priErr);
    }

    // Insert trainer_domains (secondary)
    const secondaryIds = await resolveDomainIds(data.secondaryDomains || []);
    console.log("Resolved secondaryIds:", JSON.stringify(secondaryIds));

    if (secondaryIds.length > 0) {
      const secondaryRows = secondaryIds.map((domainId: string) => ({
        trainer_id: trainerId,
        domain_id: domainId,
        is_primary: false,
      }));
      const { error: secErr } = await supabase.from("trainer_domains").insert(secondaryRows);
      if (secErr) console.error("trainer_domains secondary insert error:", secErr);
    }

    // Insert certifications
    if (data.certifications?.length > 0) {
      for (let i = 0; i < data.certifications.length; i++) {
        const cert = data.certifications[i];
        let documentUrl: string | null = null;

        const certFile = formData.get(`certDocument_${i}`) as File | null;
        if (certFile && certFile.size > 0) {
          const ext = certFile.name.split(".").pop();
          const path = `trainers/${emailSlug}/cert_${i}_${timestamp}.${ext}`;
          const { error } = await supabase.storage
            .from("uploads")
            .upload(path, certFile);
          if (!error) {
            const { data: urlData } = supabase.storage
              .from("uploads")
              .getPublicUrl(path);
            documentUrl = urlData.publicUrl;
          }
        }

        await supabase.from("certifications").insert({
          trainer_id: trainerId,
          name: cert.name,
          issuing_organization: cert.issuingOrganization || null,
          issue_date: cert.issueDate || null,
          expiry_date: cert.expiryDate || null,
          credential_id: cert.credentialId || null,
          credential_url: cert.credentialUrl || null,
          document_url: documentUrl,
        });
      }
    }

    // Create initial verification step (step 1: profile_screening)
    await supabase.from("verification_steps").insert({
      trainer_id: trainerId,
      step_number: 1,
      step_name: "profile_screening",
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      trainerId,
      debug: {
        rawPrimaryDomains: data.primaryDomains,
        rawSecondaryDomains: data.secondaryDomains,
        resolvedPrimaryIds: primaryIds,
        resolvedSecondaryIds: secondaryIds,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
