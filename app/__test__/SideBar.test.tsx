import React from "react";
import { render, screen, fireEvent, waitFor } from "../../test-utils";
import "@testing-library/jest-dom";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../hooks/useAuth";

// Mock next/navigation
const mockPush = jest.fn();
const mockUsePathname = jest.fn();

jest.mock("../hooks/useAuth");
const mockUseAuth = useAuth as jest.Mock;

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => mockUsePathname(),
}));

// Mock Redux
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));

// Mock userSlice

jest.mock("../store/slices/userSlice", () => ({
  clearUser: jest.fn(),
}));

// Mock UI components
jest.mock("@/components/ui/button", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: ({ children, onClick, variant, size, className }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
    >
      {children}
    </button>
  ),
}));

// Mock SidebarThemeToggle
jest.mock("../components/layout/SideBarThemeToggle", () => ({
  SidebarThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

// Mock Lucide icons
jest.mock("lucide-react", () => ({
  LogOut: () => <span data-testid="logout-icon">LogOut</span>,
  BarChart3: () => <span data-testid="analytics-icon">BarChart3</span>,
  Settings: () => <span data-testid="settings-icon">Settings</span>,
  HelpCircle: () => <span data-testid="help-icon">HelpCircle</span>,
  CreditCard: () => <span data-testid="subscriptions-icon">CreditCard</span>,
}));

describe("Sidebar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/dashboard");

    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "Test User" },
    });

    // Mock localStorage with default authenticated state
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key: string) => {
          if (key === "token") return "mock-token";
          if (key === "refreshToken") return "mock-refresh-token";
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Mock fetch with successful default response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    // Mock console.error to track errors
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders sidebar with navigation items", () => {
    render(<Sidebar />);

    expect(screen.getByText("Renewal Guard")).toBeInTheDocument();
    expect(screen.getByText("Subscriptions")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Sub-Settings")).toBeInTheDocument();
    expect(screen.getByText("Help")).toBeInTheDocument();
  });

  it("highlights active navigation item", () => {
    mockUsePathname.mockReturnValue("/dashboard");

    render(<Sidebar />);

    const subscriptionsLink = screen.getByText("Subscriptions").closest("a");
    expect(subscriptionsLink).toHaveClass(
      "bg-accent",
      "text-accent-foreground"
    );
  });

  it("renders logout button for authenticated users", () => {
    // Mock localStorage to return tokens (simulating authenticated user)
    (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "token") return "mock-token";
      if (key === "refreshToken") return "mock-refresh-token";
      return null;
    });

    render(<Sidebar />);

    expect(screen.queryByText("Login")).not.toBeInTheDocument();
    expect(screen.queryByText("Sign Up")).not.toBeInTheDocument();
  });

  it("renders login/signup buttons for unauthenticated users", () => {
    // Mock localStorage to return no tokens (simulating unauthenticated user)
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);

    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(<Sidebar />);

    expect(screen.getByText("Sign Up")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  it("handles logout successfully", async () => {
    render(<Sidebar />);

    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/v1/auth/sign-out`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer mock-token",
          }),
        })
      );
    });

    expect(window.localStorage.removeItem).toHaveBeenCalledWith("token");
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("refreshToken");
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("user");

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("handles logout API failure gracefully", async () => {
    (window.localStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === "token") return "mock-token";
      return null;
    });

    (global.fetch as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(<Sidebar />);

    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(window.localStorage.removeItem).not.toHaveBeenCalledWith("token");
      expect(window.localStorage.removeItem).not.toHaveBeenCalledWith(
        "refreshToken"
      );
      expect(window.localStorage.removeItem).not.toHaveBeenCalledWith("user");
    });
  });

  it("renders theme toggle", () => {
    render(<Sidebar />);
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });

  it("has correct navigation links", () => {
    render(<Sidebar />);

    const subscriptionsLink = screen.getByText("Subscriptions").closest("a");
    const analyticsLink = screen.getByText("Analytics").closest("a");
    const settingsLink = screen.getByText("Settings").closest("a");
    const helpLink = screen.getByText("Help").closest("a");

    expect(subscriptionsLink).toHaveAttribute("href", "/dashboard");
    expect(analyticsLink).toHaveAttribute("href", "/analytics");
    expect(settingsLink).toHaveAttribute("href", "/settings");
    expect(helpLink).toHaveAttribute("href", "/help");
  });
});
