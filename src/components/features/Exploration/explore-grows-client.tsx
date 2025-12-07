"use client";

import * as React from "react";

import { useTranslations } from "next-intl";

import { useDebounce } from "@uidotdev/usehooks";
import { FilterIcon, SearchIcon, X } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import { ErrorBoundary } from "react-error-boundary";

import { Button } from "~/components/ui/button";

import { GenericError } from "~/components/atom/generic-error";
import { Kbd } from "~/components/atom/kbd";
import { SortOrder } from "~/components/atom/sort-filter-controls";
import { ActiveFiltersBadges } from "~/components/features/Exploration/active-filters-badges";
import { ExploreFiltersDialog } from "~/components/features/Exploration/explore-filters-dialog";
import { ExploreGrowsGrid } from "~/components/features/Exploration/explore-grows-grid";
import { ExploreGrowsLoading } from "~/components/features/Exploration/explore-grows-loading";

import type { ExploreGrowsInput } from "~/server/api/root";

import {
  CultureMedium,
  FertilizerForm,
  FertilizerType,
  GrowEnvironment,
  GrowsSortField,
} from "~/types/grow";

import { getKeyboardShortcut } from "~/lib/utils/platform";

import { useKeyboardShortcut } from "~/hooks/use-keyboard-shortcut";

import { PaginationItemsPerPage } from "~/assets/constants";

export function ExploreGrowsClient() {
  const t = useTranslations("Exploration");

  // Get filter and sort state from URL query parameters with setters
  const [filters, setFilters] = useQueryStates({
    search: parseAsString.withDefault(""),
    username: parseAsString.withDefault(""),
    environment: parseAsString,
    cultureMedium: parseAsString,
    fertilizerType: parseAsString,
    fertilizerForm: parseAsString,
    sortField: parseAsString.withDefault(GrowsSortField.UPDATED_AT),
    sortOrder: parseAsString.withDefault(SortOrder.DESC),
  });

  const [dialogOpen, setDialogOpen] = React.useState(false);

  /**
   * Global keyboard shortcuts for search dialog
   * - Cmd/Ctrl + K: Open search dialog
   */
  useKeyboardShortcut(
    "k",
    () => {
      setDialogOpen(true);
    },
    {
      ctrlKey: true,
      metaKey: true, // This will match either Ctrl OR Cmd
      preventDefault: true,
    },
  );

  /**
   * Calculate the display search term from the current URL parameters
   * Combines regular search term and username (with @ prefix) into a single string
   * that's shown in the search input field
   *
   * This ensures that when loading the page with URL parameters like:
   * /explore?search=ch&username=henningsieh
   * The search field will display "ch @henningsieh"
   */
  const initialDisplaySearchTerm = React.useMemo(() => {
    return [
      filters.search || "",
      filters.username ? `@${filters.username}` : "",
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  }, [filters.search, filters.username]);

  // Local search term state with debouncing to reduce URL updates and API calls
  const [searchTerm, setSearchTerm] = React.useState(initialDisplaySearchTerm);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  /**
   * Extracts @username from search term and returns both parts separately
   * Example: "plant @henningsieh" → { cleanSearchTerm: "plant", username: "henningsieh" }
   * This enables displaying separate filter badges for the search term and username
   * and allows filtering both on the server side
   */
  const extractUsernameFromSearchTerm = (
    term: string,
  ): {
    cleanSearchTerm: string;
    username: string;
  } => {
    if (!term) return { cleanSearchTerm: "", username: "" };

    // Split the search term into words
    const words = term.split(/\s+/);
    let username = "";
    const remainingWords: string[] = [];

    // Look for a word starting with @ and extract the username
    words.forEach((word) => {
      if (word.startsWith("@") && word.length > 1) {
        // Extract username without @ symbol
        username = word.substring(1);
      } else {
        // Keep other words for the clean search term
        remainingWords.push(word);
      }
    });

    // Join the remaining words back into a clean search term
    const cleanSearchTerm = remainingWords.join(" ").trim();

    return { cleanSearchTerm, username };
  };

  /**
   * Process search term changes to extract usernames
   *
   * Only updates URL parameters when the user has actually changed the search term.
   * This prevents unnecessary URL updates during the initial render which would
   * interfere with the server's prefetching.
   *
   * For example, typing "plants @username" will set:
   * - search parameter to "plants"
   * - username parameter to "username"
   */
  React.useEffect(() => {
    // Only process if the search term has changed from initial state
    if (debouncedSearchTerm !== initialDisplaySearchTerm) {
      // Extract username and clean search term
      const { cleanSearchTerm, username } =
        extractUsernameFromSearchTerm(debouncedSearchTerm);

      // Update filters with separated values
      void setFilters({
        search: cleanSearchTerm,
        username: username,
      });
    }
  }, [debouncedSearchTerm, initialDisplaySearchTerm, setFilters]);

  // Filter change handlers
  const handleFilterChange = {
    environment: (value: string) => {
      void setFilters({ environment: value === "clear" ? null : value });
    },
    cultureMedium: (value: string) => {
      void setFilters({ cultureMedium: value === "clear" ? null : value });
    },
    fertilizerType: (value: string) => {
      void setFilters({ fertilizerType: value === "clear" ? null : value });
    },
    fertilizerForm: (value: string) => {
      void setFilters({ fertilizerForm: value === "clear" ? null : value });
    },
    sortField: (value: string) => {
      void setFilters({ sortField: value });
    },
    sortOrder: (value: string) => {
      void setFilters({ sortOrder: value });
    },
  };

  // Clear all filters
  const handleClearFilters = () => {
    void setFilters({
      search: "",
      username: "",
      environment: null,
      cultureMedium: null,
      fertilizerType: null,
      fertilizerForm: null,
      sortField: GrowsSortField.UPDATED_AT,
      sortOrder: SortOrder.DESC,
    });
    setSearchTerm(""); // Clear the search input
    setDialogOpen(false);
  };

  // Individual filter clear handlers
  const handleClearIndividualFilters = {
    search: () => {
      void setFilters({ search: "" });
      // Update search term, but preserve username if it exists
      setSearchTerm(filters.username ? `@${filters.username}` : "");
    },
    username: () => {
      void setFilters({ username: "" });
      // Update search term, but preserve search text if it exists
      setSearchTerm(filters.search || "");
    },
    environment: () => {
      void setFilters({ environment: null });
    },
    cultureMedium: () => {
      void setFilters({ cultureMedium: null });
    },
    fertilizerType: () => {
      void setFilters({ fertilizerType: null });
    },
    fertilizerForm: () => {
      void setFilters({ fertilizerForm: null });
    },
  };

  // Transform URL filters to API format - exactly matching server-side logic
  const exploreFilters: ExploreGrowsInput = {
    search: filters.search || undefined,
    username: filters.username || undefined,
    environment: filters.environment
      ? (filters.environment as GrowEnvironment)
      : undefined,
    cultureMedium: filters.cultureMedium
      ? (filters.cultureMedium as CultureMedium)
      : undefined,
    fertilizerType: filters.fertilizerType
      ? (filters.fertilizerType as FertilizerType)
      : undefined,
    fertilizerForm: filters.fertilizerForm
      ? (filters.fertilizerForm as FertilizerForm)
      : undefined,
    sortField: filters.sortField as GrowsSortField,
    sortOrder: filters.sortOrder as SortOrder,
    limit: PaginationItemsPerPage.PUBLIC_GROWS_PER_PAGE,
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.search ||
    filters.username ||
    filters.environment ||
    filters.cultureMedium ||
    filters.fertilizerType ||
    filters.fertilizerForm;

  // Create the trigger button for the filter dialog
  const filterTrigger = (
    <Button
      variant="outline"
      className="hover:bg-muted flex w-full cursor-text items-center justify-start gap-2"
    >
      <SearchIcon className="text-muted-foreground size-5 flex-shrink-0" />
      <span className="text-muted-foreground min-w-0 flex-1 truncate text-left text-base">
        {searchTerm || t("search.placeholder")}
      </span>
      <div className="ml-auto flex flex-shrink-0 items-center gap-2">
        {hasActiveFilters && (
          <div className="flex items-center gap-1">
            <FilterIcon strokeWidth={3} className="text-primary size-4" />
            <span className="text-primary font-mono text-xl font-semibold">
              {
                [
                  filters.search,
                  filters.username,
                  filters.environment,
                  filters.cultureMedium,
                  filters.fertilizerType,
                  filters.fertilizerForm,
                ].filter(Boolean).length
              }
            </span>
          </div>
        )}
        <Kbd>{getKeyboardShortcut("K")}</Kbd>
      </div>
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* Search and Filter Trigger */}
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <ExploreFiltersDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            trigger={filterTrigger}
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => void handleClearFilters()}
            title={t("filters.clear-all")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Filters Badges */}
      <ActiveFiltersBadges
        filters={filters}
        onClearFilters={handleClearIndividualFilters}
      />

      {/* Content */}
      <ErrorBoundary FallbackComponent={GenericError}>
        <React.Suspense fallback={<ExploreGrowsLoading />}>
          <ExploreGrowsGrid
            key={`${filters.sortField}-${filters.sortOrder}-${filters.search}-${filters.username}-${filters.environment}-${filters.cultureMedium}-${filters.fertilizerType}-${filters.fertilizerForm}`}
            filters={exploreFilters}
          />
        </React.Suspense>
      </ErrorBoundary>
    </div>
  );
}
