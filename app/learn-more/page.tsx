// app/learn-more/page.tsx
"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  Bell,
  Shield,
  BarChart,
  CreditCard,
  Users,
} from "lucide-react";
import Link from "next/link";
import { LandingNavbar } from "../components/LandingNavbar";
import Sidebar from "../components/layout/Sidebar";
import { MobileBottomNav } from "../components/layout/MobileBottomNav";

export default function LearnMorePage() {
  const features = [
    {
      icon: Bell,
      title: "Smart Reminders",
      description:
        "Never miss a payment with customizable reminders via email, SMS, or push notifications.",
    },
    {
      icon: CreditCard,
      title: "Subscription Tracking",
      description:
        "Track all your subscriptions in one place with detailed analytics and spending insights.",
    },
    {
      icon: BarChart,
      title: "Spending Analytics",
      description:
        "Visualize your subscription costs with detailed charts and category breakdowns.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description:
        "Your financial data is encrypted and never shared with third parties.",
    },
    {
      icon: Users,
      title: "Multi-Platform",
      description:
        "Access your subscriptions from any device with our responsive web app.",
    },
    {
      icon: CheckCircle,
      title: "Easy Cancellation",
      description:
        "Track cancellation dates and get reminders before free trials convert to paid.",
    },
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "Track up to 5 subscriptions",
        "Email reminders",
        "Basic analytics",
        "30-day history",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$4.99",
      period: "per month",
      features: [
        "Unlimited subscriptions",
        "SMS & push notifications",
        "Advanced analytics",
        "1-year history",
        "Export data",
        "Priority support",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Team",
      price: "$9.99",
      period: "per month",
      features: [
        "Everything in Pro",
        "Multiple users",
        "Team dashboard",
        "Custom categories",
        "API access",
        "Dedicated support",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <LandingNavbar />

      <div className="flex flex-1">
        {/* Sidebar - Only on desktop */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Hero Section */}
        <div className="flex-1 w-full lg:ml-0 pb-16 lg:pb-0">
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Take Control of Your
                <span className="text-primary"> Subscriptions</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Renewal Guard helps you track, manage, and optimize your
                subscriptions. Never pay for forgotten services again.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" asChild>
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/dashboard">View Demo</Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">
                  Why Choose Renewal Guard?
                </h2>
                <p className="text-muted-foreground text-lg">
                  Everything you need to manage your subscription lifecycle
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <Card key={index} className="text-center">
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <feature.icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-16 px-4 bg-muted/50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                <p className="text-muted-foreground text-lg">
                  Simple steps to subscription freedom
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Add Subscriptions
                  </h3>
                  <p className="text-muted-foreground">
                    Quickly add your subscriptions with our simple form or
                    import from your email.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Set Reminders</h3>
                  <p className="text-muted-foreground">
                    Choose when to be notified - 7 days, 3 days, or 1 day before
                    renewal.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Save Money</h3>
                  <p className="text-muted-foreground">
                    Cancel unused subscriptions and never pay for forgotten
                    services again.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-muted-foreground text-lg">
                  Start free, upgrade as you grow
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {pricingPlans.map((plan, index) => (
                  <Card
                    key={index}
                    className={`relative ${
                      plan.popular ? "border-primary shadow-lg" : ""
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="my-4">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">
                          /{plan.period}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="w-full"
                        variant={plan.popular ? "default" : "outline"}
                        asChild
                      >
                        <Link
                          href={plan.name === "Team" ? "/contact" : "/signup"}
                        >
                          {plan.cta}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 px-4 bg-primary text-primary-foreground">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Take Control?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of users who have saved money and reduced
                subscription stress.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
}
