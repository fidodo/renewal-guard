import OpenAI from "openai";
import { OPENAI_API_KEY } from "./env.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

let openai;
let useFreeAlternative = false;
let geminiAI = null;

try {
  if (!OPENAI_API_KEY) {
    console.warn("⚠️ OPENAI_API_KEY not found, using free alternative");
    useFreeAlternative = true;
  } else {
    // Initialize OpenAI
    openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
      timeout: 30000,
      maxRetries: 1,
    });
  }
} catch (error) {
  console.error("❌ OpenAI initialization error:", error.message);
  useFreeAlternative = true;
}

if (useFreeAlternative || process.env.GEMINI_API_KEY) {
  try {
    const geminiKey = process.env.GEMINI_API_KEY || "free-alternative-key";
    if (geminiKey && geminiKey !== "free-alternative-key") {
      geminiAI = new GoogleGenerativeAI(geminiKey);
    } else {
      geminiAI = null;
    }
    testGeminiModels(geminiKey);
  } catch (error) {
    console.warn("⚠️ Gemini not available:", error.message);
  }
}

async function testGeminiModels(apiKey) {
  if (!apiKey || apiKey === "free-alternative-key") return;

  try {
    // Try to list available models
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models?key=" + apiKey
    );
    await response.json();
  } catch (error) {
    console.warn("⚠️ Gemini not available:", error.message);
  }
}

const createAIChatCompletion = async (params) => {
  const {
    model = "gpt-3.5-turbo",
    messages,
    max_tokens = 400,
    temperature = 0.7,
  } = params;
  console.log("messages", messages);
  // Try OpenAI first
  if (openai && !useFreeAlternative) {
    try {
      const config = {
        model,
        messages,
        temperature,
      };

      // Handle parameter for different models
      if (model.includes("4o") || model.includes("turbo")) {
        config.max_completion_tokens = max_tokens;
      } else {
        config.max_tokens = max_tokens;
      }

      const completion = await openai.chat.completions.create(config);

      return completion;
    } catch (error) {
      console.warn("⚠️ OpenAI failed, trying fallback:", error.message);

      // If quota exceeded, switch to free alternative
      if (error.code === "insufficient_quota" || error.status === 429) {
        useFreeAlternative = true;
      }
    }
  }

  if (
    geminiAI &&
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== "free-alternative-key"
  ) {
    try {
      const geminiModels = [
        "gemini-2.0-flash",
        "gemini-2.0-flash-001",
        "gemini-2.5-flash",
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash-lite-001",
        "gemini-2.5-flash-lite",
        "gemini-2.5-pro",
      ];

      let lastError = null;

      for (const modelName of geminiModels) {
        try {
          const geminiModel = geminiAI.getGenerativeModel({
            model: modelName,
          });

          const prompt = messages
            .map((m) => `${m.role}: ${m.content}`)
            .join("\n");

          const result = await geminiModel.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: max_tokens,
              temperature,
            },
          });

          const response = result.response;
          const text = response.text();

          return {
            choices: [
              {
                message: {
                  content: text,
                },
              },
            ],
          };
        } catch (modelError) {
          lastError = modelError;
          console.warn(
            `⚠️ Gemini model ${modelName} failed:`,
            modelError.message
          );

          continue;
        }
      }

      throw lastError || new Error("All Gemini models failed");
    } catch (error) {
      console.error("❌ All Gemini models failed:", error.message);
    }
  }

  return {
    choices: [
      {
        message: {
          content: JSON.stringify(getEnhancedMockAIResponse(messages, model)),
        },
      },
    ],
  };
};

// Enhanced mock response generator with better logic
const getEnhancedMockAIResponse = (messages, model = "gpt-3.5-turbo") => {
  const userMessage = messages.find((m) => m.role === "user")?.content || "";

  // Better extraction with regex improvements
  const subscriptionMatch = userMessage.match(
    /suggest ONE cheaper alternative to "([^"]+)"/i
  );
  const categoryMatch = userMessage.match(/category:\s*(\w+)/i);
  const priceMatch = userMessage.match(/\$(\d+(\.\d+)?)/);

  const subscriptionName = subscriptionMatch
    ? subscriptionMatch[1]
    : "Your Current Service";
  const category = categoryMatch ? categoryMatch[1].toLowerCase() : "general";
  const currentPrice = priceMatch ? parseFloat(priceMatch[1]) : 15.99;

  // Enhanced mock responses with more categories
  const mockResponses = {
    streaming: {
      alternative: {
        name: "Netflix Basic Plan",
        estimatedPrice: 9.99,
        savingsAmount: parseFloat((currentPrice - 9.99).toFixed(2)),
        savingsPercentage: Math.round(
          ((currentPrice - 9.99) / currentPrice) * 100
        ),
        description:
          "Consider downgrading to Netflix Basic for single-screen HD streaming at a lower cost.",
        pros: [
          "Save money each month",
          "Access to same content library",
          "HD quality streaming",
        ],
        cons: [
          "Only one screen at a time",
          "No 4K Ultra HD",
          "Limited to mobile devices for downloads",
        ],
        bestFor: "Individual users who watch alone",
        considerations: "Check if you actually use multiple profiles",
        website: "https://netflix.com",
        switchDifficulty: "Easy - Just change plan in account settings",
        estimatedAnnualSavings: parseFloat(
          ((currentPrice - 9.99) * 12).toFixed(2)
        ),
      },
    },
    "cloud storage": {
      alternative: {
        name: "Google One 100GB Plan",
        estimatedPrice: 1.99,
        savingsAmount: parseFloat((currentPrice - 1.99).toFixed(2)),
        savingsPercentage: Math.round(
          ((currentPrice - 1.99) / currentPrice) * 100
        ),
        description:
          "Google One offers affordable cloud storage with Google Photos and Drive integration.",
        pros: [
          "Google ecosystem integration",
          "Family sharing (up to 5 people)",
          "Reliable and secure",
        ],
        cons: [
          "Tied to Google ecosystem",
          "Less flexibility for advanced users",
        ],
        bestFor: "Users already using Google services (Gmail, Photos, Drive)",
        considerations:
          "Check your actual storage usage - you might need even less",
        website: "https://one.google.com",
        switchDifficulty: "Medium - Need to migrate files",
        estimatedAnnualSavings: parseFloat(
          ((currentPrice - 1.99) * 12).toFixed(2)
        ),
      },
    },
    music: {
      alternative: {
        name: "Spotify Individual Plan",
        estimatedPrice: 10.99,
        savingsAmount: parseFloat((currentPrice - 10.99).toFixed(2)),
        savingsPercentage: Math.round(
          ((currentPrice - 10.99) / currentPrice) * 100
        ),
        description:
          "Spotify offers one of the largest music libraries with excellent personalized recommendations.",
        pros: [
          "Over 100 million songs",
          "Weekly personalized playlists",
          "Podcasts included at no extra cost",
        ],
        cons: ["No lossless audio quality", "Cannot own music permanently"],
        bestFor: "Casual listeners and music discovery enthusiasts",
        considerations: "Student and family plans offer even better value",
        website: "https://spotify.com",
        switchDifficulty: "Easy - Just sign up and cancel old service",
        estimatedAnnualSavings: parseFloat(
          ((currentPrice - 10.99) * 12).toFixed(2)
        ),
      },
    },
    productivity: {
      alternative: {
        name: "Notion Personal Plan",
        estimatedPrice: 8.0,
        savingsAmount: parseFloat((currentPrice - 8.0).toFixed(2)),
        savingsPercentage: Math.round(
          ((currentPrice - 8.0) / currentPrice) * 100
        ),
        description:
          "Notion combines notes, tasks, wikis, and databases in one flexible workspace.",
        pros: [
          "All-in-one workspace",
          "Powerful database features",
          "Free for personal use available",
        ],
        cons: ["Steeper learning curve", "Mobile app can be slower"],
        bestFor: "Students, freelancers, and small teams",
        considerations: "Free plan might be sufficient for basic needs",
        website: "https://notion.so",
        switchDifficulty: "Hard - Need to migrate data",
        estimatedAnnualSavings: parseFloat(
          ((currentPrice - 8.0) * 12).toFixed(2)
        ),
      },
    },
    fitness: {
      alternative: {
        name: "YouTube Premium",
        estimatedPrice: 13.99,
        savingsAmount: parseFloat((currentPrice - 13.99).toFixed(2)),
        savingsPercentage: Math.round(
          ((currentPrice - 13.99) / currentPrice) * 100
        ),
        description:
          "YouTube Premium includes ad-free videos, YouTube Music, and offline downloads.",
        pros: [
          "Ad-free YouTube",
          "YouTube Music included",
          "Download videos offline",
        ],
        cons: ["Music library not as extensive as dedicated services"],
        bestFor: "Heavy YouTube users who want ad-free experience",
        considerations: "Family plan offers great value for multiple users",
        website: "https://youtube.com/premium",
        switchDifficulty: "Easy - Simple subscription change",
        estimatedAnnualSavings: parseFloat(
          ((currentPrice - 13.99) * 12).toFixed(2)
        ),
      },
    },
  };

  // If category matches, return it; otherwise return general response
  if (mockResponses[category]) {
    return mockResponses[category];
  }

  return {
    alternative: {
      name: "Review and Downgrade Current Plan",
      estimatedPrice: parseFloat((currentPrice * 0.75).toFixed(2)),
      savingsAmount: parseFloat((currentPrice * 0.25).toFixed(2)),
      savingsPercentage: 25,
      description: `Consider if you're fully utilizing all features of ${subscriptionName}. Many users overpay for features they don't use.`,
      pros: [
        "No need to learn new service",
        "Keep existing data/history",
        "Simpler transition",
      ],
      cons: ["Might lose some premium features", "Still using same service"],
      bestFor:
        "Users satisfied with current service but looking to reduce costs",
      considerations:
        "Check your usage statistics from the past 3 months before deciding",
      website: null,
      switchDifficulty: "Very Easy - Just downgrade in account settings",
      estimatedAnnualSavings: parseFloat((currentPrice * 0.25 * 12).toFixed(2)),
      tip: "Many services offer annual plans at 15-20% discount",
    },
  };
};

export { openai, createAIChatCompletion };
