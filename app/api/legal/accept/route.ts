import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { TERMS_VERSION } from "@/lib/legal";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Please reload this page and try again." }, { status: 403 });
  }
  const body = await request.json().catch(() => null);
  if (body?.accepted !== true || body?.version !== TERMS_VERSION) {
    return NextResponse.json({ error: "Please review and accept the current Terms & Conditions." }, { status: 400 });
  }
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
  const { error } = await supabase.rpc("accept_current_terms", { requested_version: TERMS_VERSION });
  if (error) {
    const setupMissing = ["PGRST202", "PGRST205", "42P01", "42883"].includes(error.code);
    return NextResponse.json({
      error: setupMissing
        ? "Agreement saving has not been set up yet. Please contact the operator."
        : "Unable to save your agreement. Please try again or contact the operator.",
      code: setupMissing ? "LEGAL_SETUP_REQUIRED" : "LEGAL_SAVE_FAILED",
    }, { status: 503 });
  }
  return NextResponse.json({ success: true });
}
