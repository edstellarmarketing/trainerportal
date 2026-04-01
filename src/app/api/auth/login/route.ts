import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ email, password }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.error_description || data.msg || "Login failed" },
      { status: res.status }
    );
  }

  // Set auth cookies so Supabase SSR picks them up
  const response = NextResponse.json({ user: data.user });

  const cookieOptions = {
    path: "/",
    httpOnly: false,
    secure: true,
    sameSite: "lax" as const,
    maxAge: data.expires_in || 3600,
  };

  response.cookies.set("sb-access-token", data.access_token, cookieOptions);
  response.cookies.set("sb-refresh-token", data.refresh_token, cookieOptions);

  return response;
}
