import { useCallback, useRef, useState } from "react";
import {
  runConsistencySet,
  type ConsistencyRunHandle,
  type ConsistencySetPayload,
  type VariationItem,
} from "@/lib/consistencyMode";

export type ConsistencySetStatus = "idle" | "running" | "complete" | "error";

export interface UseConsistencySetResult {
  status: ConsistencySetStatus;
  setId: string | null;
  seed: number | null;
  items: VariationItem[];
  progress: { current: number; total: number };
  error: string | null;
  run: (payload: ConsistencySetPayload) => void;
  cancel: () => void;
  reset: () => void;
}

/**
 * Drives a Consistency Mode generation run and exposes the queue as React
 * state so progress UI updates as each variation completes.
 */
export function useConsistencySet(): UseConsistencySetResult {
  const [status, setStatus] = useState<ConsistencySetStatus>("idle");
  const [setId, setSetId] = useState<string | null>(null);
  const [seed, setSeed] = useState<number | null>(null);
  const [items, setItems] = useState<VariationItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const handleRef = useRef<ConsistencyRunHandle | null>(null);

  const run = useCallback((payload: ConsistencySetPayload) => {
    // If an existing run is still in flight, cancel it before starting fresh.
    if (handleRef.current && status === "running") {
      handleRef.current.cancel();
    }

    setStatus("running");
    setError(null);

    const handle = runConsistencySet(payload, {
      onItemUpdate: (updated) => {
        setItems((prev) => {
          const next = [...prev];
          next[updated.position] = updated;
          return next;
        });
      },
      onComplete: (finalItems) => {
        setItems(finalItems);
        // If every item errored or was cancelled, treat the run as "error".
        const anySuccess = finalItems.some((item) => item.status === "complete");
        setStatus(anySuccess ? "complete" : "error");
        if (!anySuccess) {
          setError("All variations failed — check the edge function logs.");
        }
      },
      onError: (err) => {
        setStatus("error");
        setError(err.message);
      },
    });

    handleRef.current = handle;
    setSetId(handle.setId);
    setSeed(handle.seed);
    setItems(handle.items);
  }, [status]);

  const cancel = useCallback(() => {
    handleRef.current?.cancel();
  }, []);

  const reset = useCallback(() => {
    handleRef.current?.cancel();
    handleRef.current = null;
    setStatus("idle");
    setSetId(null);
    setSeed(null);
    setItems([]);
    setError(null);
  }, []);

  const total = items.length;
  const current = items.filter((item) =>
    item.status === "complete" ||
    item.status === "error" ||
    item.status === "cancelled"
  ).length;

  return {
    status,
    setId,
    seed,
    items,
    progress: { current, total },
    error,
    run,
    cancel,
    reset,
  };
}
