import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const ALL_STEPS = [
  { step_number: 1, step_name: "profile_screening", label: "Profile Screening" },
  { step_number: 2, step_name: "credential_verification", label: "Credential Verification" },
  { step_number: 3, step_name: "domain_assessment", label: "Domain Assessment" },
  { step_number: 4, step_name: "trial_session", label: "Trial Session" },
  { step_number: 5, step_name: "final_approval", label: "Final Approval" },
];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  // Fetch existing steps
  const { data: steps, error } = await supabase
    .from("verification_steps")
    .select("*")
    .eq("trainer_id", id)
    .order("step_number");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Merge with all steps template (fill in missing steps as pending)
  const merged = ALL_STEPS.map((template) => {
    const existing = steps?.find((s) => s.step_number === template.step_number);
    return existing
      ? { ...existing, label: template.label }
      : {
          id: null,
          trainer_id: id,
          step_number: template.step_number,
          step_name: template.step_name,
          label: template.label,
          status: "pending",
          reviewer_notes: null,
          score: null,
          score_details: null,
          started_at: null,
          completed_at: null,
        };
  });

  // Fetch trainer basic info
  const { data: trainer } = await supabase
    .from("trainers")
    .select("id, first_name, last_name, email, status")
    .eq("id", id)
    .single();

  return NextResponse.json({ steps: merged, trainer });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const {
    stepNumber,
    status,
    reviewerNotes,
    score,
    scoreDetails,
  } = body;

  if (!stepNumber || !status) {
    return NextResponse.json(
      { error: "stepNumber and status are required" },
      { status: 400 }
    );
  }

  const stepDef = ALL_STEPS.find((s) => s.step_number === stepNumber);
  if (!stepDef) {
    return NextResponse.json({ error: "Invalid step number" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const now = new Date().toISOString();
  const stepData: Record<string, unknown> = {
    trainer_id: id,
    step_number: stepNumber,
    step_name: stepDef.step_name,
    status,
    reviewer_notes: reviewerNotes || null,
    score: score || null,
    score_details: scoreDetails || null,
  };

  if (status === "in_progress" || status === "info_requested") {
    stepData.started_at = now;
  }
  if (status === "approved" || status === "rejected") {
    stepData.completed_at = now;
  }

  const { error: stepErr } = await supabase
    .from("verification_steps")
    .upsert(stepData, { onConflict: "trainer_id,step_number" });

  if (stepErr) {
    return NextResponse.json({ error: stepErr.message }, { status: 500 });
  }

  // Update trainer status based on pipeline progress
  if (status === "rejected") {
    await supabase
      .from("trainers")
      .update({ status: "rejected" })
      .eq("id", id);
  } else if (stepNumber === 5 && status === "approved") {
    // Final approval — activate trainer
    await supabase
      .from("trainers")
      .update({ status: "approved", approved_at: now })
      .eq("id", id);
  } else if (status === "approved" || status === "in_progress") {
    await supabase
      .from("trainers")
      .update({ status: "in_review" })
      .eq("id", id);
  }

  return NextResponse.json({ success: true });
}
