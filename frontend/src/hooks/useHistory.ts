import { useCallback, useEffect, useState } from "react";
import { addHistoryItem, clearHistory, loadHistory } from "@/lib/storage";
import type { AnalysisHistoryItem } from "@/lib/types";

const MAX_ITEMS = 10;

export function useHistory() {
  const [items, setItems] = useState<AnalysisHistoryItem[]>([]);

  useEffect(() => {
    setItems(loadHistory());
  }, []);

  const addItem = useCallback((item: AnalysisHistoryItem) => {
    const next = addHistoryItem(item, MAX_ITEMS);
    setItems(next);
  }, []);

  const clear = useCallback(() => {
    clearHistory();
    setItems([]);
  }, []);

  return { items, addItem, clear };
}
