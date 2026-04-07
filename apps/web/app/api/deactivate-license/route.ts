import { NextResponse } from "next/server";

export async function POST() {
  // TODO: re-enable when switching to paid plan
  return NextResponse.json({ success: true });
}

