// services/receipt-parser.service.js
import { extractTextFromImage } from "./azure-vision.service.js";

/**
 * Extract subscription information from a receipt/screenshot image
 * @param {Buffer} imageBuffer - The image buffer
 * @returns {Promise<Object>} - Structured subscription data
 */
export const extractSubscriptionFromReceipt = async (imageBuffer) => {
  // Step 1: Extract raw text using Azure Vision OCR
  console.log("🔍 Starting receipt extraction...");
  const extractedText = await extractTextFromImage(imageBuffer);
  console.log("📝 Raw extracted text length:", extractedText.length);
  console.log(
    "📝 Raw extracted text preview:",
    extractedText.substring(0, 500),
  );

  // Step 2: Parse the text to find subscription details
  const subscriptionData = parseReceiptText(extractedText);

  return subscriptionData;
};

/**
 * Parse receipt text to extract subscription information
 */
const parseReceiptText = (text) => {
  const result = {
    name: null,
    serviceName: null,
    amount: null,
    currency: "USD",
    billingCycle: "monthly",
    nextBillingDate: null,
    category: null,
    confidence: 0.85,
  };

  // Normalize text for better parsing
  const normalizedText = text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\n/g, " ");

  const originalText = text; // Keep original for case-sensitive matching

  console.log("🔎 Parsing text for subscription details...");

  // Common subscription services patterns (expanded)
  const servicePatterns = [
    {
      pattern: /netflix/i,
      name: "Netflix",
      category: "streaming",
      keywords: ["netflix", "streaming"],
    },
    {
      pattern: /spotify/i,
      name: "Spotify",
      category: "music",
      keywords: ["spotify", "music"],
    },
    {
      pattern: /amazon\s*prime/i,
      name: "Amazon Prime",
      category: "shopping",
      keywords: ["amazon", "prime"],
    },
    {
      pattern: /disney\+/i,
      name: "Disney+",
      category: "streaming",
      keywords: ["disney", "disney+"],
    },
    {
      pattern: /hulu/i,
      name: "Hulu",
      category: "streaming",
      keywords: ["hulu"],
    },
    {
      pattern: /hbo\s*max/i,
      name: "HBO Max",
      category: "streaming",
      keywords: ["hbo", "max"],
    },
    {
      pattern: /apple\s*music/i,
      name: "Apple Music",
      category: "music",
      keywords: ["apple", "music"],
    },
    {
      pattern: /youtube\s*premium/i,
      name: "YouTube Premium",
      category: "video",
      keywords: ["youtube", "premium"],
    },
    {
      pattern: /microsoft\s*365/i,
      name: "Microsoft 365",
      category: "software",
      keywords: ["microsoft", "office"],
    },
    {
      pattern: /adobe/i,
      name: "Adobe",
      category: "software",
      keywords: ["adobe", "creative", "cloud"],
    },
    {
      pattern: /dropbox/i,
      name: "Dropbox",
      category: "cloud",
      keywords: ["dropbox"],
    },
    {
      pattern: /google\s*(drive|one)/i,
      name: "Google One",
      category: "cloud",
      keywords: ["google", "drive", "one"],
    },
    {
      pattern: /icloud/i,
      name: "iCloud",
      category: "cloud",
      keywords: ["icloud", "apple"],
    },
    {
      pattern: /peacock/i,
      name: "Peacock",
      category: "streaming",
      keywords: ["peacock"],
    },
    {
      pattern: /paramount\+/i,
      name: "Paramount+",
      category: "streaming",
      keywords: ["paramount"],
    },
    {
      pattern: /apple\s*tv/i,
      name: "Apple TV+",
      category: "streaming",
      keywords: ["apple tv"],
    },
  ];

  // Detect service name
  for (const service of servicePatterns) {
    if (service.pattern.test(originalText)) {
      result.name = service.name;
      result.serviceName = service.name;
      result.category = service.category;
      console.log(`✅ Detected service: ${service.name} (${service.category})`);
      break;
    }
  }

  // If no service detected, try to extract from first meaningful line
  if (!result.name) {
    const lines = text.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      // Look for lines that look like service names (not containing date/price patterns)
      if (
        trimmed.length > 0 &&
        trimmed.length < 50 &&
        !trimmed.match(
          /date|price|total|amount|subtotal|tax|receipt|invoice|order|thank|please|visit|www|\d{1,2}\/\d{1,2}/i,
        ) &&
        trimmed.length > 3
      ) {
        result.name = trimmed.substring(0, 50);
        result.serviceName = result.name;
        result.category = "other";
        console.log(`📝 Using detected name: ${result.name}`);
        break;
      }
    }
  }

  // Fallback default
  if (!result.name) {
    result.name = "Subscription Service";
    result.serviceName = "Subscription Service";
    result.category = "other";
  }

  // Extract amount - multiple patterns for better detection
  const amountPatterns = [
    /[\$\€\£]\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2}))\s*(?:USD|EUR|GBP)/i,
    /total:\s*[\$\€\£]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2}))/i,
    /amount:\s*[\$\€\£]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2}))/i,
    /price:\s*[\$\€\£]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2}))/i,
    /subtotal:\s*[\$\€\£]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2}))/i,
    /(\d{1,2}\.\d{2})\s*per\s*(month|year)/i,
    /(\d{1,2}\.\d{2})\s*(?:USD|EUR|GBP)/i,
    /[\$\€\£](\d{1,2}\.\d{2})/,
  ];

  for (const pattern of amountPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Remove commas from number if present
      const amountStr = match[1].replace(/,/g, "");
      result.amount = parseFloat(amountStr);
      if (result.amount > 0 && result.amount < 10000) {
        // Reasonable amount check
        console.log(`💰 Detected amount: ${result.amount}`);
        break;
      }
    }
  }

  // If amount found, try to detect currency from the match
  if (result.amount) {
    if (text.match(/€/)) {
      result.currency = "EUR";
    } else if (text.match(/£/)) {
      result.currency = "GBP";
    }
  }

  // Extract billing cycle with more patterns
  const billingPatterns = [
    { pattern: /year|annual|annually|yr\.?|yearly/i, cycle: "yearly" },
    { pattern: /month|monthly|mo\.?/i, cycle: "monthly" },
    { pattern: /week|weekly|wk\.?/i, cycle: "weekly" },
    { pattern: /quarter|quarterly|qtr/i, cycle: "quarterly" },
  ];

  for (const bp of billingPatterns) {
    if (bp.pattern.test(text)) {
      result.billingCycle = bp.cycle;
      console.log(`📅 Detected billing cycle: ${bp.cycle}`);
      break;
    }
  }

  // Extract next billing date with more robust parsing
  const datePatterns = [
    /next billing date:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /next billing:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /renews on:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /billing date:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /next charge:\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
    /(\d{4}-\d{2}-\d{2})/,
    /([A-Za-z]+\s+\d{1,2},?\s+\d{4})/,
  ];

  let foundDate = null;
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      foundDate = match[1];
      break;
    }
  }

  if (foundDate) {
    const parsedDate = new Date(foundDate);
    if (!isNaN(parsedDate.getTime()) && parsedDate > new Date()) {
      result.nextBillingDate = parsedDate.toISOString();
      console.log(`📅 Detected next billing date: ${foundDate}`);
    }
  }

  // If no valid date found, calculate based on billing cycle
  if (!result.nextBillingDate) {
    const defaultDate = new Date();
    switch (result.billingCycle) {
      case "yearly":
        defaultDate.setFullYear(defaultDate.getFullYear() + 1);
        break;
      case "monthly":
        defaultDate.setMonth(defaultDate.getMonth() + 1);
        break;
      case "weekly":
        defaultDate.setDate(defaultDate.getDate() + 7);
        break;
      default:
        defaultDate.setDate(defaultDate.getDate() + 30);
    }
    result.nextBillingDate = defaultDate.toISOString();
    console.log(
      `📅 Using calculated next billing date: ${defaultDate.toLocaleDateString()}`,
    );
  }

  // Determine confidence level based on what we found
  let confidence = 0.5;
  if (result.name && result.name !== "Subscription Service") confidence += 0.2;
  if (result.amount && result.amount > 0) confidence += 0.2;
  if (result.billingCycle && result.billingCycle !== "monthly")
    confidence += 0.05;
  if (foundDate) confidence += 0.05;
  result.confidence = Math.min(0.95, confidence);

  console.log("✅ Final parsed subscription data:", {
    name: result.name,
    amount: result.amount,
    currency: result.currency,
    billingCycle: result.billingCycle,
    category: result.category,
    confidence: result.confidence,
  });

  return result;
};
