"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const SCAN_VERSIONS = ["1.20.1", "1.21", "1.21.1", "1.21.4", "1.21.11"] as const;

type Finding = {
  className: string;
  memberId: string;
  kind: "method" | "field";
  sourceSignature: string;
  targetSignatures: string[];
};

type ScanResult = {
  sourceVersion: string;
  targetVersion: string;
  classesScanned: number;
  totalReferences: number;
  confirmedChanges: Finding[];
  unresolvedCount: number;
};

export default function CompatScan({ file, detectedVersion }: { file: File; detectedVersion: string }) {
  const [sourceVersion, setSourceVersion] = useState<string>(
    SCAN_VERSIONS.includes(detectedVersion as (typeof SCAN_VERSIONS)[number]) ? detectedVersion : "1.21.4"
  );
  const [targetVersion, setTargetVersion] = useState<string>("1.21.11");
  const [status, setStatus] = useState<"idle" | "scanning" | "done" | "error">("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function runScan() {
    setStatus("scanning");
    setErrorMsg(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("sourceVersion", sourceVersion);
      form.append("targetVersion", targetVersion);
      const res = await fetch("/api/compat-scan", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed.");
      setResult(data);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Scan failed.");
      setStatus("error");
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <div className="mb-3 flex items-center gap-2">
        <ShieldAlert size={16} className="text-accent" />
        <span className="text-[13.5px] font-semibold">Compatibility Scan</span>
      </div>
      <p className="mb-4 text-[12px] leading-relaxed text-ink-secondary">
        Reads every real reference this mod makes into Minecraft&apos;s own code, and checks each one
        against real version mapping data. This catches renamed or changed methods — it can&apos;t
        detect mixin injection failures or new runtime behavior (like a stricter rule the game itself
        added), since those only show up by actually launching the game.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <select
            value={sourceVersion}
            onChange={(e) => setSourceVersion(e.target.value)}
            className="rounded-lg border border-line bg-white/[0.03] px-2.5 py-2 font-mono text-[12.5px] text-ink outline-none focus:border-accent/50"
          >
            {SCAN_VERSIONS.map((v) => (
              <option key={v} value={v} className="bg-bg-secondary">
                {v}
              </option>
            ))}
          </select>
          <span className="text-ink-secondary">→</span>
          <select
            value={targetVersion}
            onChange={(e) => setTargetVersion(e.target.value)}
            className="rounded-lg border border-line bg-white/[0.03] px-2.5 py-2 font-mono text-[12.5px] text-ink outline-none focus:border-accent/50"
          >
            {SCAN_VERSIONS.map((v) => (
              <option key={v} value={v} className="bg-bg-secondary">
                {v}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={runScan}
          disabled={status === "scanning" || sourceVersion === targetVersion}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent/[0.08] px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:bg-accent/[0.14] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "scanning" ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
          {status === "scanning" ? "Scanning…" : "Scan for Compatibility Issues"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {status === "error" && errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/[0.06] px-3.5 py-3 text-[12px] text-red-300"
          >
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            {errorMsg}
          </motion.div>
        )}

        {status === "done" && result && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
            <div className="mb-4 grid grid-cols-3 gap-3 text-center">
              <Stat label="Classes scanned" value={String(result.classesScanned)} />
              <Stat label="References checked" value={String(result.totalReferences)} />
              <Stat
                label="Confirmed issues"
                value={String(result.confirmedChanges.length)}
                tone={result.confirmedChanges.length === 0 ? "good" : "warn"}
              />
            </div>

            {result.confirmedChanges.length === 0 ? (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] px-3.5 py-3 text-[12px] text-emerald-300">
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                No confirmed method or field signature changes found in what this mod references.
                This doesn&apos;t guarantee it&apos;ll run without issue — mixins and new runtime
                behavior are still untested — but nothing mechanically detectable turned up.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {result.confirmedChanges.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-amber-400/25 bg-amber-400/[0.05] px-3.5 py-3 font-mono text-[11px] leading-relaxed"
                  >
                    <div className="text-amber-300">
                      {c.className}.{c.memberId} <span className="text-ink-secondary">[{c.kind}]</span>
                    </div>
                    <div className="mt-1 text-ink-secondary">
                      was: <span className="text-ink">{c.sourceSignature}</span>
                    </div>
                    <div className="text-ink-secondary">
                      now: <span className="text-ink">{c.targetSignatures.join(" | ")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-start gap-2 text-[11px] text-ink-secondary">
              <Info size={12} className="mt-0.5 shrink-0" />
              {result.unresolvedCount} additional reference{result.unresolvedCount === 1 ? "" : "s"} couldn&apos;t
              be resolved directly (most likely inherited methods/fields, not confirmed problems) —
              not shown here since they aren&apos;t reliable without the actual game&apos;s class
              hierarchy.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" }) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.03] p-3">
      <div className="text-[10.5px] text-ink-secondary">{label}</div>
      <div
        className={cn(
          "mt-1 text-[17px] font-bold",
          tone === "good" && "text-emerald-400",
          tone === "warn" && "text-amber-400"
        )}
      >
        {value}
      </div>
    </div>
  );
}
