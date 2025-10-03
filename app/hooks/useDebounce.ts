// hooks/useDebounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useSearchHistory(userId?: string) {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    if (userId) {
      const history = localStorage.getItem(`searchHistory_${userId}`);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    }
  }, [userId]);

  const addToHistory = (query: string) => {
    if (!query.trim()) return;

    const updatedHistory = [
      query,
      ...searchHistory.filter((item) => item !== query),
    ].slice(0, 10); // Keep only last 10 searches

    setSearchHistory(updatedHistory);

    if (userId) {
      localStorage.setItem(
        `searchHistory_${userId}`,
        JSON.stringify(updatedHistory)
      );
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    if (userId) {
      localStorage.removeItem(`searchHistory_${userId}`);
    }
  };

  return { searchHistory, addToHistory, clearHistory };
}
