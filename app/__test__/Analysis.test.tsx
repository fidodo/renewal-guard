import React from "react";
import { render, screen } from "../../test-utils";
import "@testing-library/jest-dom";
import Analytics from "../components/dashboard/analytics/Analytics";

// Mock recharts to avoid SVG and canvas issues in tests
jest.mock("recharts", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ResponsiveContainer: ({ children, width, height }: any) => (
    <div data-testid="responsive-container" style={{ width, height }}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  BarChart: ({ children, data }: any) => (
    <div data-testid="bar-chart" data-data={JSON.stringify(data)}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PieChart: ({ children }: any) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Cell: () => <div data-testid="cell" />,
}));

// Mock UI components
jest.mock("@/components/ui/card", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CardTitle: ({ children }: any) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CardContent: ({ children }: any) => (
    <div data-testid="card-content">{children}</div>
  ),
}));

// Mock Redux hooks
const mockUseAppSelector = jest.fn();
jest.mock("../hooks/redux", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

const mockSubscriptions = [
  {
    id: "1",
    _id: "1",
    name: "Netflix",
    serviceName: "Netflix",
    status: "active" as const,
    category: "Entertainment",
    price: {
      amount: 15.99,
      currency: "USD",
      billingCycle: "monthly",
    },
    billingDate: {
      nextBillingDate: "2024-12-01T00:00:00.000Z",
      startDate: "2023-12-01T00:00:00.000Z",
      endDate: "2024-11-30T00:00:00.000Z",
    },
    paymentMethod: "credit_card",
    autoRenew: true,
    sendReminders: true,
  },
  {
    id: "2",
    _id: "2",
    name: "Spotify",
    serviceName: "Spotify",
    status: "active" as const,
    category: "Music",
    price: {
      amount: 9.99,
      currency: "USD",
      billingCycle: "monthly",
    },
    billingDate: {
      nextBillingDate: "2024-11-15T00:00:00.000Z",
      startDate: "2023-11-15T00:00:00.000Z",
      endDate: "2025-11-15T00:00:00.000Z",
    },
    paymentMethod: "paypal",
    autoRenew: false,
    sendReminders: true,
  },
  {
    id: "3",
    _id: "3",
    name: "Expired Service",
    serviceName: "Expired Service",
    status: "expired" as const,
    category: "Other",
    price: {
      amount: 0,
      currency: "USD",
      billingCycle: "monthly",
    },
    billingDate: {
      nextBillingDate: "2024-10-01T00:00:00.000Z",
      startDate: "2023-10-01T00:00:00.000Z",
      endDate: "2024-09-30T00:00:00.000Z",
    },
    paymentMethod: "credit_card",
    autoRenew: false,
    sendReminders: false,
  },
];

describe("Analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state when loading is true", () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.toString().includes("loading")) return true;
      return [];
    });

    render(<Analytics />);

    expect(screen.getByText("Loading analytics...")).toBeInTheDocument();
  });

  it("shows empty state when no subscriptions", () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.toString().includes("subscriptions")) return [];
      if (selector.toString().includes("loading")) return false;
      return null;
    });

    render(<Analytics />);

    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(
      screen.getByText("Insights into your subscriptions")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "No subscription data available. Add some subscriptions to see analytics."
      )
    ).toBeInTheDocument();
  });

  it("renders analytics with subscription data", () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.toString().includes("subscriptions"))
        return mockSubscriptions;
      if (selector.toString().includes("loading")) return false;
      return null;
    });

    render(<Analytics />);

    // Check header
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(
      screen.getByText("Insights into your subscriptions")
    ).toBeInTheDocument();

    // Check summary cards
    expect(screen.getByText("Spending by Category")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    expect(screen.getByText("Subscription Status")).toBeInTheDocument();
    expect(screen.getAllByText("2")).toHaveLength(2);

    expect(screen.getByText("Monthly Cost by Category")).toBeInTheDocument();
    expect(screen.getByText("$25.98")).toBeInTheDocument();

    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();

    // Check chart titles
    expect(screen.getByText("Monthly Cost by Category")).toBeInTheDocument();
    expect(screen.getByText("Subscription Status")).toBeInTheDocument();
    expect(screen.getByText("Spending by Category")).toBeInTheDocument();
    expect(screen.getByText("Upcoming Renewals (30 Days)")).toBeInTheDocument();
  });

  it("calculates correct analytics data", () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.toString().includes("subscriptions"))
        return mockSubscriptions;
      if (selector.toString().includes("loading")) return false;
      return null;
    });

    render(<Analytics />);

    // Total subscriptions count
    expect(screen.getByText("3")).toBeInTheDocument();

    // Active subscriptions count (only 2 are active)
    const correctAnalyticElements = screen.getAllByText("2");
    expect(correctAnalyticElements).toHaveLength(2);

    // Monthly cost (15.99 + 9.99 = 25.98)
    expect(screen.getByText("$25.98")).toBeInTheDocument();

    // Categories count (Entertainment, Music, Other = 3)
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders chart components", () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.toString().includes("subscriptions"))
        return mockSubscriptions;
      if (selector.toString().includes("loading")) return false;
      return null;
    });

    render(<Analytics />);

    // Check that chart containers are rendered
    expect(screen.getAllByTestId("responsive-container")).toHaveLength(3);
    expect(screen.getAllByTestId("bar-chart")).toHaveLength(1);
    expect(screen.getAllByTestId("pie-chart")).toHaveLength(2);
  });

  it("shows upcoming renewals section", () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.toString().includes("subscriptions"))
        return mockSubscriptions;
      if (selector.toString().includes("loading")) return false;
      return null;
    });

    render(<Analytics />);

    // Check upcoming renewals section
    expect(screen.getByText("Upcoming Renewals (30 Days)")).toBeInTheDocument();

    // Should show active subscriptions in upcoming renewals
    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.getByText("Spotify")).toBeInTheDocument();

    // Should show prices
    expect(screen.getByText("$15.99")).toBeInTheDocument();
    expect(screen.getByText("$9.99")).toBeInTheDocument();

    // Should show categories
    expect(screen.getAllByText("Entertainment")).toHaveLength(2);
    expect(screen.getAllByText("Music")).toHaveLength(2);
  });

  it("handles subscriptions with no active ones", () => {
    const onlyExpiredSubscriptions = [
      {
        id: "1",
        _id: "1",
        name: "Expired Service",
        serviceName: "Expired Service",
        status: "expired" as const,
        category: "Other",
        price: { amount: 0, currency: "USD", billingCycle: "monthly" },
        billingDate: {
          nextBillingDate: "2024-10-01T00:00:00.000Z",
          startDate: "2023-10-01T00:00:00.000Z",
          endDate: "2024-09-30T00:00:00.000Z",
        },
        paymentMethod: "credit_card",
        autoRenew: false,
        sendReminders: false,
      },
    ];

    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.toString().includes("subscriptions"))
        return onlyExpiredSubscriptions;
      if (selector.toString().includes("loading")) return false;
      return null;
    });

    render(<Analytics />);

    // Should show total subscriptions
    expect(screen.getByText("1")).toBeInTheDocument();

    const zeroElements = screen.getAllByText("0");
    expect(zeroElements).toHaveLength(2);

    // Should show $0 monthly cost
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });

  it("handles subscriptions with undefined prices gracefully", () => {
    const subscriptionsWithUndefinedPrice = [
      {
        id: "1",
        _id: "1",
        name: "Free Service",
        serviceName: "Free Service",
        status: "active" as const,
        category: "Other",
        price: { amount: undefined, currency: "USD", billingCycle: "monthly" },
        billingDate: {
          nextBillingDate: "2024-12-01T00:00:00.000Z",
          startDate: "2023-12-01T00:00:00.000Z",
          endDate: "2024-11-30T00:00:00.000Z",
        },
        paymentMethod: "credit_card",
        autoRenew: true,
        sendReminders: true,
      },
    ];

    mockUseAppSelector.mockImplementation((selector) => {
      if (selector.toString().includes("subscriptions"))
        return subscriptionsWithUndefinedPrice;
      if (selector.toString().includes("loading")) return false;
      return null;
    });

    render(<Analytics />);

    // Should handle undefined prices without crashing
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });
});
