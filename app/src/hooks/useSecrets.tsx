"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { secrets } from "@/data/relationship";

const STORAGE_KEY = "us.secrets.v1";
export const TOTAL_SECRETS = secrets.length;

interface SecretsState {
  found: ReadonlySet<string>;
  count: number;
  allFound: boolean;
  /** Номер последнего найденного секрета для тоста «Секрет N из 7» */
  lastFoundIndex: number | null;
  discover: (id: string) => void;
  clearToast: () => void;
}

const SecretsContext = createContext<SecretsState | null>(null);

export function SecretsProvider({ children }: { children: ReactNode }) {
  const [found, setFound] = useState<ReadonlySet<string>>(new Set());
  const [lastFoundIndex, setLastFoundIndex] = useState<number | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setFound(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* приватный режим и т.п. — просто начинаем с нуля */
    }
    hydrated.current = true;
  }, []);

  const discover = useCallback((id: string) => {
    setFound((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      const order = secrets.findIndex((s) => s.id === id);
      setLastFoundIndex(order >= 0 ? order + 1 : next.size);
      if (hydrated.current) {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
        } catch {
          /* noop */
        }
      }
      return next;
    });
  }, []);

  const clearToast = useCallback(() => setLastFoundIndex(null), []);

  return (
    <SecretsContext.Provider
      value={{
        found,
        count: found.size,
        allFound: found.size >= TOTAL_SECRETS,
        lastFoundIndex,
        discover,
        clearToast,
      }}
    >
      {children}
    </SecretsContext.Provider>
  );
}

export function useSecrets(): SecretsState {
  const ctx = useContext(SecretsContext);
  if (!ctx) throw new Error("useSecrets должен использоваться внутри SecretsProvider");
  return ctx;
}
