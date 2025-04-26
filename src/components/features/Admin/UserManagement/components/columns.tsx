import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, Ban, Clock } from "lucide-react";
import { CustomAvatar } from "~/components/atom/custom-avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import type { AdminUserListItem } from "~/server/api/root";
import { UserRoles } from "~/types/user";
import { ActionsCell } from "./actions-cell";

export const columns: ColumnDef<AdminUserListItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Name"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <CustomAvatar
          size={32}
          src={row.original.image ?? undefined}
          alt={row.original.name ?? "User"}
          fallback={row.original.name?.[0] || "?"}
        />
        <div
          className="max-w-38 truncate font-medium"
          title={row.original.name || ""}
        >
          {row.original.name}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "username",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Username"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>
        {"@"}
        {row.original.username}
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Email"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="max-w-48 truncate" title={row.original.email || ""}>
        {row.original.email}
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Role"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const role = row.original.role;
      const variant =
        (role as UserRoles) === UserRoles.ADMIN
          ? "destructive"
          : (role as UserRoles) === UserRoles.MOD
            ? "secondary"
            : "outline";

      return <Badge variant={variant}>{role}</Badge>;
    },
    filterFn: (row, id, value: unknown) => {
      const rowValue = row.getValue(id);
      return (
        Array.isArray(value) &&
        typeof rowValue === "string" &&
        value.includes(rowValue)
      );
    },
  },
  {
    accessorKey: "emailVerified",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Verified"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isVerified = row.original.emailVerified !== null;
      return (
        <Badge variant={isVerified ? "default" : "destructive"}>
          {isVerified ? "Verified" : "Not Verified"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Joined Date"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return <div>{format(date, "dd/MM/yyyy")}</div>;
    },
  },
  {
    accessorKey: "bannedUntil",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {"Ban Status"}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const bannedUntil = row.original.bannedUntil
        ? new Date(row.original.bannedUntil)
        : null;
      const now = new Date();
      const isBanned = bannedUntil && bannedUntil > now;
      const isPermanentBan =
        row.original.bannedUntil === null && row.original.banReason;

      if (isPermanentBan) {
        return (
          <div className="text-destructive flex items-center gap-1">
            <Ban className="h-4 w-4" />
            <Badge variant="destructive" className="text-xs">
              Banned permanently
            </Badge>
          </div>
        );
      } else if (isBanned) {
        return (
          <div className="text-destructive flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <Badge variant="destructive" className="text-xs">
              Banned until {format(bannedUntil, "dd/MM/yyyy")}
            </Badge>
          </div>
        );
      }

      return (
        <Badge variant="outline" className="text-xs">
          Active
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell user={row.original} />,
  },
];
