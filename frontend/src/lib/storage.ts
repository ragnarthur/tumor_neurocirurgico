import type { AnalysisHistoryItem } from "./types";

const STORAGE_KEY = "neuro_history_v1";

export function loadHistory(): AnalysisHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AnalysisHistoryItem[];
  } catch {
    return [];
  }
}

export function saveHistory(items: AnalysisHistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addHistoryItem(item: AnalysisHistoryItem, maxItems = 10) {
  const current = loadHistory();
  const next = [item, ...current].slice(0, maxItems);
  saveHistory(next);
  return next;
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
