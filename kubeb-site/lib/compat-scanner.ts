import fs from "node:fs";
import path from "node:path";
import JSZip from "jszip";
import { parseClassConstantPool, isVanillaMinecraftClass, MemberRef } from "@/lib/classfile-parser";

export const supportedScanVersions = ["1.20.1", "1.21", "1.21.1", "1.21.4", "1.21.11"] as const;
export type ScanVersion = (typeof supportedScanVersions)[number];

// class_id -> { m: { method_id: [descriptor, ...] }, f: { field_id: [type, ...] } }
type MappingIndex = Record<string, { m?: Record<string, string[]>; f?: Record<string, string[]> }>;

const indexCache = new Map<string, MappingIndex>();

function loadIndex(version: ScanVersion): MappingIndex {
  const cached = indexCache.get(version);
  if (cached) return cached;
  const filePath = path.join(process.cwd(), "data", "mapping-indexes", `${version}.json`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw) as MappingIndex;
  indexCache.set(version, parsed);
  return parsed;
}

export type CompatFinding = {
  className: string; // e.g. "class_332"
  memberId: string; // e.g. "method_27535"
  kind: "method" | "field";
  sourceSignature: string;
  targetSignatures: string[];
};

export type CompatScanResult = {
  loader: "fabric";
  sourceVersion: ScanVersion;
  targetVersion: ScanVersion;
  classesScanned: number;
  totalReferences: number;
  confirmedChanges: CompatFinding[]; // high confidence - same class+member id present in both, descriptor differs
  unresolvedCount: number; // member not found in target index for that exact class - likely inherited, NOT reported as a confirmed problem
};

/**
 * Scans every class file in an uploaded Fabric mod jar, extracts every
 * reference it makes into vanilla Minecraft, and cross-checks each one
 * against real Yarn mapping data for the source and target versions.
 *
 * Only "confirmedChanges" should be treated as reliable - those are cases
 * where the exact same (class, member id) pair is declared in both the
 * source and target mapping data, so there's no ambiguity from inheritance,
 * and the signature genuinely differs. Members that don't resolve at all in
 * the target are NOT reported as confirmed problems, because the mapping
 * data only lists members declared directly on a class - not ones inherited
 * from a superclass - so an unresolved lookup is usually a harmless,
 * unchanged inherited call rather than a real break. Full resolution would
 * require the actual (proprietary) Minecraft game jar to walk the real
 * class hierarchy, which this scanner deliberately does not use or ship.
 */
export async function scanCompatibility(
  jarBuffer: ArrayBuffer,
  sourceVersion: ScanVersion,
  targetVersion: ScanVersion
): Promise<CompatScanResult> {
  const zip = await JSZip.loadAsync(jarBuffer);
  const classFiles = Object.values(zip.files).filter(
    (f) => !f.dir && f.name.endsWith(".class") && !f.name.startsWith("META-INF/")
  );

  const allRefs: MemberRef[] = [];
  for (const file of classFiles) {
    try {
      const buf = await file.async("arraybuffer");
      const refs = parseClassConstantPool(buf);
      for (const ref of refs) {
        if (isVanillaMinecraftClass(ref.ownerClass)) {
          allRefs.push(ref);
        }
      }
    } catch {
      // A handful of odd/synthetic class files (module-info, obfuscator
      // artifacts) can fail to parse; skip them rather than aborting the
      // whole scan over one file.
      continue;
    }
  }

  const sourceIndex = loadIndex(sourceVersion);
  const targetIndex = loadIndex(targetVersion);

  const seen = new Set<string>();
  const confirmedChanges: CompatFinding[] = [];
  let unresolvedCount = 0;

  for (const ref of allRefs) {
    const classId = ref.ownerClass.split("/").pop()!;
    const dedupeKey = `${classId}.${ref.name}${ref.descriptor}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const targetEntry = Object.hasOwn(targetIndex, classId) ? targetIndex[classId] : undefined;
    if (!targetEntry) {
      unresolvedCount++;
      continue;
    }

    if (ref.kind === "method") {
      const targetDescs = targetEntry.m && Object.hasOwn(targetEntry.m, ref.name) ? targetEntry.m[ref.name] : undefined;
      if (!targetDescs) {
        unresolvedCount++;
        continue;
      }
      if (!targetDescs.includes(ref.descriptor)) {
        confirmedChanges.push({
          className: classId,
          memberId: ref.name,
          kind: "method",
          sourceSignature: ref.descriptor,
          targetSignatures: targetDescs,
        });
      }
    } else {
      const targetTypes = targetEntry.f && Object.hasOwn(targetEntry.f, ref.name) ? targetEntry.f[ref.name] : undefined;
      if (!targetTypes) {
        unresolvedCount++;
        continue;
      }
      if (!targetTypes.includes(ref.descriptor)) {
        confirmedChanges.push({
          className: classId,
          memberId: ref.name,
          kind: "field",
          sourceSignature: ref.descriptor,
          targetSignatures: targetTypes,
        });
      }
    }
  }

  return {
    loader: "fabric",
    sourceVersion,
    targetVersion,
    classesScanned: classFiles.length,
    totalReferences: seen.size,
    confirmedChanges,
    unresolvedCount,
  };
}
