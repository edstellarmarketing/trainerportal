import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

const EXPECTED_TABLES = [
  "trainers",
  "domains",
  "verification_steps",
  "sessions",
  "enquiries",
  "enquiry_matches",
  "admin_users",
];

export async function GET() {
  const results: Record<string, string> = {};

  try {
    const supabase = createAdminClient();

    for (const table of EXPECTED_TABLES) {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        results[table] = `ERROR: ${error.message}`;
      } else {
        results[table] = `OK (${count} rows)`;
      }
    }

    const allOk = Object.values(results).every((v) => v.startsWith("OK"));

    return NextResponse.json({
      status: allOk ? "healthy" : "degraded",
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      tables: results,
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        message: err instanceof Error ? err.message : "Connection failed",
      },
      { status: 500 }
    );
  }
}
