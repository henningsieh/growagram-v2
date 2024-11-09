"use client";

import { Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipProvider } from "@radix-ui/react-tooltip";
import {
  Camera,
  Edit,
  Maximize,
  Minimize,
  PenIcon,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { formatDate, formatTime } from "~/lib/utils";
import { UserImage } from "~/server/api/root";

export default function Component({ image }: { image: UserImage }) {
  const locale = useLocale();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnrestrictedView, setIsUnrestrictedView] = useState(false);

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleModalClose();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isModalOpen, handleModalClose]);

  const toggleViewMode = () => {
    setIsUnrestrictedView(!isUnrestrictedView);
  };

  const handleSwitchContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div
          className="relative aspect-video cursor-pointer"
          onClick={handleImageClick}
        >
          <Image
            src={image.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
            priority
          />
        </div>
        <CardTitle className="p-3">{image.originalFilename}</CardTitle>
        <CardContent className="flex flex-col gap-2 py-2">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="flex items-center gap-2 text-sm text-accent-foreground">
                  <UploadCloud size={18} />
                  {formatDate(image.createdAt, locale)}
                  {locale !== "en" ? " um " : " at "}
                  {formatTime(image.createdAt, locale)}
                  {locale !== "en" && " Uhr"}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Upload Date </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="flex items-center gap-2 text-sm text-accent-foreground">
                  <Camera size={18} />
                  {formatDate(image.captureDate, locale)}
                  {locale !== "en" ? " um " : " at "}
                  {formatTime(image.captureDate, locale)}
                  {locale !== "en" && " Uhr"}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Capture Date (EXIF data)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
        <CardFooter className="gap-2 p-3">
          <Button
            variant={"destructive"}
            size={"sm"}
            className="w-full text-sm font-bold"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
          <Button size={"sm"} className="w-full text-sm font-bold">
            <Edit className="h-5 w-5" />
            Edit
          </Button>
        </CardFooter>
      </Card>

      {isModalOpen &&
        createPortal(
          <div
            // className={`fixed inset-0 z-50 ${
            //   isUnrestrictedView ? "overflow-auto" : "overflow-hidden"
            // } bg-black bg-opacity-75`}
            className={`fixed inset-0 z-50 ${isUnrestrictedView ? "overflow-auto" : "overflow-hidden"}`}
            onClick={handleModalClose}
          >
            <div
              className={`${isUnrestrictedView ? "min-h-screen min-w-full" : "h-screen w-screen"} p-0`}
            >
              <Button
                variant={"secondary"}
                onClick={handleModalClose}
                className="fixed right-4 top-2 z-10 h-6 p-1"
                aria-label="Close modal"
              >
                <X size={18} />
              </Button>

              <div
                className="fixed left-1/2 top-2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-sm bg-secondary bg-opacity-50 p-1 text-white"
                onClick={handleSwitchContainerClick}
              >
                <div
                  title="contain"
                  onClick={() => setIsUnrestrictedView(false)}
                >
                  <Minimize size={18} />
                </div>
                <Switch
                  title="Toggle contain/zoom"
                  checked={isUnrestrictedView}
                  onCheckedChange={toggleViewMode}
                  aria-label="Toggle view mode"
                />
                <div title="zoom" onClick={() => setIsUnrestrictedView(true)}>
                  <Maximize size={18} />
                </div>
              </div>
              <div className="relative -z-30 flex h-full items-center justify-center bg-zinc-900/95">
                <Image
                  src={image.imageUrl}
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
    </>
  );
}
