import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  isFetching: boolean;
  handlePageChange: (page: number) => void;
}

export default function ItemsPagination({
  currentPage,
  totalPages,
  isFetching,
  handlePageChange,
}: PaginationProps) {
  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const pages: number[] = [];
    const showAroundCurrent = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - showAroundCurrent &&
          i <= currentPage + showAroundCurrent)
      ) {
        pages.push(i);
      }
    }

    return pages.reduce((acc: (number | string)[], page, index, array) => {
      if (index > 0 && array[index - 1] !== page - 1) {
        acc.push("...");
      }
      acc.push(page);
      return acc;
    }, []);
  };

  const handlePageClick = (page: number) => {
    if (!isFetching) {
      handlePageChange(page);
    }
  };

  return (
    <div className="my-4 flex justify-center">
      <Pagination>
        <PaginationContent
          className={isFetching ? "pointer-events-none opacity-60" : ""}
        >
          <PaginationItem hidden={currentPage === 1}>
            <PaginationPrevious
              className="cursor-pointer p-0"
              onClick={() => handlePageClick(currentPage - 1)}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </PaginationPrevious>
          </PaginationItem>

          {getPaginationNumbers().map((page, index) =>
            page === "..." ? (
              <PaginationItem
                key={`ellipsis-${index}`}
                className="cursor-default"
              >
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page} className="cursor-pointer">
                <PaginationLink
                  onClick={() => handlePageClick(page as number)}
                  isActive={currentPage === page}
                >
                  <p>{page}</p>
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem hidden={currentPage === totalPages}>
            <PaginationNext
              className="cursor-pointer p-0"
              onClick={() => handlePageClick(currentPage + 1)}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
