"use client";

import { Maximize, Minimize, X } from "lucide-react";
import Image from "next/image";
import { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";

interface ImageModalContextType {
  openImageModal: (imageUrl: string) => void;
  closeImageModal: () => void;
}

const ImageModalContext = createContext<ImageModalContextType | undefined>(
  undefined,
);

export function ImageModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUnrestrictedView, setIsUnrestrictedView] = useState(false);

  const openImageModal = (url: string) => {
    setImageUrl(url);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "";
  };

  const handleSwitchContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <ImageModalContext.Provider value={{ openImageModal, closeImageModal }}>
      {children}
      {isModalOpen &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 ${
              isUnrestrictedView ? "overflow-auto" : "overflow-hidden"
            }`}
            onClick={closeImageModal}
          >
            <div
              className={`${
                isUnrestrictedView
                  ? "min-h-screen min-w-full"
                  : "h-screen w-screen"
              } p-0`}
            >
              <Button
                variant="secondary"
                onClick={closeImageModal}
                className="fixed right-4 top-2 z-10 h-6 p-1"
                aria-label="Close modal"
              >
                <X size={20} />
              </Button>

              <div
                className="fixed left-1/2 top-2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-sm bg-secondary bg-opacity-50 p-1 text-white"
                onClick={handleSwitchContainerClick}
              >
                <div
                  title="contain"
                  onClick={() => setIsUnrestrictedView(false)}
                >
                  <Minimize size={20} />
                </div>
                <Switch
                  title="Toggle contain/zoom"
                  checked={isUnrestrictedView}
                  onCheckedChange={() =>
                    setIsUnrestrictedView(!isUnrestrictedView)
                  }
                  aria-label="Toggle view mode"
                />
                <div title="zoom" onClick={() => setIsUnrestrictedView(true)}>
                  <Maximize size={20} />
                </div>
              </div>
              <div className="relative -z-30 flex h-full items-center justify-center bg-zinc-900/95">
                <Image
                  src={imageUrl}
                  alt=""
                  width={1920}
                  height={1080}
                  className={`${
                    isUnrestrictedView
                      ? "max-w-none"
                      : "max-h-[90vh] max-w-[90vw] object-contain"
                  }`}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </ImageModalContext.Provider>
  );
}

export const useImageModal = () => {
  const context = useContext(ImageModalContext);
  if (!context) {
    throw new Error("useImageModal must be used within an ImageModalProvider");
  }
  return context;
};
