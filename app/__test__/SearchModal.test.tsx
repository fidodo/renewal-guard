import React from "react";
import { render, screen, fireEvent } from "../../test-utils";
import "@testing-library/jest-dom";
import { SearchModal } from "../components/SearchModal";
import type { SearchResult, SearchType } from "../components/LandingNavbar";

// Mock Lucide icons
jest.mock("lucide-react", () => ({
  Search: () => <span data-testid="search-icon">Search</span>,
  X: () => <span data-testid="x-icon">X</span>,
  Calendar: () => <span data-testid="calendar-icon">Calendar</span>,
  DollarSign: () => <span data-testid="dollar-icon">DollarSign</span>,
  Tag: () => <span data-testid="tag-icon">Tag</span>,
  Loader2: () => <span data-testid="loader-icon">Loader2</span>,
}));

const mockSearchResults: SearchResult[] = [
  {
    id: "1",
    type: "subscription",
    name: "Netflix",
    description: "Streaming service",
    relevance: 0.95,
    price: { amount: 15.99, currency: "USD", billingCycle: "monthly" },
    billingDate: {
      startDate: "2023-12-01T00:00:00.000Z",
      nextBillingDate: "2024-12-01T00:00:00.000Z",
    },
    category: "entertainment",
  },

  {
    id: "2",
    type: "service",
    name: "Spotify",
    description: "Music streaming",
    relevance: 0.85,
    price: { amount: 9.99, currency: "USD", billingCycle: "monthly" },
    billingDate: {
      startDate: "2023-11-15T00:00:00.000Z",
      nextBillingDate: "2024-11-15T00:00:00.000Z",
      endDate: "2025-11-15T00:00:00.000Z",
    },
    category: "entertainment",
  },
];

const defaultProps = {
  query: "",
  setSearchQuery: jest.fn(),
  results: [] as SearchResult[],
  isLoading: false,
  filter: { type: "all" as SearchType },
  onFilterChange: jest.fn(),
  onResultClick: jest.fn(),
  onClose: jest.fn(),
  onQuickSearch: jest.fn(),
};

describe("SearchModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders search modal with input", () => {
    render(<SearchModal {...defaultProps} />);

    expect(
      screen.getByPlaceholderText("Search subscriptions, services, prices...")
    ).toBeInTheDocument();

    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("focuses input when modal opens", () => {
    // Create a spy before rendering
    const focusSpy = jest.spyOn(HTMLInputElement.prototype, "focus");

    render(<SearchModal {...defaultProps} />);

    // Check that focus was called
    expect(focusSpy).toHaveBeenCalled();

    // Clean up
    focusSpy.mockRestore();
  });

  it("calls onClose when clicking outside modal", () => {
    render(<SearchModal {...defaultProps} />);

    // Click on the backdrop (the outer div)
    const backdrop = screen.getByTestId("search-modal-backdrop");
    fireEvent.click(backdrop!);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onClose when pressing Escape key", () => {
    render(<SearchModal {...defaultProps} />);

    fireEvent.keyDown(document, { key: "Escape" });

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("does not close modal when clicking inside", () => {
    render(<SearchModal {...defaultProps} />);

    const modalContent = screen.getByTestId("search-modal-content");
    fireEvent.click(modalContent);

    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it("updates search query when typing", () => {
    render(<SearchModal {...defaultProps} />);

    const input = screen.getByPlaceholderText(
      "Search subscriptions, services, prices..."
    );
    fireEvent.change(input, { target: { value: "netflix" } });

    expect(defaultProps.setSearchQuery).toHaveBeenCalledWith("netflix");
  });

  it("shows clear button when query is not empty", () => {
    render(<SearchModal {...defaultProps} query="netflix" />);

    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });

  it("clears search when clear button is clicked", () => {
    render(<SearchModal {...defaultProps} query="netflix" />);

    const clearButton = screen.getByTestId("x-icon").closest("button");
    fireEvent.click(clearButton!);

    expect(defaultProps.setSearchQuery).toHaveBeenCalledWith("");
  });

  it("shows quick searches when no query", () => {
    render(<SearchModal {...defaultProps} />);

    expect(screen.getByText("Quick Searches")).toBeInTheDocument();
    expect(screen.getByText("Under $10")).toBeInTheDocument();
    expect(screen.getByText("Renewing Soon")).toBeInTheDocument();
    expect(screen.getByText("Active Subs")).toBeInTheDocument();
  });

  it("hides quick searches when query exists", () => {
    render(<SearchModal {...defaultProps} query="netflix" />);

    expect(screen.queryByText("Quick Searches")).not.toBeInTheDocument();
  });

  it("calls onQuickSearch when quick search is clicked", () => {
    render(<SearchModal {...defaultProps} />);

    const under10Button = screen.getByText("Under $10");
    fireEvent.click(under10Button);

    expect(defaultProps.onQuickSearch).toHaveBeenCalledWith(
      "price",
      "price:<10"
    );
  });

  it("shows loading state", () => {
    render(<SearchModal {...defaultProps} isLoading={true} />);

    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    expect(screen.getByText("Searching...")).toBeInTheDocument();
  });

  it("shows search results", () => {
    render(<SearchModal {...defaultProps} results={mockSearchResults} />);

    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.getByText("Streaming service")).toBeInTheDocument();
    expect(screen.getByText("$15.99/mo")).toBeInTheDocument();
    expect(screen.getByText("Spotify")).toBeInTheDocument();
    expect(screen.getByText("Music streaming")).toBeInTheDocument();
    expect(screen.getByText("$9.99/mo")).toBeInTheDocument();
  });

  it("calls onResultClick when result is clicked", () => {
    render(<SearchModal {...defaultProps} results={mockSearchResults} />);

    const netflixResult = screen.getByText("Netflix");
    fireEvent.click(netflixResult);

    expect(defaultProps.onResultClick).toHaveBeenCalledWith(
      mockSearchResults[0]
    );
  });

  it("shows no results message", () => {
    render(<SearchModal {...defaultProps} query="nonexistent" results={[]} />);

    expect(
      screen.getByText('No results found for "nonexistent"')
    ).toBeInTheDocument();
    expect(
      screen.getByText("Try different keywords or filters")
    ).toBeInTheDocument();
  });

  it("shows start typing message when no query", () => {
    render(<SearchModal {...defaultProps} />);

    expect(
      screen.getByText("Start typing to search your subscriptions and services")
    ).toBeInTheDocument();
  });

  it("handles filter change", () => {
    render(<SearchModal {...defaultProps} />);

    const filterSelect = screen.getByDisplayValue("All");
    fireEvent.change(filterSelect, { target: { value: "subscription" } });

    expect(defaultProps.onFilterChange).toHaveBeenCalledWith({
      ...defaultProps.filter,
      type: "subscription",
    });
  });

  it("displays relevance percentage", () => {
    render(<SearchModal {...defaultProps} results={mockSearchResults} />);

    expect(screen.getByText("95% match")).toBeInTheDocument();
    expect(screen.getByText("85% match")).toBeInTheDocument();
  });

  it("displays result types with appropriate badges", () => {
    render(<SearchModal {...defaultProps} results={mockSearchResults} />);

    const subscriptionBadge = screen.getByText("subscription");
    const serviceBadge = screen.getByText("service");

    expect(subscriptionBadge).toBeInTheDocument();
    expect(serviceBadge).toBeInTheDocument();
  });

  it("displays renewal dates", () => {
    render(<SearchModal {...defaultProps} results={mockSearchResults} />);

    const renewalElements = screen.getAllByText(/Renews:/);
    expect(renewalElements.length).toBeGreaterThan(0);

    // Or check that at least one element is in the document
    expect(renewalElements[0]).toBeInTheDocument();
  });
});
