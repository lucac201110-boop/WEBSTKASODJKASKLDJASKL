"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import ClientMockup from "@/components/ClientMockup";
import DiscordIcon from "@/components/icons/DiscordIcon";
import { discordInviteUrl } from "@/lib/data";

const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: (i * 37) % 100,
  top: (i * 53) % 100,
  delay: (i % 6) * 0.6,
  duration: 4 + (i % 5),
}));

export default function Hero() {
  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden pt-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="chunk-bg absolute inset-0 h-full w-full" />
        <motion.div
          className="absolute -left-32 top-24 h-[420px] w-[420px] rounded-full bg-accent/20 blur-[110px]"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 top-1/3 h-[380px] w-[380px] rounded-full bg-accent-secondary/20 blur-[110px]"
          animate={{ x: [0, -25, 0], y: [0, -15, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute h-1 w-1 rounded-full bg-white/30"
            style={{ left: `${p.left}%`, top: `${p.top}%` }}
            animate={{ opacity: [0.1, 0.6, 0.1], y: [0, -20, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-20 lg:grid-cols-2 lg:gap-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[11px] tracking-wide text-ink-secondary">MC 1.21.4</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl"
          >
            Redefining the
            <br />
            <span className="text-gradient">Minecraft Experience.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-lg text-[16.5px] leading-relaxed text-ink-secondary"
          >
            Kubeb Client is a polished, customizable Minecraft client built
            around design, usability, and performance — for players who
            notice the difference between good and precise.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href="#download"
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[14px] font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download size={16} />
              Download
            </a>
            <a
              href={discordInviteUrl}
              className="group flex items-center gap-2 rounded-xl border border-line px-5 py-3 text-[14px] font-medium text-ink transition-colors hover:border-white/20 hover:bg-white/[0.03]"
            >
              <DiscordIcon className="h-4 w-4" />
              Join Discord
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="animate-float"
        >
          <ClientMockup />
        </motion.div>
      </div>
    </section>
  );
}
