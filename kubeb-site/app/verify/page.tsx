"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import DiscordIcon from "@/components/icons/DiscordIcon";

export default function VerifyPage() {
  const { account, loading, login } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="chunk-bg pointer-events-none absolute inset-0" />
      <div className="relative w-full max-w-sm">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-card text-accent">
          <ShieldCheck size={24} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Verify your account</h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-secondary">
          To unlock the rest of the Discord server, your account needs to be
          at least 30 days old, have a verified email, and a verified phone
          number on Discord.
        </p>

        {loading ? (
          <div className="mt-8 h-12 animate-pulse rounded-xl bg-white/5" />
        ) : account ? (
          <div className="mt-8 flex flex-col items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-4 text-emerald-400">
            <CheckCircle2 size={22} />
            <span className="text-[13.5px] font-medium">You&apos;re verified, {account.username}. Head back to Discord.</span>
          </div>
        ) : (
          <button
            onClick={login}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-5 py-3.5 text-[14px] font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <DiscordIcon className="h-4 w-4" />
            Verify with Discord
          </button>
        )}
      </div>
    </div>
  );
}
