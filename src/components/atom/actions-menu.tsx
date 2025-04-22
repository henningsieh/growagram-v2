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
        <Button variant="ghost" size="icon" aria-label="More actions">
          <MoreHorizontal className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-6" align="end">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              className="px-0 py-0.5 focus:bg-transparent"
              key={`${action.label}-${index}`}
            >
              <Button
                size={"sm"}
                className="flex w-full items-center justify-start"
                variant={action.variant}
                disabled={action.disabled}
                onClick={action.onClick}
              >
                <Icon className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
