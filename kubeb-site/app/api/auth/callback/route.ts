import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.KUBEB_API_URL ?? "";
const API_SECRET = process.env.KUBEB_API_SECRET ?? "";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const origin = request.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/?login_error=${encodeURIComponent("No authorization code received.")}`);
  }

  try {
    const res = await fetch(`${API_URL}/oauth/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-API-Secret": API_SECRET },
      body: JSON.stringify({ code }),
      cache: "no-store",
    });

    const body = await res.json();

    if (!res.ok) {
      return NextResponse.redirect(`${origin}/?login_error=${encodeURIComponent(body.detail ?? "Login failed.")}`);
    }

    const response = NextResponse.redirect(`${origin}/`);
    response.cookies.set("kubeb_session", body.session_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 14,
    });
    return response;
  } catch {
    return NextResponse.redirect(`${origin}/?login_error=${encodeURIComponent("Couldn't reach the login server.")}`);
  }
}
