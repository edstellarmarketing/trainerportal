import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, redirectTo } = await request.json();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/magiclink`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({
        email,
        ...(redirectTo && { redirect_to: redirectTo }),
      }),
    }
  );

  if (!res.ok) {
    const data = await res.json();
    return NextResponse.json(
      { error: data.error_description || data.msg || "Failed to send magic link" },
      { status: res.status }
    );
  }

  return NextResponse.json({ success: true });
}
