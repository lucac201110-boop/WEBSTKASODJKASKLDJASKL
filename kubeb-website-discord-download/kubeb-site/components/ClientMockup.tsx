"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { LayoutGrid, Palette, Keyboard, ShieldCheck } from "lucide-react";

const cards = [
  { label: "Module system", icon: LayoutGrid },
  { label: "Accent themes", icon: Palette },
  { label: "Custom keybinds", icon: Keyboard },
  { label: "License protected", icon: ShieldCheck },
];

export default function ClientMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 150, damping: 20 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <div style={{ perspective: 1400 }} className="w-full">
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY }}
        className="relative w-full rounded-2xl border border-line bg-bg-secondary/80 p-5 shadow-2xl shadow-black/50 backdrop-blur-sm"
      >
        <div className="mb-5 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          <span className="ml-3 font-mono text-[11px] text-ink-secondary">kubeb — 1.21.4</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-line bg-white/[0.02] p-4 transition-colors hover:border-accent/30"
            >
              <c.icon size={18} className="mb-2.5 text-accent" strokeWidth={1.75} />
              <div className="text-[13px] font-medium text-ink">{c.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
