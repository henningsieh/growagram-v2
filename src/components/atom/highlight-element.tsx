// src/components/atom/highlight-element.tsx:
import * as React from "react";
import { HTMLMotionProps, motion, useAnimation } from "framer-motion";
import { cn } from "~/lib/utils";

interface HighlightElementProps
  extends Omit<HTMLMotionProps<"div">, "animate" | "transition"> {
  children?: React.ReactNode;
  isHighlighted?: boolean;
  className?: string;
}

export function HighlightElement({
  children,
  isHighlighted = false,
  className,
  ...props
}: HighlightElementProps) {
  const controls = useAnimation();

  React.useEffect(() => {
    if (isHighlighted) {
      void controls.start({
        backgroundColor: [
          "var(--accent)",
          "var(--accent)",
          "var(--accent)",
          "var(--accent)",
          "var(--accent)",
        ],
        opacity: [0.5, 0.4, 0.3, 0.4, 0.5],
        scale: [1, 0.99, 0.98, 0.99, 1],
      });
    } else {
      void controls.start({
        backgroundColor: "transparent",
        opacity: 0,
        scale: 1,
      });
    }
  }, [isHighlighted, controls]);

  return (
    <motion.div
      className={cn(
        "pointer-events-none absolute inset-0 mx-1 mb-1 rounded-sm",
        className,
      )}
      animate={controls}
      transition={{
        duration: 0.45,
        times: [0, 0.25, 0.5, 0.75, 1],
        ease: "easeInOut",
        repeat: 2,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
