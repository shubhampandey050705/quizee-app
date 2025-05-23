"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

// Pagination component receives total items, items per page limit, and optional className
const Pagination = ({ className, total, limit }) => {
  const searchParams = useSearchParams(); // Get current search parameters from URL
  const page = searchParams.get("page") || "1"; // Default to page 1 if no param is present
  const totalPages = Math.ceil(total / limit); // Calculate total number of pages
  const router = useRouter(); // Used for navigation
  const pathname = usePathname(); // Current URL path

  // Navigate to previous page
  const prev = () => {
    if (page <= "1") return;
    const pageNumber = parseInt(page);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", `${pageNumber - 1}`);
    router.push(`${pathname}?${newSearchParams}`);
  };

  // Navigate to next page
  const next = () => {
    if (page >= `${totalPages}`) return;
    const pageNumber = parseInt(page);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("page", `${pageNumber + 1}`);
    router.push(`${pathname}?${newSearchParams}`);
  };

  return (
    <div className="flex items-center justify-center gap-4">
      {/* Previous Button */}
      <button
        className={`${className} rounded-lg bg-white/10 px-2 py-0.5 duration-200 hover:bg-white/20`}
        onClick={prev}
        disabled={page <= "1"}
      >
        Previous
      </button>

      {/* Page Display */}
      <span>
        {page} of {totalPages || "1"} {/* fallback if totalPages is 0 */}
      </span>

      {/* Next Button */}
      <button
        className={`${className} rounded-lg bg-white/10 px-2 py-0.5 duration-200 hover:bg-white/20`}
        onClick={next}
        disabled={page >= `${totalPages}`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
