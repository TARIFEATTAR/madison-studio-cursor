import { useState, useCallback, useRef } from "react";
import { EmailBlock } from "@/types/emailBlocks";

interface HistoryState {
  blocks: EmailBlock[];
  timestamp: number;
}

export function useEmailHistory(initialBlocks: EmailBlock[]) {
  const [history, setHistory] = useState<HistoryState[]>([
    { blocks: initialBlocks, timestamp: Date.now() }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastActionTime = useRef(Date.now());

  const pushToHistory = useCallback((blocks: EmailBlock[]) => {
    const now = Date.now();
    // Only push if more than 500ms since last action (debounce)
    if (now - lastActionTime.current < 500) {
      return;
    }
    
    lastActionTime.current = now;
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push({ blocks, timestamp: now });
      // Keep only last 50 states
      return newHistory.slice(-50);
    });
    setCurrentIndex(prev => Math.min(prev + 1, 49));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1].blocks;
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1].blocks;
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    pushToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

