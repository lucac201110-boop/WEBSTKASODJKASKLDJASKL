import { NextRequest, NextResponse } from "next/server";
import { scanCompatibility, supportedScanVersions, ScanVersion } from "@/lib/compat-scanner";

export const runtime = "nodejs";

function isScanVersion(v: string): v is ScanVersion {
  return (supportedScanVersions as readonly string[]).includes(v);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  const sourceVersion = formData.get("sourceVersion");
  const targetVersion = formData.get("targetVersion");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (typeof sourceVersion !== "string" || !isScanVersion(sourceVersion)) {
    return NextResponse.json({ error: "Invalid or unsupported source version." }, { status: 400 });
  }
  if (typeof targetVersion !== "string" || !isScanVersion(targetVersion)) {
    return NextResponse.json({ error: "Invalid or unsupported target version." }, { status: 400 });
  }

  try {
    const buffer = await file.arrayBuffer();
    const result = await scanCompatibility(buffer, sourceVersion, targetVersion);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scan failed." },
      { status: 500 }
    );
  }
}
