// components/SearchModal.tsx
import { Search, X, Calendar, DollarSign, Tag, Loader2 } from "lucide-react";
import { SearchResult, SearchFilter, SearchType } from "./LandingNavbar";
import { useEffect, useRef } from "react";

interface SearchModalProps {
  query: string;
  setSearchQuery: (query: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  filter: SearchFilter;
  onFilterChange: (filter: SearchFilter) => void;
  onResultClick: (result: SearchResult) => void;
  onClose: () => void;
  onQuickSearch: (type: SearchType, value: string) => void;
}

export const SearchModal = ({
  query,
  setSearchQuery,
  results,
  isLoading,
  filter,
  onFilterChange,
  onResultClick,
  onClose,
  onQuickSearch,
}: SearchModalProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const quickSearches = [
    {
      type: "price" as SearchType,
      label: "Under $10",
      value: "price:<10",
      icon: DollarSign,
    },
    {
      type: "date" as SearchType,
      label: "Renewing Soon",
      value: "renewing:soon",
      icon: Calendar,
    },
    {
      type: "subscription" as SearchType,
      label: "Active Subs",
      value: "status:active",
      icon: Tag,
    },
  ];

  // Focus input when modal opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent click inside modal from closing it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-background border border-border rounded-lg shadow-lg max-h-[80vh] overflow-hidden"
        onClick={handleModalClick}
      >
        {/* Search Input in Modal */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search subscriptions, services, prices..."
              className="w-full pl-10 pr-20 py-3 text-base bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              autoFocus
            />
            {query && (
              <button
                onClick={handleClearSearch}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 hover:bg-accent rounded p-1 transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-accent rounded p-1 transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Quick Searches */}
        {!query && (
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-medium mb-3 text-foreground">
              Quick Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {quickSearches.map((quickSearch) => (
                <button
                  key={quickSearch.label}
                  onClick={() =>
                    onQuickSearch(quickSearch.type, quickSearch.value)
                  }
                  className="flex items-center space-x-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <quickSearch.icon className="h-4 w-4" />
                  <span>{quickSearch.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-foreground">
              Filter by:
            </span>
            <select
              value={filter.type}
              onChange={(e) =>
                onFilterChange({
                  ...filter,
                  type: e.target.value as SearchType,
                })
              }
              className="text-sm border border-border rounded px-3 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All</option>
              <option value="subscription">Subscriptions</option>
              <option value="service">Services</option>
              <option value="price">Price</option>
              <option value="date">Date</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-border">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => onResultClick(result)}
                  className="w-full p-4 text-left hover:bg-accent transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground group-hover:text-accent-foreground">
                        {result.name}
                      </h3>
                      {result.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2 group-hover:text-accent-foreground/80">
                          {result.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-3 mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            result.type === "subscription"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }`}
                        >
                          {result.type}
                        </span>
                        {result.price && (
                          <span className="text-xs text-muted-foreground group-hover:text-accent-foreground/80">
                            ${result.price}/mo
                          </span>
                        )}
                        {result.nextBillingDate && (
                          <span className="text-xs text-muted-foreground group-hover:text-accent-foreground/80">
                            Renews:{" "}
                            {new Date(
                              result.nextBillingDate
                            ).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {Math.round(result.relevance * 100)}% match
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query && !isLoading ? (
            <div className="p-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                No results found for &quot;{query}&quot;
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Try different keywords or filters
              </p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                Start typing to search your subscriptions and services
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
