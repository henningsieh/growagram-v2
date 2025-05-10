import * as React from "react";
import { throttle } from "lodash";

type IntersectionOptions = {
  threshold?: number;
  rootMargin?: string;
  root?: Element | null;
  throttleMs?: number;
};

/**
 * Hook for handling intersection observer with throttled callbacks
 * @param callback Function to call when intersection is detected
 * @param options Configuration options for the intersection observer
 * @returns Reference to attach to the observed element
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  callback: () => void,
  options: IntersectionOptions = {},
) {
  const {
    threshold = 0.01,
    rootMargin = "100px", // Load slightly before the element comes into view
    root = null,
    throttleMs = 300,
  } = options;

  // Create a ref to attach to the element we want to observe
  const elementRef = React.useRef<T>(null);

  // Throttle the callback to prevent excessive calls
  const throttledCallback = React.useMemo(
    () => throttle(callback, throttleMs),
    [callback, throttleMs],
  );

  // Intersection observer callback
  const onIntersect = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting) {
        throttledCallback();
      }
    },
    [throttledCallback],
  );

  // Set up the intersection observer
  React.useEffect(() => {
    const observer = new IntersectionObserver(onIntersect, {
      root,
      rootMargin,
      threshold,
    });

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    // Clean up the observer on unmount
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
      observer.disconnect();
    };
  }, [onIntersect, root, rootMargin, threshold]);

  return elementRef;
}
