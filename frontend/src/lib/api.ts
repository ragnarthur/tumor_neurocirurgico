import type { PredictResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";

export async function predictImage(file: File): Promise<PredictResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/predict/`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Erro na API (${res.status})`);
  }

  return (await res.json()) as PredictResponse;
}

export { API_BASE };
