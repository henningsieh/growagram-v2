// src/components/atom/custom-avatar.tsx:
import * as React from "react";
import Image from "next/image";
import { User2 } from "lucide-react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";

interface CustomAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt: string;
  fallback?: React.ReactNode;
  size?: number;
}

export function CustomAvatar({
  src,
  alt,
  fallback,
  size = 40,
  className,
  ...props
}: CustomAvatarProps) {
  return (
    <Avatar
      className={cn("relative h-max w-max rounded-full", className)}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="object-cover"
        />
      ) : (
        <AvatarFallback>
          {fallback || <User2 className="h-5 w-5" />}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
