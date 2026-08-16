"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";
import Image from "next/image";
import { navLinks } from "@/lib/data";
import DiscordIcon from "@/components/icons/DiscordIcon";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { account, loading, login, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const avatarUrl =
    account?.avatar && account.discord_id
      ? `https://cdn.discordapp.com/avatars/${account.discord_id}/${account.avatar}.png?size=64`
      : null;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-line bg-bg/70 backdrop-blur-xl" : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="/#home" className="flex items-center gap-2.5">
          <span className="h-6 w-6 rounded-[6px] bg-gradient-to-br from-accent to-accent-secondary" />
          <span className="text-[15px] font-semibold tracking-tight">Kubeb Client</span>
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="group relative text-[13.5px] text-ink-secondary transition-colors hover:text-ink"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center md:flex">
          {loading ? (
            <div className="h-9 w-32 animate-pulse rounded-lg bg-white/5" />
          ) : account ? (
            <button
              onClick={logout}
              className="group flex items-center gap-2 rounded-lg border border-line bg-card px-3.5 py-2 text-[13px] font-medium text-ink transition-colors hover:border-white/20"
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" width={20} height={20} className="rounded-full" unoptimized />
              ) : (
                <span className="h-5 w-5 rounded-full bg-gradient-to-br from-accent to-accent-secondary" />
              )}
              <span className="max-w-[100px] truncate">{account.username}</span>
              <LogOut size={13} className="text-ink-secondary opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ) : (
            <button
              onClick={login}
              className="flex items-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2 text-[13px] font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <DiscordIcon className="h-4 w-4" />
              Login with Discord
            </button>
          )}
        </div>

        <button
          aria-label="Toggle menu"
          className="text-ink md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-line bg-bg/95 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-[14px] text-ink-secondary hover:bg-white/[0.04] hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-1">
                {account ? (
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg border border-line bg-card px-3 py-2.5 text-[14px] font-medium text-ink"
                  >
                    <LogOut size={14} />
                    Log out ({account.username})
                  </button>
                ) : (
                  <button
                    onClick={login}
                    className="flex w-full items-center gap-2 rounded-lg bg-[#5865F2] px-3 py-2.5 text-[14px] font-medium text-white"
                  >
                    <DiscordIcon className="h-4 w-4" />
                    Login with Discord
                  </button>
                )}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
