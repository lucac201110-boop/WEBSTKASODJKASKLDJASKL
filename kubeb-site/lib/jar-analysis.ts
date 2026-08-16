import JSZip from "jszip";

export type DetectedLoader = "Fabric" | "Forge" | "NeoForge" | "Quilt" | "Unknown";

export type JarAnalysis = {
  loader: DetectedLoader;
  minecraftRange: string; // as declared by the mod, e.g. "~1.20.1" or "[1.20,1.21)"
  modId: string;
  modName: string;
  modVersion: string;
  dependencies: string[];
  warnings: string[];
};

// Parses a real uploaded .jar in the browser (it's just a zip file) and reads
// whichever loader metadata file is actually inside it. This never executes
// any code from the JAR - it only reads static config/manifest text.
export async function analyzeJar(file: File): Promise<JarAnalysis> {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);

  const fabricEntry = zip.file("fabric.mod.json");
  if (fabricEntry) {
    const raw = await fabricEntry.async("string");
    return parseFabric(raw);
  }

  const quiltEntry = zip.file("quilt.mod.json");
  if (quiltEntry) {
    const raw = await quiltEntry.async("string");
    return parseQuilt(raw);
  }

  const neoforgeEntry = zip.file("META-INF/neoforge.mods.toml");
  if (neoforgeEntry) {
    const raw = await neoforgeEntry.async("string");
    return parseForgeToml(raw, "NeoForge");
  }

  const forgeEntry = zip.file("META-INF/mods.toml");
  if (forgeEntry) {
    const raw = await forgeEntry.async("string");
    return parseForgeToml(raw, "Forge");
  }

  throw new Error(
    "No fabric.mod.json, quilt.mod.json, or mods.toml found — this doesn't look like a Fabric, Quilt, or Forge/NeoForge mod JAR."
  );
}

function parseFabric(raw: string): JarAnalysis {
  const data = JSON.parse(raw);
  const depends = data.depends ?? {};
  const warnings: string[] = [];

  const minecraftRange = typeof depends.minecraft === "string" ? depends.minecraft : "unspecified";
  if (minecraftRange === "unspecified") {
    warnings.push("Mod does not declare a Minecraft version range in fabric.mod.json.");
  }

  const dependencies = Object.keys(depends).filter((k) => k !== "minecraft");

  return {
    loader: "Fabric",
    minecraftRange,
    modId: data.id ?? "unknown",
    modName: data.name ?? data.id ?? "Unknown Mod",
    modVersion: String(data.version ?? "0.0.0"),
    dependencies: dependencies.length ? dependencies : ["None declared"],
    warnings,
  };
}

function parseQuilt(raw: string): JarAnalysis {
  const data = JSON.parse(raw);
  const modInfo = data.quilt_loader ?? {};
  const meta = modInfo.metadata ?? {};
  const depends: any[] = modInfo.depends ?? [];
  const warnings: string[] = [];

  const mcDep = depends.find((d) => (typeof d === "string" ? d === "minecraft" : d?.id === "minecraft"));
  const minecraftRange = typeof mcDep === "object" && mcDep?.versions ? String(mcDep.versions) : "unspecified";
  if (minecraftRange === "unspecified") {
    warnings.push("Mod does not declare a Minecraft version range in quilt.mod.json.");
  }

  return {
    loader: "Quilt",
    minecraftRange,
    modId: modInfo.id ?? "unknown",
    modName: meta.name ?? modInfo.id ?? "Unknown Mod",
    modVersion: String(modInfo.version ?? "0.0.0"),
    dependencies: depends
      .map((d) => (typeof d === "string" ? d : d?.id))
      .filter((id) => id && id !== "minecraft"),
    warnings,
  };
}

// mods.toml / neoforge.mods.toml are TOML, not JSON. Rather than pulling in a
// full TOML parser for a handful of fields, this pulls out the specific keys
// we display using targeted regexes. It's intentionally conservative: if a
// field can't be found, it's reported as "unspecified" rather than guessed.
function parseForgeToml(raw: string, loader: "Forge" | "NeoForge"): JarAnalysis {
  const warnings: string[] = [];

  const modId = raw.match(/modId\s*=\s*"([^"]+)"/)?.[1] ?? "unknown";
  const displayName = raw.match(/displayName\s*=\s*"([^"]+)"/)?.[1] ?? modId;
  const version = raw.match(/version\s*=\s*"([^"]+)"/)?.[1] ?? "0.0.0";

  // Look for a [[dependencies.<modId>]] block that depends on "minecraft"
  // and pull its versionRange.
  const mcRangeMatch = raw.match(
    /\[\[dependencies\.[^\]]+]][\s\S]*?id\s*=\s*"minecraft"[\s\S]*?versionRange\s*=\s*"([^"]+)"/
  );
  const minecraftRange = mcRangeMatch?.[1] ?? "unspecified";
  if (minecraftRange === "unspecified") {
    warnings.push(`Could not locate a "minecraft" versionRange in ${loader === "Forge" ? "mods.toml" : "neoforge.mods.toml"}.`);
  }

  const depIds = Array.from(raw.matchAll(/id\s*=\s*"([^"]+)"/g))
    .map((m) => m[1])
    .filter((id) => id !== "minecraft" && id !== modId);

  return {
    loader,
    minecraftRange,
    modId,
    modName: displayName,
    modVersion: version,
    dependencies: Array.from(new Set(depIds)).length ? Array.from(new Set(depIds)) : ["None declared"],
    warnings,
  };
}
