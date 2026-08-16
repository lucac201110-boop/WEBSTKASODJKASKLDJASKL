"use client";

import { motion } from "framer-motion";
import { KeyRound, Calendar, ShieldCheck, ShieldOff } from "lucide-react";
import SectionReveal from "@/components/SectionReveal";
import { useAuth } from "@/lib/auth-context";

function daysRemaining(expiresAt: string | null): string {
  if (!expiresAt) return "Lifetime";
  const diff = new Date(expiresAt).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Expired";
  return `${days} day${days === 1 ? "" : "s"} left`;
}

export default function LicenseInfoSection() {
  const { account, loading } = useAuth();

  if (loading || !account) return null;

  const status = account.license_status;
  const hasValid = account.has_customer_role && status?.valid;

  return (
    <section className="py-10">
      <div className="mx-auto max-w-3xl px-6">
        <SectionReveal>
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-line bg-card p-5 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              {hasValid ? (
                <ShieldCheck size={18} className="text-emerald-400" />
              ) : (
                <ShieldOff size={18} className="text-ink-secondary" />
              )}
              <div>
                <div className="text-[11px] text-ink-secondary">Role</div>
                <div className="text-[13.5px] font-medium">{hasValid ? "Customer" : "No active license"}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <KeyRound size={18} className="text-accent" />
              <div>
                <div className="text-[11px] text-ink-secondary">License key</div>
                <div className="font-mono text-[13.5px] font-medium">
                  {status?.key ? `${status.key.slice(0, 7)}…` : "—"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-accent-secondary" />
              <div>
                <div className="text-[11px] text-ink-secondary">Time remaining</div>
                <div className="text-[13.5px] font-medium">
                  {hasValid ? daysRemaining(status?.expires_at ?? null) : "—"}
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
