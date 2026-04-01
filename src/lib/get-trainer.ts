import { cookies } from "next/headers";

/**
 * Get the current trainer's email from the JWT access token cookie.
 * Returns null if not authenticated.
 */
export async function getTrainerEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value;
  if (!token) return null;

  try {
    // Decode JWT payload (no verification — the token was issued by our own Supabase)
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    return payload.email || null;
  } catch {
    return null;
  }
}
