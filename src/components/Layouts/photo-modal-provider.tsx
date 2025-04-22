"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { FocusTrap } from "focus-trap-react";
import { ExpandIcon, MaximizeIcon, X } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { useIsMobile } from "~/hooks/use-mobile";
import { cn } from "~/lib/utils";

interface ImageModalContextType {
  openImageModal: (imageUrl: string) => void;
  closeImageModal: () => void;
}

const ImageModalContext = React.createContext<
  ImageModalContextType | undefined
>(undefined);

export const useImageModal = () => {
  const context = React.useContext(ImageModalContext);
  if (!context) {
    throw new Error("useImageModal must be used within an ImageModalProvider");
  }
  return context;
};

export function PhotoModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState("");
  const [isZoomedView, setIsZoomedView] = React.useState(false);

  const modalRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLDivElement>(null);
  const originalBodyOverflowRef = React.useRef<string>("");

  const [scale, setScale] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const isDragging = React.useRef(false);
  const dragStart = React.useRef({ x: 0, y: 0 });

  const t = useTranslations("Photos");
  const isMobile = useIsMobile();

  // Helper function to determine if zoom should be disabled
  const isZoomDisabled = React.useMemo(() => {
    return isMobile && !isZoomedView;
  }, [isMobile, isZoomedView]);

  const openImageModal = React.useCallback((url: string) => {
    setImageUrl(url);
    setIsModalOpen(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomedView(false);
  }, []);

  const closeImageModal = React.useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const toggleZoomedView = React.useCallback(() => {
    setIsZoomedView((prev) => !prev);
    setScale(1);
    setPosition({ x: 0, y: 0 });

    // Make sure we reset any transform-related styles when toggling
    if (imageRef.current) {
      imageRef.current.style.transition = "transform 0.3s ease-out";
    }
  }, []);

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeImageModal();
      } else if ((e.key === "+" || e.key === "=") && isZoomedView) {
        const newScale = Math.min(scale + 0.1, 4);

        if (imageRef.current) {
          // Get the viewport center
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const viewportCenterX = viewportWidth / 2;
          const viewportCenterY = viewportHeight / 2;

          // Calculate how the position should change to keep the viewport center fixed
          const scaleFactor = newScale / scale;
          const newX =
            viewportCenterX - (viewportCenterX - position.x) * scaleFactor;
          const newY =
            viewportCenterY - (viewportCenterY - position.y) * scaleFactor;

          setPosition({ x: newX, y: newY });
        }

        setScale(newScale);
        e.preventDefault();
      } else if (e.key === "-" && isZoomedView) {
        const newScale = Math.max(scale - 0.1, 1);

        if (imageRef.current) {
          // Get the viewport center
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          const viewportCenterX = viewportWidth / 2;
          const viewportCenterY = viewportHeight / 2;

          // Calculate how the position should change to keep the viewport center fixed
          const scaleFactor = newScale / scale;

          // If we're approaching scale = 1, progressively center the image
          if (newScale <= 1.05) {
            // When very close to scale 1, snap to center
            setPosition({ x: 0, y: 0 });
          } else {
            const centeringStrength = 1 - (newScale - 1) / 3; // Stronger centering as scale approaches 1
            const newX =
              viewportCenterX -
              (viewportCenterX - position.x) *
                scaleFactor *
                (1 - 0.1 * centeringStrength);
            const newY =
              viewportCenterY -
              (viewportCenterY - position.y) *
                scaleFactor *
                (1 - 0.1 * centeringStrength);
            setPosition({ x: newX, y: newY });
          }
        }

        setScale(newScale);
        e.preventDefault();
      } else if (e.key === "0" && isZoomedView) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        e.preventDefault();
      } else if (e.key === "z") {
        // Toggle zoom view when pressing 'z'
        toggleZoomedView();
        e.preventDefault();
      }
    },
    [closeImageModal, scale, isZoomedView, position, toggleZoomedView],
  );

  React.useEffect(() => {
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isModalOpen, handleKeyDown]);

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent | MouseEvent | TouchEvent | React.TouchEvent) => {
      if (!isDragging.current) return;

      // Prevent default browser behavior for touch events
      if ("touches" in e) {
        e.preventDefault();
      }

      requestAnimationFrame(() => {
        // Handle both mouse and touch events
        const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
        const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

        const newX = clientX - dragStart.current.x;
        const newY = clientY - dragStart.current.y;
        setPosition({ x: newX, y: newY });
      });
    },
    [],
  );

  const handleMouseUp = React.useCallback(() => {
    isDragging.current = false;
    if (imageRef.current) {
      imageRef.current.style.transition = "transform 0.2s ease-out";
    }
  }, []);

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isZoomedView) return;
      isDragging.current = true;

      // Handle both mouse and touch events
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      dragStart.current = {
        x: clientX - position.x,
        y: clientY - position.y,
      };

      if (imageRef.current) {
        imageRef.current.style.transition = "none";
      }

      // Only prevent default if it's cancelable
      if (e.cancelable) {
        e.preventDefault();
      }
    },
    [isZoomedView, position.x, position.y],
  );

  const handleWheel = (e: React.WheelEvent) => {
    // Prevent zoom when disabled
    if (isZoomDisabled || !isZoomedView) return;

    e.preventDefault();
    const delta = e.deltaY * -0.002;
    const newScale = Math.max(1, Math.min(4, scale * (1 + delta)));

    if (imageRef.current) {
      // Get the mouse position relative to the viewport
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // When zooming out to scale = 1, progressively center the image
      if (delta < 0 && newScale <= 1.1) {
        const centeringFactor = 1 - (newScale - 1) / 0.1;

        if (newScale <= 1.01) {
          // When very close to scale 1, snap to center
          setPosition({ x: 0, y: 0 });
        } else {
          // Progressive centering
          setPosition((prev) => ({
            x: prev.x * (1 - 0.2 * centeringFactor),
            y: prev.y * (1 - 0.2 * centeringFactor),
          }));
        }
      } else {
        // Calculate how the position should change to keep the mouse position fixed
        const scaleFactor = newScale / scale;
        const newX = mouseX - (mouseX - position.x) * scaleFactor;
        const newY = mouseY - (mouseY - position.y) * scaleFactor;
        setPosition({ x: newX, y: newY });
      }
    }

    setScale(newScale);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Prevent zoom when disabled
    if (isZoomDisabled) return;

    if (isZoomedView) {
      if (scale === 1) {
        // Zoom in to 2x at the point where the user double-clicked
        const newScale = 2;
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Calculate position to keep the double-clicked point fixed
        const newX = mouseX - (mouseX - position.x) * (newScale / scale);
        const newY = mouseY - (mouseY - position.y) * (newScale / scale);

        setScale(newScale);
        setPosition({ x: newX, y: newY });
      } else {
        // Reset to scale 1
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    }
  };

  // Track touch points for pinch-to-zoom
  const touchPoints = React.useRef<React.Touch[]>([]);
  const lastDistance = React.useRef<number>(0);
  const lastMidpoint = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Calculate distance between two touch points
  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate midpoint between two touch points
  const getMidpoint = (touch1: React.Touch, touch2: React.Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  // Handle touch start for pinch detection
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isZoomedView) return;

    // Prevent pinch zoom when disabled
    if (isZoomDisabled && e.touches.length === 2) {
      if (e.cancelable) {
        e.preventDefault();
      }
      return;
    }

    // Store touch points for pinch detection
    if (e.touches.length === 2) {
      // Use type assertion to convert to React.Touch[]
      touchPoints.current = Array.from(e.touches);
      lastDistance.current = getDistance(e.touches[0], e.touches[1]);
      lastMidpoint.current = getMidpoint(e.touches[0], e.touches[1]);

      // Disable dragging when pinching
      isDragging.current = false;

      if (imageRef.current) {
        imageRef.current.style.transition = "none";
      }
    } else if (e.touches.length === 1) {
      // Single touch - handle as drag
      handleMouseDown(e);
    }
  };

  // Handle touch move for pinch-to-zoom
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isZoomedView) return;

    // Block pinch zoom when disabled
    if (isZoomDisabled && e.touches.length === 2) {
      if (e.cancelable) {
        e.preventDefault();
      }
      return;
    }

    if (e.touches.length === 2) {
      // Prevent default to disable browser pinch zoom
      if (e.cancelable) {
        e.preventDefault();
      }

      // Calculate new distance between touch points
      const newDistance = getDistance(e.touches[0], e.touches[1]);
      const newMidpoint = getMidpoint(e.touches[0], e.touches[1]);

      // Calculate pinch delta and apply zoom
      const delta = newDistance / lastDistance.current;
      const newScale = Math.max(1, Math.min(4, scale * delta));

      if (newScale !== scale) {
        // Calculate how the position should change to keep the pinch center fixed
        const scaleFactor = newScale / scale;

        // Calculate the position adjustment needed to keep the midpoint fixed
        // This is the key improvement - we need to account for both the scale change
        // and the movement of the midpoint
        const midpointDeltaX = newMidpoint.x - lastMidpoint.current.x;
        const midpointDeltaY = newMidpoint.y - lastMidpoint.current.y;

        // The new position needs to:
        // 1. Account for the scale change (like we did before)
        // 2. Account for the movement of the midpoint (add the delta)
        const newX =
          newMidpoint.x -
          (newMidpoint.x - position.x) * scaleFactor +
          midpointDeltaX;
        const newY =
          newMidpoint.y -
          (newMidpoint.y - position.y) * scaleFactor +
          midpointDeltaY;

        // When zooming out to scale = 1, progressively center the image
        if (delta < 1 && newScale <= 1.1) {
          const centeringFactor = 1 - (newScale - 1) / 0.1;

          if (newScale <= 1.01) {
            // When very close to scale 1, snap to center
            setPosition({ x: 0, y: 0 });
          } else {
            // Progressive centering
            setPosition({
              x: newX * (1 - 0.2 * centeringFactor),
              y: newY * (1 - 0.2 * centeringFactor),
            });
          }
        } else {
          // Update position
          setPosition({ x: newX, y: newY });
        }

        // Update scale
        setScale(newScale);

        // Update references for next move
        lastDistance.current = newDistance;
        lastMidpoint.current = newMidpoint;
      }
    } else if (e.touches.length === 1 && isDragging.current) {
      // Single touch - handle as drag
      handleMouseMove(e);
    }
  };

  // Handle touch end
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      // Reset touch tracking when fewer than 2 touches
      touchPoints.current = [];

      if (imageRef.current) {
        imageRef.current.style.transition = "transform 0.2s ease-out";
      }
    }

    // If no touches left, end dragging
    if (e.touches.length === 0) {
      handleMouseUp();
    }
  };

  // Effect to add global touch event listener to block browser zoom when disabled
  React.useEffect(() => {
    // Block browser zooming on mobile when zoom should be disabled
    const preventZoom = (e: TouchEvent) => {
      if (isZoomDisabled && e.touches.length > 1) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    if (isModalOpen && isZoomDisabled) {
      // Add passive: false to ensure preventDefault works
      document.addEventListener("touchstart", preventZoom, { passive: false });
      document.addEventListener("touchmove", preventZoom, { passive: false });
    }

    return () => {
      document.removeEventListener("touchstart", preventZoom);
      document.removeEventListener("touchmove", preventZoom);
    };
  }, [isModalOpen, isZoomDisabled]);

  // Handle global mouse events for better drag experience
  React.useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging.current) {
        // Always prevent default for touch events to avoid browser gestures
        if ("touches" in e && e.cancelable) {
          e.preventDefault();
        }
        handleMouseMove(e);
      } else if (
        "touches" in e &&
        e.touches.length > 1 &&
        isZoomDisabled &&
        e.cancelable
      ) {
        // Prevent pinch zoom when zoom is disabled
        e.preventDefault();
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging.current) {
        handleMouseUp();
      }
    };

    if (isModalOpen) {
      window.addEventListener("mousemove", handleGlobalMouseMove);
      window.addEventListener("mouseup", handleGlobalMouseUp);
      // Add touch events with passive: false to ensure preventDefault works
      window.addEventListener("touchmove", handleGlobalMouseMove, {
        passive: false,
      });
      window.addEventListener("touchend", handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchmove", handleGlobalMouseMove);
      window.removeEventListener("touchend", handleGlobalMouseUp);
    };
  }, [isModalOpen, handleMouseMove, handleMouseUp, isZoomDisabled]);

  // Consolidate all body overflow management into a single effect
  React.useEffect(() => {
    if (isModalOpen) {
      // Save the current overflow style before changing it
      originalBodyOverflowRef.current = window.getComputedStyle(
        document.body,
      ).overflow;

      // Apply hidden overflow to prevent background scrolling
      document.body.style.overflow = "hidden";
    } else if (originalBodyOverflowRef.current) {
      // Restore the original overflow style when modal closes
      document.body.style.overflow = originalBodyOverflowRef.current;
    }

    // Cleanup function to ensure overflow is always restored when component unmounts
    return () => {
      if (originalBodyOverflowRef.current) {
        document.body.style.overflow = originalBodyOverflowRef.current;
      }
    };
  }, [isModalOpen]);

  const handleModalBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking on the backdrop, not the image
    if (e.target === modalRef.current) {
      closeImageModal();
    }
  };

  return (
    <ImageModalContext.Provider value={{ openImageModal, closeImageModal }}>
      {children}
      {isModalOpen &&
        createPortal(
          <FocusTrap>
            <div
              ref={modalRef}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
              onClick={handleModalBackdropClick}
              role="dialog"
              aria-modal="true"
              aria-labelledby="image-modal-title"
              style={{
                // Prevent browser zooming on the modal when zoom is disabled
                touchAction: isZoomDisabled ? "pan-x pan-y" : "auto",
              }}
            >
              <div className="relative h-full w-full">
                {/* Close button */}
                <Button
                  size={"icon"}
                  variant="destructive"
                  onClick={closeImageModal}
                  className={cn(
                    "absolute top-4 right-4 z-10 rounded-sm p-0",
                    // "hover:bg-destructive hover:text-destructive-foreground"
                  )}
                  aria-label="Close modal"
                >
                  <X size={18} />
                </Button>

                {/* Scale indicator */}
                {isZoomedView && (
                  <div className="bg-background/80 absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm">
                    {Math.round(scale * 100)}
                    {"%"}
                  </div>
                )}

                {/* Image container */}
                <div
                  className={cn(
                    "h-full w-full",
                    isZoomedView
                      ? "cursor-grab touch-none overflow-hidden"
                      : "overflow-hidden",
                    isDragging.current && "cursor-grabbing",
                  )}
                  style={{
                    touchAction: isZoomDisabled
                      ? "pan-x pan-y"
                      : isZoomedView
                        ? "none"
                        : "auto",
                  }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onWheel={handleWheel}
                  onDoubleClick={handleDoubleClick}
                >
                  <div
                    ref={imageRef}
                    className={cn(
                      "relative transition-transform duration-300 ease-out",
                      isZoomedView
                        ? "h-[300vh] w-[300vh]" // Use much larger size to ensure plenty of dragging space
                        : "m-4 h-[calc(100%-32px)]", // Add 16px (m-4) margin on all sides when in restricted view
                    )}
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                      transformOrigin: "50% 50%", // Set origin to center instead of top-left
                      willChange: isZoomedView ? "transform" : "auto",
                      // Center the very large container in the viewport
                      left: isZoomedView ? "calc(-150vh + 50%)" : 0,
                      top: isZoomedView ? "calc(-150vh + 50%)" : 0,
                    }}
                  >
                    <Image
                      src={imageUrl}
                      alt="Image preview"
                      fill
                      sizes="100vw"
                      priority
                      className={cn(
                        isZoomedView ? "object-cover" : "object-contain",
                      )}
                      unoptimized={isZoomedView}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </div>
                </div>

                {/* Zooming Controls */}
                <div
                  className="bg-muted absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-md px-2 py-1 backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    title={t("ImageModal.fit-to-screen")}
                    aria-label={t("ImageModal.fit-to-screen")}
                    onClick={() => setIsZoomedView(false)}
                    className={cn(
                      "size-6 p-0",
                      !isZoomedView &&
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                  >
                    <MaximizeIcon size={16} />
                    <span className="sr-only">
                      {t("ImageModal.fit-to-screen")}
                    </span>
                  </Button>

                  <Switch
                    className="h-5 flex-shrink-0"
                    title={t("ImageModal.toggle-view-mode")}
                    checked={isZoomedView}
                    onCheckedChange={toggleZoomedView}
                    aria-label={t("ImageModal.toggle-view-mode")}
                  />
                  <span className="sr-only">
                    {t("ImageModal.toggle-view-mode")}
                  </span>

                  <Button
                    variant="ghost"
                    title={t("ImageModal.zoom-and-drag")}
                    aria-label={t("ImageModal.zoom-and-drag")}
                    onClick={() => setIsZoomedView(true)}
                    className={cn(
                      "size-6 p-0",
                      isZoomedView &&
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                    )}
                  >
                    <ExpandIcon size={16} />
                    <span className="sr-only">
                      {t("ImageModal.zoom-and-drag")}
                    </span>
                  </Button>
                </div>

                {/* Keyboard shortcuts help */}
                {!isMobile && (
                  <div className="bg-muted absolute top-4 left-4 z-10 rounded-lg p-3 text-xs backdrop-blur-sm">
                    <p className="text-accent-foreground mb-2 text-sm font-semibold">
                      {t("ImageModal.keyboard-shortcuts")}
                    </p>
                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 font-bold">
                      <span className="text-accent-foreground">{"ESC"}</span>
                      <span className="text-accent-foreground">
                        {t("ImageModal.close")}
                      </span>

                      <span className="text-accent-foreground">{"z"}</span>
                      <span className="text-accent-foreground">
                        {t("ImageModal.toggle-zoom-mode")}
                      </span>

                      <span className="text-muted-foreground">{"+/-"}</span>
                      <span className="text-muted-foreground">
                        {t("ImageModal.zoom-in-out")}
                      </span>

                      <span className="text-muted-foreground">{"0"}</span>
                      <span className="text-muted-foreground">
                        {t("ImageModal.reset-zoom")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FocusTrap>,
          document.body,
        )}
    </ImageModalContext.Provider>
  );
}
