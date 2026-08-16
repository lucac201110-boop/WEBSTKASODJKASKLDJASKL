"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileArchive,
  Check,
  Loader2,
  Download,
  FileText,
  AlertTriangle,
  RotateCcw,
  X,
  Wrench,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionReveal from "@/components/SectionReveal";
import { analyzeJar, JarAnalysis } from "@/lib/jar-analysis";
import { cn } from "@/lib/utils";

type Stage = "idle" | "loading" | "analyzed" | "error";

export default function ConverterPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<JarAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    setStage("loading");
    setErrorMessage(null);
    try {
      const result = await analyzeJar(file);
      setAnalysis(result);
      setStage("analyzed");
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Unsupported file. Please upload a valid Minecraft mod JAR."
      );
      setStage("error");
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, []);

  function reset() {
    setStage("idle");
    setFileName(null);
    setAnalysis(null);
    setErrorMessage(null);
  }

  function buildReportText(): string {
    if (!analysis) return "";
    const lines = [
      `Kubeb Mod Inspector — Analysis Report`,
      `Generated: ${new Date().toISOString()}`,
      ``,
      `File: ${fileName}`,
      `Loader: ${analysis.loader}`,
      `Declared Minecraft range: ${analysis.minecraftRange}`,
      `Mod ID: ${analysis.modId}`,
      `Mod name: ${analysis.modName}`,
      `Mod version: ${analysis.modVersion}`,
      `Dependencies: ${analysis.dependencies.join(", ")}`,
      ``,
      `Warnings:`,
      ...(analysis.warnings.length ? analysis.warnings.map((w) => `  - ${w}`) : ["  - None"]),
      ``,
      `This is a metadata report only — it reflects real data read from the`,
      `uploaded JAR's loader manifest. Automatic conversion between Minecraft`,
      `versions is not available yet.`,
    ];
    return lines.join("\n");
  }

  function downloadReport() {
    const blob = new Blob([buildReportText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(analysis?.modId ?? "kubeb")}-inspector-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pb-24 pt-32">
        <div className="mx-auto max-w-3xl">
          <SectionReveal className="mb-12 text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Mod Inspector</span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Kubeb Mod Inspector</h1>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
              Upload a real mod JAR and Kubeb reads its actual loader metadata (Fabric, Quilt, or
              Forge/NeoForge) — the declared Minecraft version, mod ID, and dependencies.
            </p>
            <div className="mx-auto mt-4 flex max-w-md items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-3.5 py-2.5 text-left text-[12px] text-amber-300">
              <Wrench size={14} className="mt-0.5 shrink-0" />
              <span>
                This tool detects and reports real JAR metadata. Automatic conversion between
                Minecraft versions isn&apos;t available yet — that needs a full remapping
                pipeline, which is on the roadmap.
              </span>
            </div>
          </SectionReveal>

          <AnimatePresence mode="wait">
            {stage === "idle" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-20 text-center transition-colors",
                    dragging
                      ? "border-accent bg-accent/[0.06] shadow-[0_0_60px_-15px_rgba(79,140,255,0.5)]"
                      : "border-line bg-card hover:border-accent/40"
                  )}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".jar"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                  />
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-white/[0.03] text-accent">
                    <UploadCloud size={26} strokeWidth={1.75} />
                  </div>
                  <p className="text-[15px] font-semibold">Drop your JAR here</p>
                  <p className="mt-1 text-[13px] text-ink-secondary">or click to browse</p>
                  <p className="mt-4 font-mono text-[11px] uppercase tracking-wide text-ink-secondary/70">
                    Minecraft .jar files
                  </p>
                </div>
              </motion.div>
            )}

            {stage === "loading" && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-card px-6 py-20 text-center"
              >
                <Loader2 size={22} className="animate-spin text-accent" />
                <p className="text-[13.5px] text-ink-secondary">Reading {fileName}…</p>
              </motion.div>
            )}

            {stage === "analyzed" && analysis && (
              <motion.div
                key="analyzed"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-6"
              >
                <div className="rounded-2xl border border-line bg-card p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white/[0.03] text-accent">
                      <FileArchive size={18} />
                    </div>
                    <div>
                      <div className="text-[13.5px] font-medium">{fileName}</div>
                      <div className="flex items-center gap-1.5 text-[11.5px] text-emerald-400">
                        <Check size={12} /> Mod detected
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-3">
                    <InfoField label="Loader" value={analysis.loader} />
                    <InfoField label="Minecraft" value={analysis.minecraftRange} />
                    <InfoField label="Mod" value={analysis.modName} />
                    <InfoField label="Version" value={analysis.modVersion} />
                    <InfoField label="Dependencies" value={analysis.dependencies.join(", ")} />
                  </div>

                  {analysis.warnings.length > 0 && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-3.5 py-3 text-[12px] text-amber-300">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                      <ul className="flex flex-col gap-1">
                        {analysis.warnings.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    className="rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-[13.5px] font-medium text-ink-secondary hover:text-ink"
                  >
                    <span className="flex items-center gap-1.5">
                      <RotateCcw size={13} /> Analyze another file
                    </span>
                  </button>
                  <button
                    onClick={downloadReport}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-[13.5px] font-semibold text-bg transition-transform hover:scale-[1.01]"
                  >
                    <Download size={15} /> Download Report
                  </button>
                  <button
                    onClick={() => setReportOpen(true)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-[13.5px] font-medium text-ink hover:border-white/20"
                  >
                    <FileText size={15} /> View Report
                  </button>
                </div>
              </motion.div>
            )}

            {stage === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-red-400/25 bg-card p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/30 bg-red-400/10">
                  <AlertTriangle size={24} className="text-red-400" />
                </div>
                <h2 className="text-lg font-bold">Analysis could not be completed</h2>
                <p className="mt-2 text-[13.5px] text-ink-secondary">
                  {errorMessage ?? "Unsupported file. Please upload a valid Minecraft mod JAR."}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={reset}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-[13.5px] font-semibold text-bg"
                  >
                    Try Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {reportOpen && analysis && (
          <>
            <motion.div
              className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReportOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="fixed left-1/2 top-1/2 z-[71] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-line bg-bg-secondary p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[15px] font-semibold">Inspector Report</h3>
                <button
                  onClick={() => setReportOpen(false)}
                  className="rounded-lg p-1.5 text-ink-secondary hover:bg-white/5 hover:text-ink"
                >
                  <X size={16} />
                </button>
              </div>
              <pre className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-xl border border-line bg-black/30 p-4 font-mono text-[11.5px] leading-relaxed text-ink-secondary">
                {buildReportText()}
              </pre>
              <button
                onClick={downloadReport}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-semibold text-bg"
              >
                <Download size={14} /> Download as .txt
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-ink-secondary">{label}</div>
      <div className="mt-0.5 text-[13px] font-medium">{value}</div>
    </div>
  );
}
