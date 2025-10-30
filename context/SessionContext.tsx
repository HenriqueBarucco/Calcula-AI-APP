import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createSession } from "../lib/api";

type SessionContextValue = {
  sessionId: string | null;
  ensureSession: () => Promise<string>;
  resetSession: () => void;
  joinSession: (id: string) => void;
  loading: boolean;
  error: string | null;
  uploading: boolean;
  setUploading: (value: boolean) => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

const STORAGE_KEY = "@calcula-ai/session-id";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const hydrationPromiseRef = useRef<Promise<void> | null>(null);
  const hydrationResolveRef = useRef<(() => void) | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!hydrationPromiseRef.current) {
    hydrationPromiseRef.current = new Promise<void>((resolve) => {
      hydrationResolveRef.current = resolve;
    });
  }

  const ensureSession = useCallback(async () => {
    if (!hydrated) {
      const hydrationPromise = hydrationPromiseRef.current;
      if (hydrationPromise) {
        try {
          await hydrationPromise;
        } catch {
          // silently ignore hydration errors; ensureSession will handle creation below
        }
      }
    }
    const existingSession = sessionIdRef.current;
    if (existingSession) {
      if (!sessionId) setSessionId(existingSession);
      return existingSession;
    }
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
  }, [sessionId, hydrated]);

  const resetSession = useCallback(() => {
    setSessionId(null);
    setError(null);
    setUploading(false);
  }, []);

  const joinSession = useCallback((id: string) => {
    setSessionId(id);
    setError(null);
    setUploading(false);
  }, []);

  const value = useMemo(
    () => ({ sessionId, ensureSession, resetSession, joinSession, loading, error, uploading, setUploading }),
    [sessionId, ensureSession, resetSession, joinSession, loading, error, uploading, setUploading]
  );

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    let active = true;
    const hydrate = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && active) {
          sessionIdRef.current = stored;
          setSessionId(stored);
        }
      } catch {
        // ignore read errors; a fresh session will be created later
      } finally {
        if (active) {
          setHydrated(true);
          hydrationResolveRef.current?.();
          hydrationResolveRef.current = null;
        }
      }
    };

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || sessionId) return;
    void ensureSession();
  }, [hydrated, sessionId, ensureSession]);

  useEffect(() => {
    if (!hydrated) return;
    const persist = async () => {
      try {
        if (!sessionId) {
          await AsyncStorage.removeItem(STORAGE_KEY);
          return;
        }
        await AsyncStorage.setItem(STORAGE_KEY, sessionId);
      } catch {
        // ignore persistence errors to avoid blocking the app
      }
    };

    void persist();
  }, [sessionId, hydrated]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession deve ser usado dentro de SessionProvider");
  return ctx;
}
