// Tiny client-side auth store (demo only). Persists in localStorage so refresh keeps the session.
// NOTE: This is a UI-only demo; real apps must validate sessions on the server.

const KEY = "bot_hrms_session";

export interface Session {
  phone: string;
  name: string;
  role: "admin";
  token: string;
  loggedInAt: number;
  companyName?: string;
  companyLogo?: string;
  address?: string;
  email?: string;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("bot-auth-change"));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("bot-auth-change"));
}
