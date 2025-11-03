import React from "react";
import { useAppSelector } from "../../../hooks/redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  PieLabelRenderProps,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

function Analytics() {
  const subscriptions = useAppSelector(
    (state) => state.subscription.subscriptions
  );

  const isLoading = useAppSelector((state) => state.subscription.loading);

  // Calculate analytics data
  const totalMonthlyCost = subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((sum, sub) => sum + (sub.price.amount || 0), 0);

  const categoryBreakdown = subscriptions
    .filter((sub) => sub.status === "active")
    .reduce((acc, sub) => {
      const category = sub.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + (sub.price.amount || 0);
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryBreakdown).map(
    ([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
    })
  );

  const statusCount = subscriptions.reduce((acc, sub) => {
    acc[sub.status] = (acc[sub.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCount).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const monthlyCostByCategory = Object.entries(categoryBreakdown).map(
    ([category, cost]) => ({
      category,
      cost: parseFloat(cost.toFixed(2)),
    })
  );

  if (isLoading) {
    return (
      <div className="ml-64 p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="ml-64 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Insights into your subscriptions
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-muted-foreground">
            No subscription data available. Add some subscriptions to see
            analytics.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="ml-64 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Insights into your subscriptions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter((sub) => sub.status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalMonthlyCost.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryData.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost by Category - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Cost by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyCostByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, "Cost"]} />
                <Bar dataKey="cost" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subscription Status - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: PieLabelRenderProps) => {
                    const { name, percent } = props;
                    const value = Number(percent ?? 0);
                    return `${name ?? ""} ${(value * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: PieLabelRenderProps) => {
                    const { name, percent } = props;
                    const value = Number(percent ?? 0);
                    return `${name ?? ""} ${(value * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, "Cost"]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming Renewals */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Renewals (Next 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscriptions
                .filter((sub) => {
                  if (sub.status !== "active") return false;
                  const renewalDate = new Date(
                    sub.billingDate?.nextBillingDate
                  );
                  const thirtyDaysFromNow = new Date();
                  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
                  return renewalDate <= thirtyDaysFromNow;
                })
                .sort(
                  (a, b) =>
                    new Date(a.billingDate?.nextBillingDate).getTime() -
                    new Date(b.billingDate?.nextBillingDate).getTime()
                )
                .map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{subscription.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          subscription.billingDate?.nextBillingDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${subscription.price?.amount?.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {subscription.category}
                      </p>
                    </div>
                  </div>
                ))}

              {subscriptions.filter((sub) => sub.status === "active").length ===
                0 && (
                <p className="text-center text-muted-foreground py-8">
                  No upcoming renewals
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Analytics;
