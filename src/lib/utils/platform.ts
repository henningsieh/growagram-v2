/**
 * Utility functions for platform detection
 *
 * Provides future-proof platform detection that doesn't rely on deprecated APIs
 */

// Type definition for navigator.userAgentData (not yet in standard TypeScript libs)
interface NavigatorUAData {
  platform?: string;
}

declare global {
  interface Navigator {
    userAgentData?: NavigatorUAData;
    // Add platform property to Navigator interface (deprecated but still used)
    platform?: string;
  }
}

/**
 * Detects if the current platform is macOS/iOS for keyboard shortcut display
 *
 * This function prioritizes modern APIs but falls back gracefully:
 * 1. Uses navigator.userAgentData.platform (modern, limited support)
 * 2. Falls back to navigator.platform (deprecated but widely supported)
 * 3. Falls back to user agent string parsing as last resort
 *
 * @returns true if the platform is macOS/iOS, false otherwise
 */
export function isMacPlatform(): boolean {
  // Try modern userAgentData API first (limited browser support)
  if (navigator.userAgentData?.platform) {
    const platform = navigator.userAgentData.platform.toLowerCase();
    return (
      platform.includes("mac") || platform === "iphone" || platform === "ipad"
    );
  }

  // Fall back to deprecated platform property (widespread support)
  // Now properly typed through global interface extension
  const legacyPlatform = navigator.platform;
  if (legacyPlatform) {
    const platform = legacyPlatform.toLowerCase();
    return (
      platform.includes("mac") || platform === "iphone" || platform === "ipad"
    );
  }

  // Last resort: parse user agent string
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes("mac") ||
    userAgent.includes("iphone") ||
    userAgent.includes("ipad")
  );
}

/**
 * Gets the appropriate modifier key symbol for keyboard shortcuts
 *
 * @returns "⌘" for macOS/iOS, "Ctrl" for other platforms
 */
export function getModifierKey(): string {
  return isMacPlatform() ? "⌘" : "Ctrl";
}

/**
 * Gets the appropriate keyboard shortcut display string
 *
 * @param key - The key to combine with the modifier (e.g., "K", "S", "Enter")
 * @returns Formatted keyboard shortcut string (e.g., "⌘K" or "Ctrl+K")
 */
export function getKeyboardShortcut(key: string): string {
  const modifier = getModifierKey();
  const separator = modifier === "⌘" ? "" : "+";
  return `${modifier}${separator}${key}`;
}
