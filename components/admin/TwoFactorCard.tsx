"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldOff, Loader2, Copy, Check } from "lucide-react";

const inputCls =
  "w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-400 placeholder:text-ink-faint";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card space-y-4 p-5">
      <h3 className="font-sans text-base font-bold text-ink">{title}</h3>
      {children}
    </div>
  );
}

type Stage = "loading" | "idle" | "setup" | "backup-codes" | "enabled" | "disabling";

export function TwoFactorCard() {
  const [stage, setStage] = useState<Stage>("loading");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setStage(d.user?.twoFactorEnabled ? "enabled" : "idle"))
      .catch(() => setError("Unable to load two-factor status"));
  }, []);

  async function beginSetup() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/2fa/setup", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Unable to start setup");
        return;
      }
      setSecret(data.secret);
      setStage("setup");
    } catch {
      setError("Unable to reach the server — please check your connection.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmSetup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/2fa/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Incorrect code");
        return;
      }
      setBackupCodes(data.backupCodes ?? []);
      setCode("");
      setStage("backup-codes");
    } catch {
      setError("Unable to reach the server — please check your connection.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDisable(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Unable to disable two-factor authentication");
        return;
      }
      setPassword("");
      setStage("idle");
    } catch {
      setError("Unable to reach the server — please check your connection.");
    } finally {
      setBusy(false);
    }
  }

  function copySecret() {
    navigator.clipboard
      .writeText(secret)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  if (stage === "loading") {
    return (
      <div className="card grid place-items-center py-10 text-ink-muted">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <Card title="Two-Factor Authentication">
      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      {stage === "enabled" && (
        <>
          <div className="flex items-center gap-2 text-sm font-semibold text-forest-700">
            <ShieldCheck className="h-5 w-5" />
            Two-factor authentication is enabled on your account.
          </div>
          <button type="button" onClick={() => setStage("disabling")} className="btn-outline">
            Disable
          </button>
        </>
      )}

      {stage === "disabling" && (
        <form onSubmit={confirmDisable} className="space-y-3">
          <p className="text-sm text-ink-muted">
            Enter your password to turn two-factor authentication off. This also signs out
            any other active sessions on this account.
          </p>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-ink-soft">Password</span>
            <input
              type="password"
              className={inputCls}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-forest disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Disable
            </button>
            <button
              type="button"
              onClick={() => {
                setStage("enabled");
                setPassword("");
                setError("");
              }}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {stage === "idle" && (
        <>
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-muted">
            <ShieldOff className="h-5 w-5" />
            Two-factor authentication is not enabled.
          </div>
          <p className="text-sm text-ink-muted">
            Add a second step at login using any authenticator app (Google Authenticator,
            Authy, 1Password, etc).
          </p>
          <button
            type="button"
            onClick={beginSetup}
            disabled={busy}
            className="btn-forest disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Enable Two-Factor Authentication
          </button>
        </>
      )}

      {stage === "setup" && (
        <form onSubmit={confirmSetup} className="space-y-3">
          <p className="text-sm text-ink-muted">
            Add this key to your authenticator app (Google Authenticator, Authy, 1Password,
            etc — most also accept pasting a setup key directly), then confirm with the
            6-digit code it generates.
          </p>
          <div>
            <span className="mb-1 block text-xs font-bold text-ink-soft">Setup Key</span>
            <div className="flex items-center gap-2 rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3">
              <code className="flex-1 select-all break-all text-xs text-ink">{secret}</code>
              <button type="button" onClick={copySecret} aria-label="Copy setup key">
                {copied ? (
                  <Check className="h-4 w-4 text-forest-600" />
                ) : (
                  <Copy className="h-4 w-4 text-ink-muted" />
                )}
              </button>
            </div>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-ink-soft">6-Digit Code</span>
            <input
              className={inputCls}
              placeholder="123456"
              autoComplete="one-time-code"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-forest disabled:opacity-60">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm
            </button>
            <button
              type="button"
              onClick={() => {
                setStage("idle");
                setCode("");
                setError("");
              }}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {stage === "backup-codes" && (
        <>
          <p className="text-sm font-semibold text-ink">
            Two-factor authentication is now enabled. Save these backup codes somewhere
            safe — each one can be used once if you lose access to your authenticator app.
            They won&apos;t be shown again.
          </p>
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-cream-300 bg-cream-50 p-4 font-mono text-sm text-ink">
            {backupCodes.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setStage("enabled");
              setBackupCodes([]);
            }}
            className="btn-forest"
          >
            Done
          </button>
        </>
      )}
    </Card>
  );
}
