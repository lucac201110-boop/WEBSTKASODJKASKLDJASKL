"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getVouches, type Vouch } from "@/lib/api";
import SectionReveal from "@/components/SectionReveal";

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function VouchesSection() {
  const [vouches, setVouches] = useState<Vouch[] | null>(null);

  useEffect(() => {
    getVouches().then(setVouches);
  }, []);

  return (
    <section id="vouches" className="py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionReveal className="mx-auto mb-14 max-w-xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Vouches</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">What players are saying</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-secondary">
            Real feedback left by license holders after downloading.
          </p>
        </SectionReveal>

        {vouches === null && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border border-line bg-card" />
            ))}
          </div>
        )}

        {vouches?.length === 0 && (
          <p className="text-center text-[14px] text-ink-secondary">
            No vouches yet — be the first after you download.
          </p>
        )}

        {vouches && vouches.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {vouches.map((v, i) => (
              <SectionReveal key={`${v.discord_username}-${v.created_at}`} delay={i * 0.06}>
                <div className="h-full rounded-2xl border border-line bg-card p-5 transition-colors hover:border-white/15">
                  <div className="mb-3 flex gap-0.5 text-accent">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} size={12} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <p className="text-[13.5px] leading-relaxed text-ink-secondary">&ldquo;{v.message}&rdquo;</p>
                  <div className="mt-5 flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-secondary font-mono text-[10px] font-semibold text-white">
                      {initials(v.discord_username)}
                    </div>
                    <div className="text-[13px] font-medium">{v.discord_username}</div>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
