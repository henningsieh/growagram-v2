"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { FocusTrap } from "focus-trap-react";
import { ExpandIcon, MaximizeIcon, X } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
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

export function ImageModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState("");
  const [isZoomedView, setIsZoomedView] = React.useState(false);

  const modalRef = React.useRef<HTMLDivElement>(null);
  const imageRef = React.useRef<HTMLDivElement>(null);

  const [scale, setScale] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const isDragging = React.useRef(false);
  const dragStart = React.useRef({ x: 0, y: 0 });

  const t = useTranslations("Photos");

  const openImageModal = React.useCallback((url: string) => {
    setImageUrl(url);
    setIsModalOpen(true);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomedView(false);
    document.body.style.overflow = "hidden";
  }, []);

  const closeImageModal = React.useCallback(() => {
    setIsModalOpen(false);
    document.body.style.overflow = "";
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
    (e: React.MouseEvent | MouseEvent | TouchEvent) => {
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
    if (!isZoomedView) return;
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

  // Handle global mouse events for better drag experience
  React.useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging.current) {
        // Always prevent default for touch events to avoid browser gestures
        if ("touches" in e && e.cancelable) {
          e.preventDefault();
        }
        handleMouseMove(e);
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
  }, [isModalOpen, handleMouseMove, handleMouseUp]);

  // Ensure we reset overflow when component unmounts
  React.useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Prevent body scrolling when modal is open
  React.useEffect(() => {
    if (isModalOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
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
                    {Math.round(scale * 100)}%
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
                    touchAction: isZoomedView ? "none" : "auto",
                  }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleMouseDown}
                  onWheel={handleWheel}
                  onDoubleClick={handleDoubleClick}
                >
                  <div
                    ref={imageRef}
                    className={cn(
                      "relative transition-transform duration-300 ease-out",
                      isZoomedView
                        ? "h-[300vh] w-[300vh]" // Use much larger size to ensure plenty of dragging space
                        : "m-14 h-[calc(100%-112px)]", // Add 24px (m-6) margin on all sides when in restricted view
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
                      src={imageUrl || "/placeholder.svg"}
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
                {true && (
                  <div className="bg-muted absolute top-4 left-4 z-10 hidden rounded-lg p-3 text-xs backdrop-blur-sm md:block">
                    <p className="text-accent-foreground mb-2 text-sm font-semibold">
                      {t("ImageModal.keyboard-shortcuts")}
                    </p>
                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                      <span className="text-accent-foreground font-medium">
                        {"ESC"}
                      </span>
                      <span className="text-accent-foreground">
                        {t("ImageModal.close")}
                      </span>

                      <span className="text-muted-foreground font-medium">
                        {"z"}
                      </span>
                      <span className="text-muted-foreground">
                        {t("ImageModal.toggle-zoom-mode")}
                      </span>

                      <span className="text-muted-foreground font-medium">
                        {"+/-"}
                      </span>
                      <span className="text-muted-foreground">
                        {t("ImageModal.zoom-in-out")}
                      </span>

                      <span className="text-muted-foreground font-medium">
                        {"0"}
                      </span>
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
