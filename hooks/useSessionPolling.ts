import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SessionDetails, getSession } from "../lib/api";

const DEFAULT_INTERVAL = 3000;

export type UseSessionPollingResult = {
  data: SessionDetails | null;
  setData: Dispatch<SetStateAction<SessionDetails | null>>;
  error: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  reset: () => void;
  clearError: () => void;
};

export function useSessionPolling(sessionId?: string | null, interval: number = DEFAULT_INTERVAL): UseSessionPollingResult {
  const [data, setData] = useState<SessionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(true);

  const clearPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetState = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const fetchSession = useCallback(async (showLoading = false) => {
    if (!sessionId) return;
    if (showLoading) setLoading(true);

    try {
      const result = await getSession(sessionId);
      if (!activeRef.current) return;
      setData(result);
      setError(null);
    } catch (err: any) {
      if (!activeRef.current) return;
      setError(err?.message ?? "Erro ao carregar sessão");
    } finally {
      if (!activeRef.current) return;
      if (showLoading) setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    activeRef.current = true;
    clearPolling();

    if (!sessionId) {
      resetState();
      return () => {
        activeRef.current = false;
      };
    }

    fetchSession(true).catch(() => undefined);
    intervalRef.current = setInterval(() => {
      fetchSession().catch(() => undefined);
    }, interval);

    return () => {
      activeRef.current = false;
      clearPolling();
    };
  }, [sessionId, interval, fetchSession, clearPolling, resetState]);

  const refresh = useCallback(async () => {
    await fetchSession(true);
  }, [fetchSession]);

  const reset = useCallback(() => {
    clearPolling();
    resetState();
  }, [clearPolling, resetState]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    setData,
    error,
    loading,
    refresh,
    reset,
    clearError,
  };
}
