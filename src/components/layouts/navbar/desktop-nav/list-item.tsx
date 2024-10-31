import { NavigationMenuLink } from "@radix-ui/react-navigation-menu";
import { forwardRef } from "react";
import { Link } from "~/lib/i18n/routing";
import { cn } from "~/lib/utils";

export const ListItem = forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none text-accent-foreground no-underline outline-none transition-colors hover:bg-accent hover:text-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          href={props.href as string}
          {...props}
        >
          <div className="text-sm font-bold leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug">{children}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
