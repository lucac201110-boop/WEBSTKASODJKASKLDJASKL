const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export type PublicStats = { member_count: number; active_license_count: number };
export type ChangelogEntry = { version: string; date: string; tag: string | null; entries: string[] };
export type Vouch = { discord_username: string; message: string; created_at: string };
export type Account = {
  session_token: string;
  discord_id: string;
  username: string;
  avatar: string | null;
  has_customer_role: boolean;
  license_status: {
    valid: boolean;
    key: string | null;
    duration_label: string | null;
    expires_at: string | null;
  } | null;
};

async function safeGet<T>(path: string, fallback: T): Promise<T> {
  if (!API_URL) return fallback;
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export function getPublicStats() {
  return safeGet<PublicStats>("/public/stats", { member_count: 0, active_license_count: 0 });
}

export function getChangelog() {
  return safeGet<ChangelogEntry[]>("/changelog", []);
}

export function getVouches() {
  return safeGet<Vouch[]>("/vouches", []);
}

export async function getAccount(): Promise<Account | null> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Account;
  } catch {
    return null;
  }
}

export async function submitVouch(message: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/vouches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: "Something went wrong." }));
      return { ok: false, error: body.detail };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error." };
  }
}

export function loginWithDiscordUrl() {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? "";
  const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI ?? "";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify email",
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
