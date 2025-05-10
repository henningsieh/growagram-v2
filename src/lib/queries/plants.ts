import { PaginationItemsPerPage } from "~/assets/constants";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { GetAllPlantsInput, GetOwnPlantsInput } from "~/server/api/root";
import { PlantsSortField } from "~/types/plant";

// Default sort field for plants
export const DEFAULT_PLANT_SORT_FIELD = PlantsSortField.NAME;

// Define the query options for fetching all public Plants
export const getAllPlantsInput: GetAllPlantsInput = {
  limit: PaginationItemsPerPage.PUBLIC_PLANTS_PER_PAGE,
  sortField: PlantsSortField.CREATED_AT,
  sortOrder: SortOrder.DESC,
};

// Define the query options for fetching own plants
export const getOwnPlantsInput: GetOwnPlantsInput = {
  cursor: 1,
  limit: PaginationItemsPerPage.PLANTS_PER_PAGE,
  sortField: DEFAULT_PLANT_SORT_FIELD,
  sortOrder: SortOrder.ASC,
};
