import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.KUBEB_API_URL ?? "";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("kubeb_session")?.value;
  if (!token) {
    return NextResponse.json({ detail: "You need to be logged in to download." }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${API_URL}/download?token=${encodeURIComponent(token)}`, { cache: "no-store" });

    if (!upstream.ok) {
      const body = await upstream.json().catch(() => ({ detail: "Download failed." }));
      return NextResponse.json(body, { status: upstream.status });
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "application/java-archive",
        "Content-Disposition": 'attachment; filename="kubeb-client-1.21.4.jar"',
      },
    });
  } catch {
    return NextResponse.json({ detail: "Couldn't reach the download server." }, { status: 502 });
  }
}
