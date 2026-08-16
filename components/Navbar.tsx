"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/converter", label: "Converter" },
  { href: "/verify", label: "Verify" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/70 bg-bg/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-mono text-[15px] font-bold tracking-tight">
          <span className="text-accent">kubeb</span><span className="text-ink">.</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative rounded-lg px-3 py-2 text-[13px] text-ink-secondary transition-colors hover:text-ink"
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-white/[0.04]"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a
            href="https://discord.gg/"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-[12.5px] font-medium text-ink-secondary transition-colors hover:border-white/20 hover:text-ink"
          >
            Discord
          </a>
          <Link
            href="/download"
            className="rounded-lg bg-white px-3.5 py-2 text-[12.5px] font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Download
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-line p-2 text-ink-secondary md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={17} /> : <Menu size={17} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line md:hidden"
          >
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-[13px] text-ink-secondary hover:bg-white/[0.03] hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/download"
                onClick={() => setOpen(false)}
                className="mt-1 rounded-lg bg-white px-3 py-2.5 text-center text-[13px] font-semibold text-bg"
              >
                Download
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
