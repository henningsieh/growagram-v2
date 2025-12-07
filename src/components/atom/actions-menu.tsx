import * as React from "react";

import type { VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";

import { Button, buttonVariants } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export interface ActionItem {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  disabled?: boolean;
}

interface ActionsMenuProps {
  actions: ActionItem[];
}

export function ActionsMenu({ actions }: ActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="text-muted-foreground hover:text-foreground"
      >
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          aria-label="More actions"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-6" align="end">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isDestructive = action.variant === "destructive";

          return (
            <DropdownMenuItem
              key={`${action.label}-${index}`}
              variant={isDestructive ? "destructive" : "default"}
              disabled={action.disabled}
              onClick={action.onClick}
              className={
                isDestructive
                  ? "[&_svg]:!text-destructive"
                  : "focus:[&_svg]:!text-accent-foreground [&_svg]:!text-current"
              }
            >
              <Icon className="mr-2 h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
