import * as React from "react";

import { cn } from "~/lib/utils";

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

/**
 * Kbd component for displaying keyboard shortcuts with consistent styling
 *
 * @example
 * // For platform-specific shortcuts, use the platform utility:
 * import { getKeyboardShortcut } from "~/lib/utils/platform";
 * <Kbd>{getKeyboardShortcut("K")}</Kbd> // Shows "⌘K" on Mac, "Ctrl+K" on others
 *
 * // For simple key combinations:
 * <Kbd>Enter</Kbd>
 * <Kbd>Esc</Kbd>
 */
const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <kbd
        ref={ref}
        className={cn(
          "bg-muted text-muted-foreground rounded border px-1.5 py-0.5 font-mono text-xs",
          className,
        )}
        {...props}
      >
        {children}
      </kbd>
    );
  },
);
Kbd.displayName = "Kbd";

export { Kbd };
