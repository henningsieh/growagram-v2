"use client";

// src/components/Layouts/progress-provider.tsx:
import { BProgressOptions } from "@bprogress/core";
import { ProgressProvider } from "@bprogress/next/app";

// Configure the ProgressProvider
const progressOptions: Partial<BProgressOptions> = {
  minimum: 0.08, // Start with slight progress to show immediate feedback
  maximum: 1.0,
  easing: "linear", // Smoother animation than 'linear'
  speed: 300, // Slightly faster animation
  trickle: true, // Continue incrementing
  trickleSpeed: 250, // Speed of the trickle
  showSpinner: true,
  barSelector: ".bar",
  spinnerSelector: ".spinner",
  parent: "div", // Parent element for the progress bar, this makes `<div className={className}>` work
  direction: "ltr",
  indeterminate: false, // Use determinate progress bar for better UX
};

// Create an enhanced provider with proper configuration
export function EnhancedProgressProvider({
  className,
  ...props
}: React.ComponentProps<typeof ProgressProvider> & {
  className?: string;
}) {
  return (
    <div className={className}>
      <ProgressProvider options={progressOptions} {...props} />
    </div>
  );
}
