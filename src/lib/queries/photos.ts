import { PaginationItemsPerPage } from "~/assets/constants";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { GetOwnPhotosInput } from "~/server/api/root";
import { PhotosSortField } from "~/types/image";

// Add a single source of truth for the photo default sort field
export const DEFAULT_PHOTO_SORT_FIELD = PhotosSortField.CAPTURE_DATE;

// Define the query options for fetching own photos
export const getOwnPhotosInput: GetOwnPhotosInput = {
  cursor: 1,
  limit: PaginationItemsPerPage.PHOTOS_PER_PAGE,
  sortField: DEFAULT_PHOTO_SORT_FIELD, // use the constant here
  sortOrder: SortOrder.DESC,
  filterNotConnected: false,
};
