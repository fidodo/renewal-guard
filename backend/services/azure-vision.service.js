// services/azure-vision.service.js - REST API version (Most Reliable)

/**
 * Extracts text from an image using Azure AI Vision OCR via REST API
 * @param {Buffer} imageBuffer - The image buffer to analyze
 * @returns {Promise<string>} - Extracted text from the image
 */
export const extractTextFromImage = async (imageBuffer) => {
  const endpoint = process.env.AZURE_VISION_ENDPOINT;
  const key = process.env.AZURE_VISION_KEY;

  if (!endpoint || !key) {
    console.warn("⚠️ Azure Vision credentials not configured, using mock mode");
    return getMockExtractedText();
  }

  // Remove trailing slash if present
  const baseEndpoint = endpoint.replace(/\/$/, "");
  const visionUrl = `${baseEndpoint}/vision/v3.2/ocr`;

  console.log("🔐 Calling Azure Vision REST API...");
  console.log(`📡 URL: ${visionUrl}`);
  console.log(`🔑 Key: ${key ? "****" : "Not Set"}`);

  try {
    // Send as binary (most reliable for local images)
    const response = await fetch(visionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Ocp-Apim-Subscription-Key": key,
      },
      body: imageBuffer, // Send raw buffer
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(
        `Azure Vision API error: ${response.status} - ${errorText}`,
      );
    }

    const result = await response.json();
    console.log("✅ Azure Vision API call successful");

    // Extract text from response
    const extractedText = extractTextFromOCRResponse(result);
    console.log(`📝 Extracted ${extractedText.length} characters from image`);
    console.log("📝 First 200 chars:", extractedText.substring(0, 200));

    return extractedText;
  } catch (error) {
    console.error("❌ Azure Vision API error:", error.message);
    console.log("⚠️ Falling back to mock mode");
    return getMockExtractedText();
  }
};

/**
 * Parse OCR response to extract text
 */
const extractTextFromOCRResponse = (ocrResult) => {
  const textLines = [];

  if (ocrResult.regions) {
    for (const region of ocrResult.regions) {
      for (const line of region.lines) {
        const lineText = line.words.map((word) => word.text).join(" ");
        textLines.push(lineText);
      }
    }
  }

  // If no regions found, try to get text from analysisResult
  if (textLines.length === 0 && ocrResult.analyzeResult) {
    if (ocrResult.analyzeResult.readResults) {
      for (const readResult of ocrResult.analyzeResult.readResults) {
        for (const line of readResult.lines) {
          textLines.push(line.text);
        }
      }
    }
  }

  return textLines.join("\n");
};

/**
 * Mock extracted text for when Azure isn't configured
 */
const getMockExtractedText = () => {
  const mockDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return `
    Netflix Premium
    Monthly Subscription
    Amount: $15.99
    Next Billing Date: ${mockDate.toLocaleDateString()}
    Auto-renew: Enabled
    Thank you for your purchase!
  `;
};
