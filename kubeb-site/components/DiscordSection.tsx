"use client";

import { motion } from "framer-motion";
import DiscordIcon from "@/components/icons/DiscordIcon";
import SectionReveal from "@/components/SectionReveal";
import { discordInviteUrl } from "@/lib/data";

export default function DiscordSection() {
  return (
    <section id="discord" className="py-28">
      <div className="mx-auto max-w-4xl px-6">
        <SectionReveal>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-bg-secondary px-8 py-16 text-center sm:px-16">
            <div className="pointer-events-none absolute inset-0">
              <motion.div
                className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[120px]"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="relative">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-card text-accent">
                <DiscordIcon className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Join our community</h2>
              <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-secondary">
                Get support, see new builds first, and talk to the team
                directly — everything happens in Discord.
              </p>
              <a
                href={discordInviteUrl}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#5865F2] px-6 py-3.5 text-[14px] font-semibold text-white transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                <DiscordIcon className="h-4 w-4" />
                Join the Discord
              </a>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
