"use client";
import { useState, useCallback, useEffect, useRef, useTransition } from "react";
import { Bell, Menu, Search, User, ShieldBan, X, Filter } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { clearUser } from "../store/slices/userSlice";
import { RootState } from "../store/store";
import ThemeToggle from "./ThemeToggle";
import { SearchModal } from "./SearchModal";
import { useDebounce } from "../hooks/useDebounce";

// Search types
export type SearchType = "all" | "subscription" | "service" | "price" | "date";
export type SearchFilter = {
  type: SearchType;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  category?: string;
};

export type SearchResult = {
  id: string;
  type: "subscription" | "service";
  name: string;
  description?: string;
  price?: {
    amount: number;
    currency: string;
    billingCycle: string;
  };
  billingDate?: {
    startDate: string;
    nextBillingDate: string;
    endDate?: string;
  };
  category: string;
  relevance: number;
};

export const LandingNavbar = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilter, setSearchFilter] = useState<SearchFilter>({
    type: "all",
  });

  const [, startTransition] = useTransition();

  const dispatch = useDispatch();
  const router = useRouter();
  const reduxUser = useSelector((state: RootState) => state.user.user);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Search handler
  const handleSearch = useCallback(
    async (query: string, filter: SearchFilter) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const token = localStorage.getItem("token");
        const body = {
          query,
          type: filter.type,
          filters: filter,
        };
        console.log("🔍 Search request:", body);
        const response = await fetch(
          "http://localhost:5000/api/v1/search/global",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
          }
        );
        const data = await response.json();
        if (response.ok && data.success) {
          console.log("🔍 Search API response:", data);
          setSearchResults(data.data || []);
        } else {
          console.error("Search failed:", response.status);
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  console.log(debouncedSearchQuery, searchFilter);
  // Debounced search effect
  useEffect(() => {
    if (debouncedSearchQuery) {
      handleSearch(debouncedSearchQuery, searchFilter);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery, searchFilter, handleSearch]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    router.push("/");
  };

  const handleResultClick = (result: SearchResult) => {
    setIsSearchOpen(false);
    setSearchQuery("");

    startTransition(() => {
      if (result.type === "subscription") {
        router.push(`/subscriptions/${result.id}`);
      } else {
        router.push(`/services/${result.id}`);
      }
    });
  };

  const handleQuickSearch = (type: SearchType, value: string) => {
    setSearchFilter((prev) => ({ ...prev, type }));
    setSearchQuery(value);
    setIsSearchOpen(true);
  };

  const handleSearchInputFocus = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-16">Loading...</div>
    );
  }

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Menu */}
            <div className="flex items-center space-x-4">
              <button
                className="p-2 hover:bg-accent rounded-md md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <ShieldBan className="h-8 w-8 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">
                  Renewal Guard
                </span>
              </Link>
            </div>

            {/* Search Bar - Desktop */}
            {isAuthenticated && reduxUser && (
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleSearchInputFocus}
                    placeholder="Search subscriptions, services..."
                    className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 hover:bg-accent rounded p-1"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-accent rounded p-1"
                  >
                    <Filter className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              {isAuthenticated && reduxUser ? (
                <>
                  {/* Search Icon - Mobile */}
                  <button
                    className="p-2 hover:bg-accent rounded-md md:hidden"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="h-5 w-5" />
                  </button>

                  {/* Notifications */}
                  <button className="relative p-2 hover:bg-accent rounded-md">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center">
                      3
                    </span>
                  </button>

                  {/* User Menu */}
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-sm font-medium hidden sm:block">
                      {reduxUser?.name}
                    </span>
                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/loginPage"
                    className="rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isAuthenticated && reduxUser && isMenuOpen && (
            <div className="pb-3 md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search subscriptions..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  onFocus={() => {
                    setIsMenuOpen(false);
                    setIsSearchOpen(true);
                  }}
                />
              </div>
            </div>
          )}

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-border">
              <div className="flex flex-col space-y-2 py-4">
                {isAuthenticated && reduxUser ? (
                  <button
                    onClick={handleLogout}
                    className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      href="/loginPage"
                      className="rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-md px-4 py-2 text-sm font-medium text-primary-foreground bg-primary transition-colors hover:bg-primary/90"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Search Modal - Rendered as a portal-like component */}
      {isSearchOpen && (
        <SearchModal
          query={searchQuery}
          setSearchQuery={setSearchQuery}
          results={searchResults}
          isLoading={isSearching}
          filter={searchFilter}
          onFilterChange={setSearchFilter}
          onResultClick={handleResultClick}
          onClose={handleCloseSearch}
          onQuickSearch={handleQuickSearch}
        />
      )}
    </>
  );
};
