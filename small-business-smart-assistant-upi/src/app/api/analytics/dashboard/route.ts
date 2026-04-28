import { NextResponse } from "next/server";
import { getCurrentUserOrThrow } from "@/lib/auth/session";
import { getDashboardData } from "@/lib/analytics/dashboard";

export async function GET() {
  const user = await getCurrentUserOrThrow();
  const data = await getDashboardData(user.id);
  return NextResponse.json(data);
}

