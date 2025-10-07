import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Help() {
  const faqs = [
    {
      question: "How do I add a new subscription?",
      answer:
        "Click the 'Add New Subscription' button on the dashboard, fill in the required information including service name, price, and renewal date, then save.",
    },
    {
      question: "Can I edit or cancel a subscription?",
      answer:
        "Yes, click the 'Edit' button to modify subscription details or 'Cancel' to mark a subscription as cancelled. Cancelled subscriptions can be viewed in the cancelled section.",
    },
    {
      question: "How do reminder notifications work?",
      answer:
        "Renewal Guard sends reminders based on your notification settings. You can configure email and SMS reminders for specific days before renewal (e.g., 7 days, 3 days, 1 day before).",
    },
    {
      question: "What currencies are supported?",
      answer:
        "We support multiple currencies including USD, EUR, GBP, CAD, AUD, and more. You can set your preferred currency in the Settings page.",
    },
    {
      question: "How do I change my notification preferences?",
      answer:
        "Go to Settings → Notification Settings to configure email notifications, SMS reminders, and set your preferred reminder schedule.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes, we take data security seriously. Your subscription data is encrypted and we never share your personal information with third parties without your consent.",
    },
  ];

  return (
    <div className="ml-64 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Get help with Renewal Guard</p>
      </div>

      <div className="grid gap-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Read our comprehensive guides and tutorials
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get in touch with our support team for assistance
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Feature Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Suggest new features or improvements
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Find answers to common questions about Renewal Guard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Still Need Help?</CardTitle>
            <CardDescription>
              Contact our support team for personalized assistance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-muted-foreground">support@renewalguard.com</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Response Time</h3>
              <p className="text-muted-foreground">
                We typically respond within 24 hours
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Office Hours</h3>
              <p className="text-muted-foreground">
                Monday - Friday, 9:00 AM - 6:00 PM EST
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
