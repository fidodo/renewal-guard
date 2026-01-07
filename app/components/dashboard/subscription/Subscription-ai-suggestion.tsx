// First, create a new component for the AI suggestion feature
// components/subscription-ai-suggestion.tsx
import React, { useState } from "react";
import { Sparkles, RefreshCw, AlertCircle, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AISuggestionProps {
  subscription: {
    id: string;
    name: string;
    category: string;
    price: { amount: number };
  };
}

interface AIAlternative {
  name: string;
  price: number;
  savings: number;
  description: string;
  pros: string[];
  cons: string[];
}

export const SubscriptionAISuggestion: React.FC<AISuggestionProps> = ({
  subscription,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AIAlternative | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getAISuggestion = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/openai/subscription-alternative", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          subscriptionName: subscription.name,
          category: subscription.category,
          currentPrice: subscription.price.amount,
          frequency: "monthly",
          subscriptionId: subscription.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI suggestions");
      }

      const data = await response.json();

      if (data.success && data.alternative) {
        setSuggestion(data.alternative);
      } else {
        setError("No cheaper alternatives found");
      }
    } catch (err) {
      console.error("AI suggestion error:", err);
      setError("Failed to get suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetSuggestion = () => {
    setSuggestion(null);
    setError(null);
  };

  return (
    <Card className="mt-2 border-dashed">
      <CardContent className="pt-4">
        {!suggestion ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">
                Find Cheaper Alternative
              </span>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Let AI find you a better deal
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={getAISuggestion}
                disabled={isLoading}
                className="h-7 text-xs"
              >
                {isLoading ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <DollarSign className="h-3 w-3 mr-1" />
                )}
                {isLoading ? "Searching..." : "Find Deal"}
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2 rounded">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-500" />
                <span className="text-sm font-semibold">
                  AI Suggested Alternative
                </span>
              </div>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                Save ${suggestion.savings.toFixed(2)}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{suggestion.name}</span>
                <span className="text-sm font-bold">
                  ${suggestion.price.toFixed(2)}/mo
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                {suggestion.description}
              </p>

              {suggestion.pros.length > 0 && (
                <div>
                  <p className="text-xs font-medium mb-1">✅ Pros:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {suggestion.pros.map((pro, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-green-500">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 flex-1"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/search?q=${encodeURIComponent(
                        suggestion.name
                      )}`,
                      "_blank"
                    )
                  }
                >
                  Learn More
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={resetSuggestion}
                  className="text-xs h-7"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
