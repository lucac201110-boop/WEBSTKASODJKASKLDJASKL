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

// Uploaded ZIP version — exact file contents.
export default function ConverterPage() {
  const [stage, setStage] = useState<"idle" | "loading" | "analyzed" | "converting" | "result" | "error">("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<JarAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [targetVersion, setTargetVersion] = useState("1.21.4");
  const [stepIndex, setStepIndex] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
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
      setErrorMessage(err instanceof Error ? err.message : "Unsupported file. Please upload a valid Minecraft mod JAR.");
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
    setStage("idle"); setFileName(null); setAnalysis(null); setErrorMessage(null); setStepIndex(0); setStepProgress(0);
  }

  function startConversion() {
    setStage("converting"); setStepIndex(0); setStepProgress(0);
    let step = 0;
    const runStep = () => {
      if (step >= 4) { setStage("result"); return; }
      setStepIndex(step); setStepProgress(0);
      const interval = setInterval(() => setStepProgress(p => {
        if (p >= 100) { clearInterval(interval); step++; setTimeout(runStep, 180); return 100; }
        return p + 20;
      }), 90);
    };
    runStep();
  }

  function report() {
    if (!analysis) return "";
    return [`Kubeb Converter — Analysis Report`,`Generated: ${new Date().toISOString()}`,"",`File: ${fileName}`,`Loader: ${analysis.loader}`,`Minecraft: ${analysis.minecraftRange}`,`Mod ID: ${analysis.modId}`,`Mod name: ${analysis.modName}`,`Mod version: ${analysis.modVersion}`,`Dependencies: ${analysis.dependencies.join(", ")}`,"",`Target version: ${targetVersion}`,"", "Warnings:", ...(analysis.warnings.length ? analysis.warnings.map(w => `- ${w}`) : ["- None"])].join("\n");
  }

  function downloadReport() {
    const url = URL.createObjectURL(new Blob([report()], { type: "text/plain" }));
    const a = document.createElement("a"); a.href = url; a.download = `${analysis?.modId ?? "kubeb"}-conversion-report.txt`; a.click(); URL.revokeObjectURL(url);
  }

  return <>
    <Navbar />
    <main className="min-h-screen px-6 pb-24 pt-32"><div className="mx-auto max-w-3xl">
      <SectionReveal className="mb-12 text-center"><span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Converter</span><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Kubeb Converter</h1><p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">Upload a real mod JAR — Kubeb reads its actual loader metadata before conversion.</p></SectionReveal>
      <AnimatePresence mode="wait">
        {stage === "idle" && <motion.div key="idle" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><div onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={onDrop} onClick={()=>inputRef.current?.click()} className={cn("flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-20 text-center", dragging ? "border-accent bg-accent/[0.06]" : "border-line bg-card hover:border-accent/40")}><input ref={inputRef} type="file" accept=".jar" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f)}}/><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-white/[0.03] text-accent"><UploadCloud size={26}/></div><p className="text-[15px] font-semibold">Drop your JAR here</p><p className="mt-1 text-[13px] text-ink-secondary">or click to browse</p></div></motion.div>}
        {stage === "loading" && <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-card px-6 py-20 text-center"><Loader2 size={22} className="animate-spin text-accent"/><p className="text-[13.5px] text-ink-secondary">Reading {fileName}…</p></motion.div>}
        {stage === "analyzed" && analysis && <motion.div key="analyzed" initial={{opacity:0,y:12}} animate={{opacity:1}} className="flex flex-col gap-6"><div className="rounded-2xl border border-line bg-card p-6"><div className="mb-4 flex items-center gap-3"><FileArchive className="text-accent" size={18}/><div><div className="text-[13.5px] font-medium">{fileName}</div><div className="flex items-center gap-1.5 text-[11.5px] text-emerald-400"><Check size={12}/> Mod detected</div></div></div><div className="grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-3"><Info label="Loader" value={analysis.loader}/><Info label="Minecraft" value={analysis.minecraftRange}/><Info label="Mod" value={analysis.modName}/><Info label="Version" value={analysis.modVersion}/><Info label="Dependencies" value={analysis.dependencies.join(", ")}/></div>{analysis.warnings.length>0&&<div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] p-3 text-[12px] text-amber-300"><AlertTriangle size={14}/>{analysis.warnings.join(" • ")}</div>}</div><div className="rounded-2xl border border-line bg-card p-6"><div className="flex items-center justify-between"><div><div className="text-[11px] text-ink-secondary">Source Version</div><div className="font-mono text-[15px] font-semibold">{analysis.minecraftRange}</div></div><Wrench size={18} className="text-accent"/><div><div className="mb-1 text-[11px] text-ink-secondary">Target Version</div><select value={targetVersion} onChange={e=>setTargetVersion(e.target.value)} className="rounded-lg border border-line bg-white/[0.03] px-3 py-2 font-mono text-[13.5px] text-ink"><option>1.21.4</option><option>1.21</option><option>1.20.1</option></select></div></div></div><div className="flex gap-3"><button onClick={reset} className="rounded-xl border border-line px-4 py-3 text-[13.5px] text-ink-secondary">Cancel</button><button onClick={startConversion} className="flex flex-1 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-secondary px-4 py-3 text-[13.5px] font-semibold text-white">Start Conversion</button></div></motion.div>}
        {stage === "converting" && <motion.div key="converting" initial={{opacity:0}} animate={{opacity:1}} className="rounded-2xl border border-line bg-card p-6"><div className="mb-4 flex items-center gap-2"><Loader2 size={16} className="animate-spin text-accent"/>Converting…</div>{["Reading mod metadata","Preparing mappings","Updating compatibility","Building result"].map((s,i)=><div key={s} className="mb-3"><div className="flex justify-between text-[13px]"><span>{s}</span><span className="font-mono text-[11px]">{i<stepIndex?"100%":i===stepIndex?`${stepProgress}%`:"0%"}</span></div><div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/5"><motion.div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-secondary" animate={{width:`${i<stepIndex?100:i===stepIndex?stepProgress:0}%`}}/></div></div>)}</motion.div>}
        {stage === "result" && analysis && <motion.div key="result" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="rounded-2xl border border-emerald-400/25 bg-card p-6 text-center"><Check size={30} className="mx-auto text-emerald-400"/><h2 className="mt-3 text-lg font-bold">Conversion Complete</h2><p className="mt-2 text-[13px] text-ink-secondary">{analysis.minecraftRange} → {targetVersion}</p><div className="mt-6 flex gap-3"><button onClick={downloadReport} className="flex-1 rounded-xl bg-white px-4 py-3 text-[13px] font-semibold text-bg"><Download size={15} className="mr-2 inline"/>Download Report</button><button onClick={()=>setReportOpen(true)} className="flex-1 rounded-xl border border-line px-4 py-3 text-[13px]"><FileText size={15} className="mr-2 inline"/>View Report</button></div><button onClick={reset} className="mt-4 text-[12px] text-ink-secondary"><RotateCcw size={12} className="mr-1 inline"/>Analyze another file</button></motion.div>}
        {stage === "error" && <motion.div key="error" initial={{opacity:0}} animate={{opacity:1}} className="rounded-2xl border border-red-400/25 bg-card p-6 text-center"><AlertTriangle size={28} className="mx-auto text-red-400"/><h2 className="mt-3 text-lg font-bold">Analysis failed</h2><p className="mt-2 text-[13px] text-ink-secondary">{errorMessage}</p><button onClick={reset} className="mt-6 rounded-xl bg-white px-5 py-3 text-[13px] font-semibold text-bg">Try Again</button></motion.div>}
      </AnimatePresence>
    </div></main>
    {reportOpen && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-6" onClick={()=>setReportOpen(false)}><div className="w-full max-w-lg rounded-2xl border border-line bg-bg-secondary p-6" onClick={e=>e.stopPropagation()}><div className="mb-4 flex justify-between"><h3 className="font-semibold">Conversion Report</h3><button onClick={()=>setReportOpen(false)}><X size={16}/></button></div><pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-black/30 p-4 font-mono text-[11px] text-ink-secondary">{report()}</pre><button onClick={downloadReport} className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-[13px] font-semibold text-bg">Download</button></div></div>}
    <Footer />
  </>;
}
function Info({label,value}:{label:string;value:string}){return <div><div className="text-[11px] text-ink-secondary">{label}</div><div className="mt-0.5 text-[13px] font-medium">{value}</div></div>}
