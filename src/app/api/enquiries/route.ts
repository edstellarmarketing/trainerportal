import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const { companyName, contactName, contactEmail } = body;
  if (!companyName || !contactName || !contactEmail) {
    return NextResponse.json(
      { error: "Company name, contact name, and email are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Set SLA deadline to 48 hours from now
  const slaDeadline = new Date();
  slaDeadline.setHours(slaDeadline.getHours() + 48);

  const { error } = await supabase.from("enquiries").insert({
    company_name: body.companyName,
    contact_name: body.contactName,
    contact_email: body.contactEmail,
    contact_phone: body.contactPhone || null,
    company_type: body.companyType || null,
    domain_needed: body.domainNeeded,
    delivery_format: body.deliveryFormat || null,
    location: body.location || null,
    group_size: body.groupSize ? parseInt(body.groupSize) : null,
    preferred_timeline: body.preferredTimeline || null,
    additional_notes: body.additionalNotes || null,
    status: "new",
    sla_deadline: slaDeadline.toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
