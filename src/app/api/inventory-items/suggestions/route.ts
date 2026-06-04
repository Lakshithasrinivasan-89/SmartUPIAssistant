import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth/session";
import { getInventorySuggestions } from "@/lib/inventory/suggestions";

export async function GET() {
  const user = await getCurrentUserOrThrow();
  const suggestions = await getInventorySuggestions(user.id);
  return NextResponse.json({ suggestions });
}

