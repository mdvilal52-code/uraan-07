"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

interface AuthValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (name: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Guards against a stale response clobbering fresher auth state. The
  // initial `/api/auth/me` call fires on every mount (including the moment
  // the register/login page loads) and is the *first* request to touch the
  // database that request — so on a cold server it can pay the full
  // schema-bootstrap cost and be genuinely slow. If a user fills the form
  // and submits before it resolves, `register`/`login` finish first and set
  // `user` correctly — but the slow `/api/auth/me` response, requested
  // *before* the session cookie existed, still resolves afterwards with
  // `user: null` and would silently log them back out right as the page
  // lands on /profile. Only the most recently *started* call is allowed to
  // write to state; every earlier one is a no-op once superseded.
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++requestIdRef.current;
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (id === requestIdRef.current) setUser(data.user ?? null);
    } catch {
      if (id === requestIdRef.current) setUser(null);
    } finally {
      if (id === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const id = ++requestIdRef.current;
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { error: data.error ?? "تعذّر تسجيل الدخول" };
      if (id === requestIdRef.current) {
        setUser(data.user);
        setLoading(false);
      }
      return {};
    } catch {
      return { error: "تعذّر الاتصال بالخادم، تحقّقي من الإنترنت." };
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const id = ++requestIdRef.current;
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { error: data.error ?? "تعذّر إنشاء الحساب" };
        if (id === requestIdRef.current) {
          setUser(data.user);
          setLoading(false);
        }
        return {};
      } catch {
        return { error: "تعذّر الاتصال بالخادم، تحقّقي من الإنترنت." };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    // Bump the request id so any in-flight `/api/auth/me` (or login/register)
    // response can no longer write `user` back in after we've logged out.
    ++requestIdRef.current;
    // Logout is an explicit intent to end the session. Clear local auth state
    // unconditionally and never let a network failure surface as an unhandled
    // rejection — the client must end up logged out regardless of whether the
    // server round-trip succeeds. The cookie is cleared by the response when it
    // does reach the server; a failed call at worst leaves a dangling
    // server-side session row, never a stuck-logged-in client.
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* offline / server unreachable — still clear the client below */
    }
    setUser(null);
    setLoading(false);
  }, []);

  const updateProfile = useCallback(async (name: string) => {
    const id = ++requestIdRef.current;
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { error: data.error ?? "تعذّر تحديث الاسم" };
      if (id === requestIdRef.current) setUser(data.user);
      return {};
    } catch {
      return { error: "تعذّر الاتصال بالخادم، تحقّقي من الإنترنت." };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refresh, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
