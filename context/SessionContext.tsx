import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createSession } from "../lib/api";

type SessionContextValue = {
  sessionId: string | null;
  ensureSession: () => Promise<string>;
  resetSession: () => void;
  joinSession: (id: string) => void;
  loading: boolean;
  error: string | null;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureSession = useCallback(async () => {
    if (sessionId) return sessionId;
    setLoading(true);
    setError(null);
    try {
      const id = await createSession();
      setSessionId(id);
      return id;
    } catch (e: any) {
      setError(e?.message ?? "Erro desconhecido");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const resetSession = useCallback(() => {
    setSessionId(null);
    setError(null);
  }, []);

  const joinSession = useCallback((id: string) => {
    setSessionId(id);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ sessionId, ensureSession, resetSession, joinSession, loading, error }),
    [sessionId, ensureSession, resetSession, joinSession, loading, error]
  );

  // Auto-create on mount
  useEffect(() => {
    // fire and forget
    void ensureSession();
  }, [ensureSession]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession deve ser usado dentro de SessionProvider");
  return ctx;
}
