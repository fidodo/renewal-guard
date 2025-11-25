import React, { useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { useAppSelector } from "@/app/hooks/redux";
import { Subscription } from "./SubscriptionForm";
import SubscriptionCard from "./SubscriptionCard";

interface ConditionalPaginatedSubscriptionsProps {
  title: string;
  subscriptions: Subscription[];
  onDelete: (id: string) => void;
  maxVisible?: number;
}

export const ConditionalPaginatedSubscriptions: React.FC<
  ConditionalPaginatedSubscriptionsProps
> = ({ title, subscriptions, onDelete, maxVisible = 2 }) => {
  const isLoading = useAppSelector((state) => state.subscription.loading);
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const totalPages = Math.ceil(subscriptions.length / itemsPerPage);
  const shouldShowPagination = subscriptions.length > maxVisible;

  const getItemsToShow = () => {
    if (showAll) {
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      return subscriptions.slice(indexOfFirstItem, indexOfLastItem);
    } else {
      return subscriptions.slice(0, maxVisible);
    }
  };

  const currentItems = getItemsToShow();

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleToggleShowAll = () => {
    setShowAll(!showAll);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (subscriptions.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="animate-pulse">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {title} ({subscriptions.length})
        </h3>

        {shouldShowPagination && (
          <div className="flex items-center space-x-2">
            {showAll ? (
              <>
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || isLoading}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="text-sm text-gray-600">
                  {currentPage}/{totalPages}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || isLoading}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={handleToggleShowAll}
                  disabled={isLoading}
                  className="text-sm text-blue-600 hover:text-blue-800 ml-2 disabled:opacity-50"
                >
                  Show Less
                </button>
              </>
            ) : (
              <button
                onClick={handleToggleShowAll}
                disabled={isLoading}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <span aria-label="display hidden subscriptions">View All</span>
                <MoreHorizontal className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {currentItems.map((subscription) => (
          <SubscriptionCard
            key={subscription.id}
            subscription={subscription}
            onCancel={() => {}}
            onDelete={onDelete}
          />
        ))}
      </div>

      {showAll && totalPages > 1 && (
        <div className="flex justify-center space-x-1 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              disabled={isLoading}
              className={`px-2 py-1 text-xs rounded ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
