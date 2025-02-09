import { HTMLMotionProps, motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { cn } from "~/lib/utils";

interface HighlightElementProps
  extends Omit<HTMLMotionProps<"div">, "animate" | "transition"> {
  children: React.ReactNode;
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

  useEffect(() => {
    if (isHighlighted) {
      void controls.start({
        backgroundColor: [
          "hsl(var(--accent) / 0.6",
          "hsl(var(--accent) / 0.5",
          "hsl(var(--accent) / 0.4",
          "hsl(var(--accent) / 0.5",
          "hsl(var(--accent) / 0.6",
        ],
        scale: [1, 0.99, 0.98, 0.99, 1],
      });
    } else {
      void controls.start({
        backgroundColor: "transparent",
        scale: 1,
      });
    }
  }, [isHighlighted, controls]);

  return (
    <motion.div
      className={cn("relative rounded-sm", className)}
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
