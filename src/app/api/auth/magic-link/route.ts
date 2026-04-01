import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Check if trainer exists
  const { data: trainer } = await supabase
    .from("trainers")
    .select("id, first_name")
    .eq("email", email.toLowerCase())
    .single();

  if (!trainer) {
    return NextResponse.json(
      { error: "No trainer account found with this email" },
      { status: 404 }
    );
  }

  // Generate secure token
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Store token
  const { error: tokenErr } = await supabase.from("login_tokens").insert({
    email: email.toLowerCase(),
    token,
    expires_at: expiresAt.toISOString(),
  });

  if (tokenErr) {
    console.error("Token insert error:", tokenErr);
    return NextResponse.json(
      { error: "Failed to generate login link" },
      { status: 500 }
    );
  }

  // Build magic link URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trainerportal.vercel.app";
  const magicLink = `${appUrl}/api/auth/verify-token?token=${token}`;

  // Send email via Resend
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error: emailErr } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "Edstellar <onboarding@resend.dev>",
    to: email,
    subject: "Sign in to Edstellar Trainer Portal",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #111827; margin-bottom: 8px;">Sign in to Edstellar</h2>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          Hi ${trainer.first_name || "there"},<br><br>
          Click the button below to sign in to your Trainer Dashboard. This link expires in 15 minutes.
        </p>
        <div style="margin: 32px 0;">
          <a href="${magicLink}" style="background-color: #2563eb; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
            Sign In
          </a>
        </div>
        <p style="color: #9ca3af; font-size: 12px;">
          If you didn't request this link, you can safely ignore this email.<br>
          Link: ${magicLink}
        </p>
      </div>
    `,
  });

  if (emailErr) {
    console.error("Resend error:", emailErr);
    return NextResponse.json(
      { error: "Failed to send email. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
