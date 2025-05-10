import { PaginationItemsPerPage } from "~/assets/constants";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import type { GetAllGrowsInput, GetOwnGrowsInput } from "~/server/api/root";
import { GrowsSortField } from "~/types/grow";

// Default sort field for grows
export const DEFAULT_GROW_SORT_FIELD = GrowsSortField.NAME;

// Define the query options for fetching all public grows
export const getAllGrowsInput: GetAllGrowsInput = {
  limit: PaginationItemsPerPage.PUBLIC_GROWS_PER_PAGE,
  sortField: GrowsSortField.CREATED_AT,
  sortOrder: SortOrder.DESC,
};

// Define the query options for fetching own grows
export const getOwnGrowsInput: GetOwnGrowsInput = {
  cursor: 1,
  limit: PaginationItemsPerPage.GROWS_PER_PAGE,
  sortField: DEFAULT_GROW_SORT_FIELD,
  sortOrder: SortOrder.ASC,
};
