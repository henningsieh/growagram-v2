import {
  EditIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import SpinningLoader from "~/components/Layouts/loader";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Link } from "~/lib/i18n/routing";

interface OwnerDropdownMenuProps {
  isSocial: boolean;
  setIsSocial: (value: boolean) => void;
  isDeleting: boolean;
  handleDelete: () => void;
  entityId: string;
  entityType: "Grows" | "Photos" | "Plants" | "Posts";
}

export function OwnerDropdownMenu({
  // isSocial,
  // setIsSocial,
  isDeleting,
  handleDelete,
  entityId,
  entityType,
}: OwnerDropdownMenuProps) {
  // const t = useTranslations(
  //   entityType === "grow"
  //     ? "Grows"
  //     : entityType === "photo"
  //       ? "Photos"
  //       : "Plants",
  // );
  const t = useTranslations();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreHorizontalIcon className="h-5 w-5" />
          <span
            className="sr-only"
            // eslint-disable-next-line react/jsx-no-literals
          >
            Owner menu
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="space-y-1">
        {/* <DropdownMenuItem
          className="flex cursor-pointer items-center justify-start"
          onSelect={(e) => e.preventDefault()}
          onClick={() => setIsSocial(!isSocial)}
        >
          <MessageCircleIcon className="mr-2 h-4 w-4" />
          <Label
            className="cursor-pointer text-sm font-semibold"
            htmlFor="show-socialMode"
          >
            Social
          </Label>
          <Switch
            className="ml-auto"
            id="show-socialMode"
            checked={isSocial}
            onCheckedChange={setIsSocial}
          />
        </DropdownMenuItem> */}
        <DropdownMenuItem asChild>
          <Link
            target="_blank"
            href={`/public/${entityType.toLowerCase()}/${entityId}`}
            className="flex cursor-pointer items-center"
          >
            <ExternalLinkIcon className="mr-2 h-4 w-4" />
            {t(`${entityType}.public-link-label`)}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`/${entityType.toLowerCase()}/${entityId}/form`}
            className="flex cursor-pointer items-center"
          >
            <EditIcon className="mr-2 h-4 w-4" />
            {t(`${entityType}.edit-button-label`)}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          asChild
          className="bg-destructive/50 text-foreground focus:bg-destructive focus-visible:ring-0"
        >
          <Button
            variant="destructive"
            size="sm"
            className="w-full justify-start"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <SpinningLoader className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Trash2Icon className="mr-2 h-4 w-4" />
            )}
            {t(`${entityType}.delete-button-label`)}
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
