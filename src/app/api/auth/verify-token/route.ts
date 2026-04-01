import { createAdminClient } from "@/lib/supabase/admin";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trainerportal.vercel.app";

  if (!token) {
    return NextResponse.redirect(`${appUrl}/login/trainer?error=missing_token`);
  }

  const supabase = createAdminClient();

  // Find and validate token
  const { data: loginToken, error } = await supabase
    .from("login_tokens")
    .select("*")
    .eq("token", token)
    .is("used_at", null)
    .single();

  if (error || !loginToken) {
    return NextResponse.redirect(`${appUrl}/login/trainer?error=invalid_token`);
  }

  // Check expiry
  if (new Date(loginToken.expires_at) < new Date()) {
    return NextResponse.redirect(`${appUrl}/login/trainer?error=expired_token`);
  }

  // Mark token as used
  await supabase
    .from("login_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("id", loginToken.id);

  // Verify trainer exists
  const { data: trainer } = await supabase
    .from("trainers")
    .select("id, email, first_name, last_name")
    .eq("email", loginToken.email)
    .single();

  if (!trainer) {
    return NextResponse.redirect(`${appUrl}/login/trainer?error=no_account`);
  }

  // Generate JWT access token
  const secret = new TextEncoder().encode(
    process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-secret-key"
  );

  const jwt = await new SignJWT({
    email: trainer.email,
    trainerId: trainer.id,
    name: `${trainer.first_name} ${trainer.last_name}`,
    role: "trainer",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  // Set cookie and redirect to dashboard
  const response = NextResponse.redirect(`${appUrl}/dashboard`);

  response.cookies.set("sb-access-token", jwt, {
    path: "/",
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return response;
}
