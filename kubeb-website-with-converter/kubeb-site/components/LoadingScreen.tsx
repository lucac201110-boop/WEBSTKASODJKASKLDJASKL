"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className="h-9 w-9 rounded-[7px] bg-gradient-to-br from-accent to-accent-secondary"
              initial={{ scale: 0.85, rotate: -8 }}
              animate={{ scale: [0.85, 1, 0.85], rotate: [-8, 8, -8] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-ink-secondary">
              Kubeb Client
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
