"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { submitVouch } from "@/lib/api";

export default function VouchModal({
  open,
  onClose,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (message.trim().length < 3) {
      setError("Say a little more than that.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await submitVouch(message.trim());
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "Couldn't submit that. Try again.");
      return;
    }
    setMessage("");
    onDone();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-line bg-bg-secondary p-6"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-[16px] font-semibold">Leave a vouch first</h3>
                <p className="mt-1 text-[13px] text-ink-secondary">
                  Quick honest feedback — it&apos;ll post to the site and the Discord server, then your download starts.
                </p>
              </div>
              <button onClick={onClose} className="text-ink-secondary hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
              placeholder="What do you think of Kubeb Client?"
              className="w-full resize-none rounded-xl border border-line bg-white/[0.03] px-3.5 py-3 text-[13.5px] text-ink placeholder:text-ink-secondary/60 focus:border-accent/50 focus:outline-none"
            />

            {error && <p className="mt-2 text-[12.5px] text-red-400">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-4 w-full rounded-xl bg-white px-5 py-3 text-[14px] font-semibold text-bg transition-transform hover:scale-[1.01] disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit & download"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
