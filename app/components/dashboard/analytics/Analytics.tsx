"use client";

import React, { useMemo, useCallback } from "react";
import { useAppSelector } from "../../../hooks/redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { SubscriptionAISuggestion } from "../subscription/Subscription-ai-suggestion";
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

interface Subscription {
  id: string;
  _id?: string;
  name: string;
  status:
    | "active"
    | "expired"
    | "cancelled"
    | "deleted"
    | "inactive"
    | "pending";
  category: string;
  price: { amount: number; currency: string; billingCycle: string };
  billingDate?: { nextBillingDate: string };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

function Analytics() {
  const subscriptions = useAppSelector(
    (state) => state.subscription.subscriptions,
  ) as Subscription[];
  const isLoading = useAppSelector((state) => state.subscription.loading);
  const currentDate = useMemo(() => new Date(), []);

  const processSubscriptionStatus = useCallback(
    (sub: Subscription): Subscription => {
      const nextBillingDate = sub?.billingDate?.nextBillingDate;
      if (nextBillingDate) {
        const billingDate = new Date(nextBillingDate);
        if (sub.status === "active" && billingDate <= currentDate) {
          return { ...sub, status: "expired" };
        }
        if (sub.status === "expired" && billingDate > currentDate) {
          return { ...sub, status: "active" };
        }
      }
      return sub;
    },
    [currentDate],
  );

  const processedSubscriptions = useMemo(
    () => subscriptions?.map(processSubscriptionStatus) || [],
    [subscriptions, processSubscriptionStatus],
  );

  const activeSubscriptions = useMemo(
    () => processedSubscriptions.filter((sub) => sub.status === "active"),
    [processedSubscriptions],
  );

  const totalMonthlyCost = useMemo(
    () =>
      activeSubscriptions.reduce(
        (sum, sub) => sum + (sub.price.amount || 0),
        0,
      ),
    [activeSubscriptions],
  );

  const categoryBreakdown = useMemo(
    () =>
      activeSubscriptions.reduce(
        (acc, sub) => {
          const category = sub.category || "Uncategorized";
          acc[category] = (acc[category] || 0) + (sub.price.amount || 0);
          return acc;
        },
        {} as Record<string, number>,
      ),
    [activeSubscriptions],
  );

  const categoryData = useMemo(
    () =>
      Object.entries(categoryBreakdown).map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)),
      })),
    [categoryBreakdown],
  );

  const statusCount = useMemo(
    () =>
      processedSubscriptions.reduce(
        (acc, sub) => {
          acc[sub.status] = (acc[sub.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [processedSubscriptions],
  );

  const statusData = useMemo(
    () =>
      Object.entries(statusCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      })),
    [statusCount],
  );

  const monthlyCostByCategory = useMemo(
    () =>
      Object.entries(categoryBreakdown).map(([category, cost]) => ({
        category,
        cost: parseFloat(cost.toFixed(2)),
      })),
    [categoryBreakdown],
  );

  const upcomingRenewals = useMemo(
    () =>
      activeSubscriptions
        .filter((sub) => {
          if (!sub.billingDate?.nextBillingDate) return false;
          const renewalDate = new Date(sub.billingDate.nextBillingDate);
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          return renewalDate <= thirtyDaysFromNow;
        })
        .sort(
          (a, b) =>
            new Date(a.billingDate!.nextBillingDate).getTime() -
            new Date(b.billingDate!.nextBillingDate).getTime(),
        ),
    [activeSubscriptions],
  );

  const renderPieLabel = (props: PieLabelRenderProps) => {
    const percent = (props.percent as number) ?? 0;
    return `${(percent * 100).toFixed(0)}%`;
  };

  if (isLoading && subscriptions.length === 0) {
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
      <div className="flex-1 p-4 sm:p-6">
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
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Insights into your subscriptions (Updated in real-time)
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Subs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">
              {processedSubscriptions.length}
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
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
                  <Tooltip formatter={(value) => [`$${value}`, "Cost"]} />
                  <Bar dataKey="cost" fill="#8884d8" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

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
                    label={renderPieLabel}
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
                    label={renderPieLabel}
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
                  <Tooltip formatter={(value) => [`$${value}`, "Spending"]} />
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

        <Card className="col-span-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg sm:text-xl">
                Upcoming Renewals (30 Days)
              </CardTitle>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Savings
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 sm:max-h-80 overflow-y-auto pr-2">
              {upcomingRenewals.length > 0 ? (
                upcomingRenewals.map((subscription) => (
                  <div key={subscription.id} className="space-y-2">
                    <div
                      className="flex justify-between items-center p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                      onClick={() => {
                        const aiCard = document.getElementById(
                          `ai-suggestion-${subscription.id}`,
                        );
                        if (aiCard) {
                          aiCard.classList.toggle("hidden");
                        }
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">
                            {subscription.name}
                          </p>
                          <Sparkles className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(
                            subscription.billingDate!.nextBillingDate,
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
                    <div
                      id={`ai-suggestion-${subscription.id}`}
                      className="hidden"
                    >
                      <SubscriptionAISuggestion subscription={subscription} />
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
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => alert("Batch AI Savings Report coming soon!")}
              >
                <Sparkles className="h-3 w-3 mr-2" />
                Get AI Savings Report for All Subscriptions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Analytics;
