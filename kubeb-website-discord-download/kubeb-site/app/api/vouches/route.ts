import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.KUBEB_API_URL ?? "";
const API_SECRET = process.env.KUBEB_API_SECRET ?? "";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("kubeb_session")?.value;
  if (!token) {
    return NextResponse.json({ detail: "You need to be logged in to leave a vouch." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.message || typeof body.message !== "string") {
    return NextResponse.json({ detail: "A message is required." }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_URL}/vouches`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Secret": API_SECRET },
      body: JSON.stringify({ session_token: token, message: body.message }),
      cache: "no-store",
    });

    const responseBody = await res.json();
    if (!res.ok) {
      return NextResponse.json({ detail: responseBody.detail ?? "Couldn't submit vouch." }, { status: res.status });
    }
    return NextResponse.json(responseBody);
  } catch {
    return NextResponse.json({ detail: "Couldn't reach the server." }, { status: 502 });
  }
}
