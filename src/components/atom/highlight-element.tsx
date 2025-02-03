import { HTMLMotionProps, motion } from "framer-motion";
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
  return (
    <motion.div
      className={cn("relative rounded-md", className)}
      animate={
        isHighlighted
          ? {
              backgroundColor: [
                "hsl(var(--accent) / 0.2)",
                "hsl(var(--accent) / 0.3)",
                "hsl(var(--accent) / 0.4)",
                "hsl(var(--accent) / 0.3)",
                "hsl(var(--accent) / 0.2)",
              ],
              scale: [1, 0.99, 0.98, 0.99, 1], // More subtle scale
            }
          : {}
      }
      transition={{
        duration: 0.66, // Faster duration
        times: [0, 0.25, 0.5, 0.75, 1],
        ease: "easeInOut",
        repeat: 2, // Reduced repeat count
        repeatType: "reverse",
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
