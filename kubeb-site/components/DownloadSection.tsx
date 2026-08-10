"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download as DownloadIcon, Lock, LogIn } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";
import VouchModal from "@/components/VouchModal";
import { useAuth } from "@/lib/auth-context";

export default function DownloadSection() {
  const { account, loading, login } = useAuth();
  const [vouchOpen, setVouchOpen] = useState(false);

  const hasAccess = !!account?.has_customer_role && !!account?.license_status?.valid;

  function startDownload() {
    window.location.href = "/api/download";
  }

  function handleDownloadClick() {
    setVouchOpen(true);
  }

  function handleVouchDone() {
    setVouchOpen(false);
    startDownload();
  }

  return (
    <section id="download" className="py-28">
      <div className="mx-auto max-w-lg px-6">
        <SectionReveal className="mx-auto mb-14 max-w-xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Download</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Get Kubeb Client</h2>
        </SectionReveal>

        <SectionReveal>
          <motion.div
            whileHover={{ y: -3 }}
            className="rounded-2xl border border-accent/30 bg-accent/[0.05] p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-lg font-semibold">Minecraft 1.21.4</span>
                <p className="mt-1 text-[12.5px] text-ink-secondary">Fabric</p>
              </div>
              <span className="rounded-full border border-accent/30 bg-accent/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-accent">
                Latest
              </span>
            </div>

            <div className="mt-6 border-t border-line pt-5">
              {loading ? (
                <div className="h-11 animate-pulse rounded-lg bg-white/5" />
              ) : !account ? (
                <button
                  onClick={login}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-line px-4 py-3 text-[13.5px] font-medium text-ink transition-colors hover:border-white/20"
                >
                  <LogIn size={15} />
                  Login with Discord to download
                </button>
              ) : !hasAccess ? (
                <div className="flex items-center justify-center gap-2 rounded-lg border border-line px-4 py-3 text-[13.5px] text-ink-secondary">
                  <Lock size={15} />
                  An active license is required to download
                </div>
              ) : (
                <button
                  onClick={handleDownloadClick}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-[13.5px] font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <DownloadIcon size={15} />
                  Download
                </button>
              )}
            </div>
          </motion.div>
        </SectionReveal>
      </div>

      <VouchModal open={vouchOpen} onClose={() => setVouchOpen(false)} onDone={handleVouchDone} />
    </section>
  );
}
