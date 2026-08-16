"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileArchive,
  ArrowRight,
  Check,
  Loader2,
  Download,
  FileText,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionReveal from "@/components/SectionReveal";
import { converterVersions, mockAnalysis, conversionSteps } from "@/lib/data";
import { cn } from "@/lib/utils";

type Stage = "idle" | "analyzed" | "converting" | "result" | "error";

export default function ConverterPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [targetVersion, setTargetVersion] = useState("1.21.4");
  const [stepIndex, setStepIndex] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(name: string) {
    setFileName(name);
    setStage("analyzed");
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file.name);
  }, []);

  function reset() {
    setStage("idle");
    setFileName(null);
    setStepIndex(0);
    setStepProgress(0);
  }

  function startConversion() {
    setStage("converting");
    setStepIndex(0);
    setStepProgress(0);

    // Deterministic mock progress animation through conversionSteps.
    let step = 0;
    const willFail = false; // demo always succeeds; flip to true to preview the error state

    const runStep = () => {
      if (step >= conversionSteps.length) {
        setStage(willFail ? "error" : "result");
        return;
      }
      setStepIndex(step);
      setStepProgress(0);
      const interval = setInterval(() => {
        setStepProgress((p) => {
          if (p >= 100) {
            clearInterval(interval);
            step += 1;
            setTimeout(runStep, 180);
            return 100;
          }
          return p + 20;
        });
      }, 90);
    };
    runStep();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pb-24 pt-32">
        <div className="mx-auto max-w-3xl">
          <SectionReveal className="mb-12 text-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Converter</span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Kubeb Converter</h1>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
              Port your Minecraft mods between supported versions. Upload a JAR, select a target
              version, and start the conversion.
            </p>
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
                      if (file) handleFile(file.name);
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

            {stage === "analyzed" && fileName && (
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
                    <InfoField label="Loader" value={mockAnalysis.loader} />
                    <InfoField label="Minecraft" value={mockAnalysis.minecraft} />
                    <InfoField label="Mod" value={mockAnalysis.modName} />
                    <InfoField label="Version" value={mockAnalysis.modVersion} />
                    <InfoField label="Dependencies" value={mockAnalysis.dependencies.join(", ")} />
                  </div>
                </div>

                <div className="rounded-2xl border border-line bg-card p-6">
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                    <div className="text-center sm:text-left">
                      <div className="text-[11px] text-ink-secondary">Source Version</div>
                      <div className="font-mono text-[15px] font-semibold">{mockAnalysis.minecraft}</div>
                    </div>
                    <ArrowRight size={18} className="rotate-90 text-ink-secondary sm:rotate-0" />
                    <div className="text-center sm:text-left">
                      <div className="mb-1 text-[11px] text-ink-secondary">Target Version</div>
                      <select
                        value={targetVersion}
                        onChange={(e) => setTargetVersion(e.target.value)}
                        className="rounded-lg border border-line bg-white/[0.03] px-3 py-2 font-mono text-[13.5px] text-ink outline-none focus:border-accent/50"
                      >
                        {converterVersions.map((v) => (
                          <option key={v} value={v} className="bg-bg-secondary">
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    className="rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-[13.5px] font-medium text-ink-secondary hover:text-ink"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={startConversion}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-accent to-accent-secondary px-4 py-3 text-[13.5px] font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Start Conversion
                  </button>
                </div>
              </motion.div>
            )}

            {stage === "converting" && (
              <motion.div
                key="converting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-line bg-card p-6"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-accent" />
                  <span className="text-[13.5px] font-medium">Converting…</span>
                </div>
                <ul className="mt-4 flex flex-col gap-3">
                  {conversionSteps.map((step, i) => {
                    const done = i < stepIndex;
                    const active = i === stepIndex;
                    const pct = done ? 100 : active ? stepProgress : 0;
                    return (
                      <li key={step}>
                        <div className="flex items-center justify-between text-[13px]">
                          <span className={done || active ? "text-ink" : "text-ink-secondary/60"}>{step}</span>
                          <span className="font-mono text-[11.5px] text-ink-secondary">
                            {done ? <Check size={13} className="text-emerald-400" /> : `${pct}%`}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/5">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-secondary"
                            animate={{ width: `${pct}%` }}
                            transition={{ ease: "easeOut" }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}

            {stage === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-emerald-400/25 bg-card p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10">
                  <Check size={24} className="text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold">Conversion Complete</h2>
                <div className="mt-3 flex items-center justify-center gap-3 font-mono text-[13.5px] text-ink-secondary">
                  <span>{mockAnalysis.minecraft} Fabric</span>
                  <ArrowRight size={14} />
                  <span className="text-ink">{targetVersion} Fabric</span>
                </div>

                <div className="mx-auto mt-6 grid max-w-xs grid-cols-2 gap-3">
                  <div className="rounded-xl border border-line bg-white/[0.03] p-3">
                    <div className="text-[11px] text-ink-secondary">Confidence</div>
                    <div className="mt-1 text-[17px] font-bold text-emerald-400">94%</div>
                  </div>
                  <div className="rounded-xl border border-line bg-white/[0.03] p-3">
                    <div className="text-[11px] text-ink-secondary">Warnings</div>
                    <div className="mt-1 text-[17px] font-bold text-amber-400">2</div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-[13.5px] font-semibold text-bg transition-transform hover:scale-[1.01]">
                    <Download size={15} /> Download Converted JAR
                  </button>
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-[13.5px] font-medium text-ink hover:border-white/20">
                    <FileText size={15} /> View Report
                  </button>
                </div>
                <button
                  onClick={reset}
                  className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-ink-secondary hover:text-ink"
                >
                  <RotateCcw size={12} /> Convert another file
                </button>
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
                <h2 className="text-lg font-bold">Conversion could not be completed</h2>
                <p className="mt-2 text-[13.5px] text-ink-secondary">
                  Mixin target no longer exists. Manual migration may be required.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-[13.5px] font-medium text-ink hover:border-white/20">
                    <FileText size={15} /> View Report
                  </button>
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
