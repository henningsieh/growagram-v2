import { User2 } from "lucide-react";
import Image from "next/image";
import type { HTMLAttributes } from "react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { cn } from "~/lib/utils";

interface CustomAvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt: string;
  fallback: string;
  size?: number;
}

export default function CustomAvatar({
  src,
  alt,
  size = 40,
  className,
  ...props
}: CustomAvatarProps) {
  return (
    <Avatar className={cn("relative h-auto w-auto", className)} {...props}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="rounded-full object-cover"
        />
      ) : (
        <AvatarFallback>
          <User2 className="h-5 w-5" />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
