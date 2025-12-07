import { useTranslations } from "next-intl";

import { ColumnDef } from "@tanstack/react-table";

import { ArrowUpDown, Ban, Clock } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";

import { CustomAvatar } from "~/components/atom/custom-avatar";

import type { AdminUserListItem } from "~/server/api/root";

import type { Locale } from "~/types/locale";
import { UserRoles } from "~/types/user";

import {
  formatAbsoluteDate,
  formatDateTime,
  getBanExpirationDate,
  isPermanentBan,
} from "~/lib/utils";

import { ActionsCell } from "./actions-cell";

export function createColumns(
  t: ReturnType<typeof useTranslations>,
  locale: Locale,
): ColumnDef<AdminUserListItem>[] {
  return [
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
            {t(`user-management.columns.${column.id}`)}
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
            {t(`user-management.columns.${column.id}`)}
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
            {t(`user-management.columns.${column.id}`)}
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
            {t(`user-management.columns.${column.id}`)}
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
            {t(`user-management.columns.${column.id}`)}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const isVerified = row.original.emailVerified !== null;
        return (
          <Badge variant={isVerified ? "default" : "destructive"}>
            {isVerified
              ? t(`user-management.columns.emailVerified`)
              : t("user-management.columns.emailNotVerified")}
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
            {t(`user-management.columns.${column.id}`)}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return <div>{formatDateTime(date, locale)}</div>;
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
        const user = row.original;

        // Check permanent ban first
        if (isPermanentBan(user)) {
          return (
            <div className="text-destructive flex items-center gap-1">
              <Ban className="h-4 w-4" />
              <Badge variant="destructive" className="text-xs">
                {t("user-management.columns.status.permanently-banned")}
              </Badge>
            </div>
          );
        }

        // Check temporary ban
        const banExpirationDate = getBanExpirationDate(user);
        if (banExpirationDate) {
          return (
            <div className="text-destructive flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <Badge variant="destructive" className="text-xs">
                {t("user-management.columns.status.banned-until")}{" "}
                {formatAbsoluteDate(banExpirationDate, locale)}
              </Badge>
            </div>
          );
        }

        // User is not banned
        return (
          <Badge variant="outline" className="text-xs">
            {t("user-management.columns.status.active")}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <ActionsCell user={row.original} />,
    },
  ];
}
