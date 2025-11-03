import React from "react";
import { render, screen, fireEvent } from "../../test-utils";
import "@testing-library/jest-dom";
import SubscriptionCard from "../components/dashboard/SubscriptionCard";

const mockSubscription = {
  id: "1",
  _id: "1",
  name: "Netflix",
  serviceName: "Netflix",
  status: "active" as const,
  category: "Entertainment",
  autoRenew: true,
  billingDate: {
    nextBillingDate: "2024-12-01T00:00:00.000Z",
    startDate: "2023-12-01T00:00:00.000Z",
    endDate: "2024-11-30T00:00:00.000Z",
  },
  price: { amount: 15.99, currency: "USD", billingCycle: "monthly" },
  paymentMethod: "credit_card",
  sendReminders: true,
};

describe("SubscriptionCard", () => {
  const mockOnCancel = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnEdit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders subscription information correctly", () => {
    render(
      <SubscriptionCard
        subscription={mockSubscription}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.getByText("15.99 USD")).toBeInTheDocument();
    expect(screen.getByText("Entertainment • monthly")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("Auto-renew")).toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", () => {
    render(
      <SubscriptionCard
        subscription={mockSubscription}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledWith("1");
  });

  it("calls onDelete when delete button is clicked", () => {
    render(
      <SubscriptionCard
        subscription={mockSubscription}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith("1");
  });

  it("calls onEdit when edit button is clicked", () => {
    render(
      <SubscriptionCard
        subscription={mockSubscription}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalled();
  });

  it("shows cancelling state when isCancelling is true", () => {
    render(
      <SubscriptionCard
        subscription={mockSubscription}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
        isCancelling={true}
      />
    );

    expect(screen.getByText("Cancelling...")).toBeInTheDocument();
    expect(screen.getByText("Cancelling...")).toBeDisabled();
  });

  it("does not show action buttons for non-active subscriptions", () => {
    const expiredSubscription = {
      ...mockSubscription,
      status: "expired" as const,
      autoRenew: false,
    };

    render(
      <SubscriptionCard
        subscription={expiredSubscription}
        onCancel={mockOnCancel}
        onDelete={mockOnDelete}
        onEdit={mockOnEdit}
      />
    );

    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });
});
