import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const supabase = createAdminClient();

  let query = supabase
    .from("enquiries")
    .select("*", { count: "exact" });

  if (status) query = query.eq("status", status);
  if (search) {
    query = query.or(
      `company_name.ilike.%${search}%,contact_name.ilike.%${search}%,contact_email.ilike.%${search}%,domain_needed.ilike.%${search}%`
    );
  }

  query = query.order("created_at", { ascending: false });
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    enquiries: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("enquiries")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
