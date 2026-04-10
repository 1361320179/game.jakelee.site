import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // TODO: Implement leaderboard fetching
  return NextResponse.json({ leaderboard: [] });
}

export async function POST(request: Request) {
  // TODO: Implement score submission
  return NextResponse.json({ success: true });
}
