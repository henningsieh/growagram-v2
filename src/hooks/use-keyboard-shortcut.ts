import { useEffect } from "react";

/**
 * Custom hook for handling keyboard shortcuts
 * @param key - The key to listen for (e.g., "k", "Enter", "Escape")
 * @param callback - Function to call when the shortcut is pressed
 * @param options - Configuration options
 */
export function useKeyboardShortcut(
  key: string,
  callback: (event: KeyboardEvent) => void,
  options?: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    preventDefault?: boolean;
    enabled?: boolean;
  },
) {
  useEffect(() => {
    const {
      ctrlKey = false,
      metaKey = false,
      shiftKey = false,
      altKey = false,
      preventDefault = true,
      enabled = true,
    } = options ?? {};

    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if the pressed key matches
      if (event.key.toLowerCase() !== key.toLowerCase()) return;

      // Check modifier keys - for Ctrl+K or Cmd+K, we want either one
      if (ctrlKey && metaKey) {
        // Both specified means either Ctrl OR Cmd should work
        if (!event.ctrlKey && !event.metaKey) return;
      } else {
        // Individual modifier checks
        if (ctrlKey && !event.ctrlKey) return;
        if (metaKey && !event.metaKey) return;
      }

      if (shiftKey && !event.shiftKey) return;
      if (altKey && !event.altKey) return;

      if (preventDefault) {
        event.preventDefault();
      }

      callback(event);
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [key, callback, options]);
}
