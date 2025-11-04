import React from "react";
import { render, screen, fireEvent, waitFor } from "../../test-utils";
import "@testing-library/jest-dom";
import SubscriptionForm from "../components/dashboard/SubscriptionForm";

// Mock the UI components
jest.mock("@/components/ui/dialog", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Dialog: ({ children, open }: any) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DialogHeader: ({ children }: any) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DialogTitle: ({ children }: any) => (
    <h3 data-testid="dialog-title">{children}</h3>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DialogDescription: ({ children }: any) => (
    <p data-testid="dialog-description">{children}</p>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Button: ({ children, onClick, variant, type, disabled }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Input: ({ id, value, onChange, placeholder, type, required }: any) => (
    <input
      data-testid={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      required={required}
    />
  ),
}));

jest.mock("@/components/ui/label", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

jest.mock("@/components/ui/textarea", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Textarea: ({ id, value, onChange, placeholder }: any) => (
    <textarea
      data-testid={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
}));

jest.mock("@/components/ui/switch", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Switch: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-testid="switch"
    />
  ),
}));

jest.mock("@/components/ui/select", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Select: ({ children, value, onValueChange, required }: any) => (
    <div data-testid="select">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { value, onValueChange, required })
      )}
    </div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SelectTrigger: ({ children }: any) => (
    <div data-testid="select-trigger">{children}</div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SelectValue: ({ placeholder }: any) => (
    <span data-testid="select-value">{placeholder}</span>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SelectContent: ({ children }: any) => (
    <div data-testid="select-content">{children}</div>
  ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  SelectItem: ({ value, children }: any) => (
    <div data-testid={`select-item-${value}`}>{children}</div>
  ),
}));

// Mock Redux
const mockDispatch = jest.fn();
jest.mock("../hooks/redux", () => ({
  useAppDispatch: () => mockDispatch,
}));

// Mock fetch
global.fetch = jest.fn();

describe("SubscriptionForm", () => {
  const mockOnCancel = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: {} }),
    });

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => "mock-token"),
      },
      writable: true,
    });
  });

  it("renders create form correctly", () => {
    render(
      <SubscriptionForm
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        mode="create"
      />
    );

    expect(screen.getByTestId("dialog")).toBeInTheDocument();
    expect(screen.getByText("Create Subscription")).toBeInTheDocument();
  });

  it("renders edit form with subscription data", () => {
    const mockSubscription = {
      id: "1",
      _id: "1",
      name: "Netflix",
      serviceName: "Netflix",
      status: "active" as const,
      category: "streaming",
      price: {
        amount: 15.99,
        currency: "USD",
        billingCycle: "monthly",
      },
      billingDate: {
        startDate: "2024-01-01T00:00:00.000Z",
        nextBillingDate: "2024-02-01T00:00:00.000Z",
      },
      paymentMethod: "credit_card",
      autoRenew: true,
      sendReminders: true,
      notes: "Test notes",
    };

    render(
      <SubscriptionForm
        subscription={mockSubscription}
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        mode="edit"
      />
    );

    const renewalElements = screen.getAllByDisplayValue("Netflix");
    const priceElements = screen.getAllByDisplayValue("15.99");
    expect(renewalElements.length).toBeGreaterThan(0);
    expect(priceElements.length).toBeGreaterThan(0);

    expect(renewalElements[0]).toBeInTheDocument();
    expect(priceElements[0]).toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", () => {
    render(
      <SubscriptionForm
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        mode="create"
      />
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("submits form data correctly", async () => {
    // Mock a successful response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { id: "123" } }),
    });

    render(
      <SubscriptionForm
        onCancel={mockOnCancel}
        onSuccess={mockOnSuccess}
        mode="create"
      />
    );

    // Fill in ALL required form fields
    const nameInput = screen.getByTestId("name");
    fireEvent.change(nameInput, {
      target: { value: "Test Subscription" },
    });

    const serviceNameInput = screen.getByTestId("serviceName");
    fireEvent.change(serviceNameInput, {
      target: { value: "Test Service" },
    });

    // Wait a bit for the select to open (if needed)
    await waitFor(() => {
      // This might need adjustment based on your actual Select implementation
    });

    const priceInput = screen.getByTestId("priceAmount");
    fireEvent.change(priceInput, {
      target: { value: "9.99" },
    });

    const startDateInput = screen.getByTestId("startDate");
    fireEvent.change(startDateInput, {
      target: { value: "2024-01-01" },
    });

    const nextBillingInput = screen.getByTestId("nextBillingDate");
    fireEvent.change(nextBillingInput, {
      target: { value: "2024-02-01" },
    });

    // Submit form
    const submitButton = screen.getByTestId("create-button");
    fireEvent.click(submitButton);

    const form = screen.getByTestId("subscription-form");
    fireEvent.submit(form);

    // Wait for fetch to be called with a longer timeout
    await waitFor(
      () => {
        if (global.fetch) {
          console.log(
            "Fetch calls:",
            (global.fetch as jest.Mock).mock.calls.length
          );
          console.log("Fetch calls:", (global.fetch as jest.Mock).mock.calls);
        }
        expect(global.fetch).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );

    // Verify the API call
    expect(global.fetch).toHaveBeenCalledWith(
      `/api/v1/subscriptions`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Bearer mock-token",
        }),
      })
    );
  });
});
