"use client";

import { motion } from "framer-motion";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="chunk-bg pointer-events-none absolute inset-0" />
      <motion.span
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="font-mono text-sm uppercase tracking-[0.3em] text-accent"
      >
        Error
      </motion.span>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-4 text-7xl font-bold tracking-tight sm:text-8xl"
      >
        404
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-4 max-w-sm text-[15px] text-ink-secondary"
      >
        This chunk hasn&apos;t loaded. The page you&apos;re looking for
        doesn&apos;t exist.
      </motion.p>
      <motion.a
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        href="/"
        className="mt-8 flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[14px] font-semibold text-bg transition-transform hover:scale-[1.03]"
      >
        <Home size={16} />
        Back home
      </motion.a>
    </div>
  );
}
