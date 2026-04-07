// TODO: re-enable when switching to paid plan
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Payments not enabled yet" },
    { status: 200 }
  );
}

