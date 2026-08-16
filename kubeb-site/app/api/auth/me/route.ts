import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.KUBEB_API_URL ?? "";
const API_SECRET = process.env.KUBEB_API_SECRET ?? "";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("kubeb_session")?.value;
  if (!token) {
    return NextResponse.json({ detail: "Not logged in." }, { status: 401 });
  }

  try {
    const res = await fetch(`${API_URL}/account/me`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Secret": API_SECRET },
      body: JSON.stringify({ session_token: token }),
      cache: "no-store",
    });

    if (!res.ok) {
      const response = NextResponse.json({ detail: "Session expired." }, { status: 401 });
      response.cookies.delete("kubeb_session");
      return response;
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ detail: "Couldn't reach the login server." }, { status: 502 });
  }
}
