// backend/controller/openai.controller.js

import Subscription from "../models/subscription.model.js";
import AISuggestion from "../models/aiSuggestion.model.js";
import { createAIChatCompletion } from "../config/openai.js";
// export const getSubscriptionAlternative = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const {
//       subscriptionName,
//       category,
//       currentPrice,
//       frequency = "monthly",
//       subscriptionId,
//     } = req.body;

//     // Validation
//     if (!subscriptionName || !category || !currentPrice) {
//       return res.status(400).json({
//         success: false,
//         error:
//           "Missing required fields: subscriptionName, category, currentPrice",
//       });
//     }

//     const userSubscriptions = await Subscription.find({
//       userId,
//       category,
//     })
//       .select("name price")
//       .limit(5);

//     const userContext =
//       userSubscriptions.length > 0
//         ? `The user has other ${category} subscriptions: ${userSubscriptions
//             .map((s) => `${s.name} ($${s.price?.amount || 0})`)
//             .join(", ")}.`
//         : "";

//     const prompt = `
//       As a financial AI assistant, suggest ONE cheaper alternative to "${subscriptionName}" (category: ${category})
//       that currently costs $${currentPrice} per ${frequency}.

//       Important constraints:
//       1. Suggest only ONE alternative (choose the best one)
//       2. It must be a legitimate, reputable service
//       3. Price must be lower than $${currentPrice}
//       4. Focus on services available in 2024

//       ${userContext}

//       Format the response as a valid JSON object with this exact structure:
//       {
//         "alternative": {
//           "name": "Alternative service name",
//           "estimatedPrice": estimated_monthly_price_in_usd,
//           "savingsAmount": amount_saved_per_month,
//           "savingsPercentage": percentage_saved,
//           "description": "Brief 1-2 sentence description",
//           "pros": ["pro1", "pro2", "pro3"],
//           "cons": ["con1", "con2"],
//           "bestFor": "Type of users this is best for",
//           "considerations": "Important things to know before switching",
//           "website": "Official website URL (if known)"
//         }
//       }

//       Return ONLY the JSON object, no additional text or markdown.
//     `;

//     const completion = await createAIChatCompletion({
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are a financial advisor specialized in subscription management and cost optimization. Provide accurate, practical advice.",
//         },
//         { role: "user", content: prompt },
//       ],
//       temperature: 0.7,
//       max_completion_tokens: 400,
//     });

//     const aiResponse = completion.choices[0].message.content;

//     // Clean and parse response
//     const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, "").trim();
//     const result = JSON.parse(cleanedResponse);

//     if (!result.alternative || !result.alternative.name) {
//       return;
//     }

//     await AISuggestion.create({
//       userId,
//       subscriptionId,
//       originalSubscription: subscriptionName,
//       originalPrice: currentPrice,
//       category,
//       suggestedAlternative: result.alternative.name,
//       suggestedPrice: result.alternative.estimatedPrice,
//       savings: result.alternative.savingsAmount,
//       aiResponse: result,
//       timestamp: new Date(),
//     });

//     res.status(200).json({
//       success: true,
//       data: result.alternative,
//       meta: {
//         originalSubscription: subscriptionName,
//         originalPrice: currentPrice,
//         timestamp: new Date().toISOString(),
//       },
//     });
//   } catch (error) {
//     console.error("OpenAI subscription alternative error:", error);

//     // Fallback suggestions based on category
//     const fallback = getFallbackSuggestion(req.body);

//     res.status(200).json({
//       success: true,
//       data: fallback,
//       isFallback: true,
//       error: error.message,
//     });
//   }
// };

// const getFallbackSuggestion = ({
//   subscriptionName,
//   category,
//   currentPrice,
// }) => {
//   const fallbacks = {
//     streaming: {
//       name: "Consider bundling services",
//       estimatedPrice: currentPrice * 0.7,
//       savingsAmount: currentPrice * 0.3,
//       savingsPercentage: 30,
//       description:
//         "Look for bundle deals from providers like Verizon, T-Mobile, or Amazon Prime that include streaming services.",
//       pros: ["Cost saving", "Single bill", "Often includes other benefits"],
//       cons: ["May require switching carriers", "Limited selection"],
//       bestFor: "Users open to changing other services",
//       considerations: "Check for long-term contracts",
//       website: null,
//     },
//     "cloud storage": {
//       name: "Google One or iCloud+",
//       estimatedPrice: currentPrice * 0.5,
//       savingsAmount: currentPrice * 0.5,
//       savingsPercentage: 50,
//       description:
//         "Most people overpay for cloud storage. Google One or iCloud+ often provide enough storage at lower prices.",
//       pros: [
//         "Integration with ecosystem",
//         "Family sharing options",
//         "Reliable",
//       ],
//       cons: ["Ecosystem lock-in", "Limited flexibility"],
//       bestFor: "Users already in Google or Apple ecosystems",
//       considerations: "Check your actual storage needs",
//       website: "https://one.google.com",
//     },
//   };

//   return (
//     fallbacks[category] || {
//       name: "Review subscription usage",
//       estimatedPrice: currentPrice * 0.8,
//       savingsAmount: currentPrice * 0.2,
//       savingsPercentage: 20,
//       description:
//         "Consider if you're fully utilizing this service. Many subscriptions go underused.",
//       pros: ["Potential to downgrade plan", "No service switching required"],
//       cons: ["May lose features"],
//       bestFor: "Users who may not need premium features",
//       considerations: "Check usage statistics before deciding",
//       website: null,
//     }
//   );
// };
// backend/controller/openai.controller.js
export const getSubscriptionAlternative = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      subscriptionName,
      category,
      currentPrice,
      frequency = "monthly",
      subscriptionId,
    } = req.body;
    console.log(subscriptionName, category, currentPrice);
    // Validation
    if (!subscriptionName || !category || !currentPrice) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: subscriptionName, category, currentPrice",
      });
    }

    console.log(
      `🤖 AI requested for: ${subscriptionName} (${category}), $${currentPrice}`
    );

    const userSubscriptions = await Subscription.find({
      userId,
      category,
    })
      .select("name price")
      .limit(5);

    const userContext =
      userSubscriptions.length > 0
        ? `The user has other ${category} subscriptions: ${userSubscriptions
            .map((s) => `${s.name} ($${s.price?.amount || 0})`)
            .join(", ")}.`
        : "";

    const prompt = `
      As a financial AI assistant, suggest ONE cheaper alternative to "${subscriptionName}" (category: ${category}) 
      that currently costs $${currentPrice} per ${frequency}. 
      
      Important constraints:
      1. Suggest only ONE alternative (choose the best one)
      2. It must be a legitimate, reputable service
      3. Price must be lower than $${currentPrice}
      4. Focus on services available in 2024
      
      ${userContext}
      
      Format the response as a valid JSON object with this exact structure:
      {
        "alternative": {
          "name": "Alternative service name",
          "estimatedPrice": estimated_monthly_price_in_usd,
          "savingsAmount": amount_saved_per_month,
          "savingsPercentage": percentage_saved,
          "description": "Brief 1-2 sentence description",
          "pros": ["pro1", "pro2", "pro3"],
          "cons": ["con1", "con2"],
          "bestFor": "Type of users this is best for",
          "considerations": "Important things to know before switching",
          "website": "Official website URL (if known)"
        }
      }
      
      Return ONLY the JSON object, no additional text or markdown.
    `;

    // Try to get AI completion
    let aiResponse;
    let isMock = false;

    try {
      const completion = await createAIChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a financial advisor specialized in subscription management and cost optimization. Provide accurate, practical advice.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      aiResponse = completion.choices[0].message.content;
      console.log("✅ Got AI response");

      // Check if it's mock data
      isMock = completion.mock === true;
    } catch (aiError) {
      console.warn("⚠️ AI service failed, using fallback:", aiError.message);
      // Pass individual parameters to fallback function
      aiResponse = JSON.stringify({
        alternative: getFallbackSuggestion({
          subscriptionName,
          category,
          currentPrice,
        }),
      });
      isMock = true;
    }

    // Parse the response with better error handling
    let result;
    try {
      // Clean the response
      let cleanedResponse = aiResponse;

      // Remove markdown code blocks
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, "");
      cleanedResponse = cleanedResponse.replace(/```\s*/g, "");
      cleanedResponse = cleanedResponse.trim();

      console.log(
        "🔍 Cleaned response:",
        cleanedResponse.substring(0, 200) + "..."
      );

      // Find JSON object in response (in case there's extra text)
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }

      // Parse JSON
      result = JSON.parse(cleanedResponse);

      // Validate structure
      if (!result.alternative || !result.alternative.name) {
        throw new Error("Invalid response structure from AI");
      }
    } catch (parseError) {
      console.error("❌ Failed to parse AI response:", parseError.message);
      console.log(
        "Raw response that failed:",
        aiResponse?.substring?.(0, 200) || aiResponse
      );

      result = {
        alternative: getFallbackSuggestion({
          subscriptionName,
          category,
          currentPrice,
        }),
      };
      isMock = true;
    }

    // Save to database (optional - only if parsing succeeded)
    try {
      if (result.alternative && result.alternative.name) {
        await AISuggestion.create({
          userId,
          subscriptionId,
          originalSubscription: subscriptionName,
          originalPrice: currentPrice,
          category,
          suggestedAlternative: result.alternative.name,
          suggestedPrice: result.alternative.estimatedPrice,
          savings: result.alternative.savingsAmount,
          aiResponse: result,
          isMock: isMock,
          timestamp: new Date(),
        });
        console.log("💾 Saved AI suggestion to database");
      }
    } catch (dbError) {
      console.warn("⚠️ Could not save AI suggestion:", dbError.message);
      // Don't fail the request if DB save fails
    }

    // Return successful response
    res.status(200).json({
      success: true,
      data: result.alternative,
      meta: {
        originalSubscription: subscriptionName, // ✅ Using subscriptionName here
        originalPrice: currentPrice,
        timestamp: new Date().toISOString(),
        isMock: isMock,
        note: isMock
          ? "Using fallback data (AI services unavailable)"
          : "AI-generated suggestion",
      },
    });
  } catch (error) {
    console.error("❌ Error in getSubscriptionAlternative:", error);

    // Emergency fallback - pass subscriptionName from req.body
    const emergencyFallback = getFallbackSuggestion({
      subscriptionName: req.body.subscriptionName || "Your Subscription", // ✅ Get from req.body
      category: req.body.category || "general",
      currentPrice: req.body.currentPrice || 15.99,
    });

    res.status(200).json({
      success: true,
      data: emergencyFallback,
      isFallback: true,
      isEmergency: true,
      error: error.message,
      note: "Using emergency fallback due to system error",
    });
  }
};

const getFallbackSuggestion = ({
  subscriptionName = "Your Subscription", // ✅ Default value
  category = "general",
  currentPrice = 15.99,
}) => {
  // Ensure we have valid numbers and strings
  const name = String(subscriptionName || "Your Subscription");
  const cat = String(category || "general").toLowerCase();
  const price = parseFloat(currentPrice) || 15.99;

  const fallbacks = {
    streaming: {
      name: "Netflix Basic with Ads",
      estimatedPrice: 6.99,
      savingsAmount: parseFloat((price - 6.99).toFixed(2)),
      savingsPercentage: Math.round(((price - 6.99) / price) * 100),
      description: `Consider Netflix Basic as an alternative to ${name}.`,
      pros: ["Lowest price", "Same content", "HD quality"],
      cons: ["4-5 minutes of ads per hour", "No downloads"],
      bestFor: "Budget-conscious individual viewers",
      considerations: "Ads appear before and during content",
      website: "https://netflix.com",
    },
    entertainment: {
      name: "Disney+ Basic",
      estimatedPrice: 7.99,
      savingsAmount: parseFloat((price - 7.99).toFixed(2)),
      savingsPercentage: Math.round(((price - 7.99) / price) * 100),
      description: `Disney+ could be a cheaper alternative to ${name}.`,
      pros: ["Premium Disney content", "Family-friendly", "Bundle options"],
      cons: ["Ad-supported", "Limited content library"],
      bestFor: "Families and Disney fans",
      considerations: "Consider the Disney Bundle for more value",
      website: "https://disneyplus.com",
    },
    music: {
      name: "Spotify Individual",
      estimatedPrice: 10.99,
      savingsAmount: parseFloat((price - 10.99).toFixed(2)),
      savingsPercentage: Math.round(((price - 10.99) / price) * 100),
      description: `Spotify might be a better value alternative to ${name}.`,
      pros: [
        "Large music library",
        "Great recommendations",
        "Podcasts included",
      ],
      cons: ["No lossless audio", "Limited downloads"],
      bestFor: "Casual music listeners",
      considerations: "Student and family plans offer better value",
      website: "https://spotify.com",
    },
    "cloud storage": {
      name: "Google One 100GB",
      estimatedPrice: 1.99,
      savingsAmount: parseFloat((price - 1.99).toFixed(2)),
      savingsPercentage: Math.round(((price - 1.99) / price) * 100),
      description: `Google One offers affordable storage compared to ${name}.`,
      pros: ["Google integration", "Family sharing", "Reliable"],
      cons: ["Google ecosystem lock-in", "Limited flexibility"],
      bestFor: "Google ecosystem users",
      considerations: "Check your actual storage usage first",
      website: "https://one.google.com",
    },
    software: {
      name: "Open Source Alternative",
      estimatedPrice: 0,
      savingsAmount: price,
      savingsPercentage: 100,
      description: `Consider free alternatives to ${name}.`,
      pros: ["Completely free", "Community support", "No subscriptions"],
      cons: ["May have fewer features", "Learning curve", "Less polish"],
      bestFor: "Tech-savvy users on a budget",
      considerations: "Research alternatives for your specific needs",
      website: null,
    },
  };

  const selected = fallbacks[cat];

  if (selected) {
    return selected;
  }

  // Generic fallback that uses subscriptionName
  return {
    name: "Review Your Current Plan",
    estimatedPrice: parseFloat((price * 0.75).toFixed(2)),
    savingsAmount: parseFloat((price * 0.25).toFixed(2)),
    savingsPercentage: 25,
    description: `Consider if you're fully utilizing ${name}. Many users overpay for unused features.`,
    pros: ["No switching required", "Keep familiar interface", "Maintain data"],
    cons: ["Same provider", "Might still be overpaying"],
    bestFor: "Users satisfied with current service",
    considerations: "Check your usage statistics from the last 3 months",
    website: null,
  };
};
