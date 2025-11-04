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

  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === "active"
  );
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

  const upcomingRenewals = activeSubscriptions
    .filter((sub) => {
      if (!sub.billingDate?.nextBillingDate) return false;
      const renewalDate = new Date(sub.billingDate.nextBillingDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return renewalDate <= thirtyDaysFromNow;
    })
    .sort(
      (a, b) =>
        new Date(a.billingDate?.nextBillingDate).getTime() -
        new Date(b.billingDate?.nextBillingDate).getTime()
    );

  if (isLoading) {
    return (
      <div className="flex-1 p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="ml-0 md:ml-32 lg:ml-64 p-6">
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
    <div className="flex-1 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Insights into your subscriptions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Subs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {subscriptions.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {activeSubscriptions.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Monthly
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              ${totalMonthlyCost.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {categoryData.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Cost by Category - Bar Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Monthly Cost by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyCostByCategory}
                  margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip
                    formatter={(value) => [`$${value}`, "Cost"]}
                    labelFormatter={(label, payload) => {
                      const item = payload[0]?.payload;
                      return item?.fullCategory || label;
                    }}
                  />
                  <Bar dataKey="cost" fill="#8884d8" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status - Pie Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Subscription Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: PieLabelRenderProps) => {
                      const { percent } = props;
                      const value = Number(percent ?? 0);
                      return `${(value * 100).toFixed(0)}%`;
                    }}
                    outerRadius={70}
                    innerRadius={40}
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
                  <Tooltip
                    formatter={(value, name) => [
                      value,
                      `${name} Subscriptions`,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {statusData.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center gap-1 text-xs"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution - Pie Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: PieLabelRenderProps) => {
                      const { percent } = props;
                      const value = Number(percent ?? 0);
                      return `${(value * 100).toFixed(0)}%`;
                    }}
                    outerRadius={70}
                    innerRadius={40}
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
                  <Tooltip
                    formatter={(value, name, props) => [
                      `$${value}`,
                      props.payload.fullName || name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {categoryData.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center gap-1 text-xs"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Renewals */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Upcoming Renewals (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto">
              {upcomingRenewals.length > 0 ? (
                upcomingRenewals.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex justify-between items-center p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {subscription.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          subscription.billingDate?.nextBillingDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-semibold text-sm">
                        ${subscription.price?.amount?.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize truncate max-w-20">
                        {subscription.category}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No upcoming renewals in the next 30 days
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Analytics;
