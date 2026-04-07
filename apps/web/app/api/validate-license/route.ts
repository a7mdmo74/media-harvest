import { NextRequest, NextResponse } from "next/server";

export async function POST() {
  // TODO: re-enable real validation when switching to paid plan
  return NextResponse.json({ valid: true, plan: "pro", email: "" });
}

