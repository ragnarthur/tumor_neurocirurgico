import { useState } from "react";
import { predictImage } from "@/lib/api";
import type { PredictResponse } from "@/lib/types";

export function useAnalysis() {
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);

  const analyze = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setElapsedMs(null);
    const started = performance.now();
    try {
      const data = await predictImage(file);
      const elapsed = performance.now() - started;
      setResult(data);
      setElapsedMs(elapsed);
      return { data, elapsedMs: elapsed };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro inesperado";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, elapsedMs, analyze, setResult, setError };
}
