import { useEffect } from "react";

interface KeyboardShortcutsConfig {
  onUndo?: () => void;
  onRedo?: () => void;
  onSave?: () => void;
  onPreview?: () => void;
  onSearchFocus?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onUndo,
  onRedo,
  onSave,
  onPreview,
  onSearchFocus,
  onEscape,
  enabled = true,
}: KeyboardShortcutsConfig) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Ctrl/Cmd + Z - Undo
      if (modifier && e.key === 'z' && !e.shiftKey && onUndo) {
        e.preventDefault();
        onUndo();
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y - Redo
      if (modifier && ((e.key === 'z' && e.shiftKey) || e.key === 'y') && onRedo) {
        e.preventDefault();
        onRedo();
      }

      // Ctrl/Cmd + S - Save
      if (modifier && e.key === 's' && onSave) {
        e.preventDefault();
        onSave();
      }

      // Ctrl/Cmd + P - Preview
      if (modifier && e.key === 'p' && onPreview) {
        e.preventDefault();
        onPreview();
      }

      // Ctrl/Cmd + K or / - Search Focus
      if ((modifier && e.key === 'k') || e.key === '/' && onSearchFocus) {
        e.preventDefault();
        onSearchFocus();
      }

      // Escape - Custom escape handler
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onUndo, onRedo, onSave, onPreview, onSearchFocus, onEscape]);
}
