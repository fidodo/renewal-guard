// controllers/search.controller.js
import Subscription from "../models/subscription.model.js";
import Service from "../models/service.model.js";
import SearchHistory from "../models/searchHistory.model.js";
import mongoose from "mongoose";

// Global search across subscriptions and services
export const globalSearch = async (req, res) => {
  try {
    const { query, type = "all", filters = {} } = req.body;
    const userId = req.user._id;
    console.log("🔍 Global search request:", { query, type, filters, userId });

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchQuery = query.trim();
    let subscriptionResults = [];
    let serviceResults = [];

    // Search subscriptions if type is 'all' or 'subscription'
    if (type === "all" || type === "subscription") {
      console.log("📋 Searching subscriptions...");
      subscriptionResults = await searchSubscriptionsData(
        userId,
        searchQuery,
        filters
      );
      console.log(`📋 Found ${subscriptionResults.length} subscriptions`);
    }

    // Search services if type is 'all' or 'service'
    if (type === "all" || type === "service") {
      console.log("🛒 Searching services...");
      serviceResults = await searchServicesData(searchQuery, filters);
      console.log(`🛒 Found ${serviceResults.length} services`);
    }

    // Combine and format results
    const combinedResults = [
      ...subscriptionResults.map((result) => ({
        ...result,
        id: result._id,
        type: "subscription",
      })),
      ...serviceResults.map((result) => ({
        ...result,
        id: result._id,
        type: "service",
      })),
    ].sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

    console.log(`🎯 Total results: ${combinedResults.length}`);

    // Save search history
    if (searchQuery) {
      await SearchHistory.create({
        userId,
        query: searchQuery,
        filters,
        resultsCount: combinedResults.length,
        resultIds: combinedResults.slice(0, 5).map((r) => r.id),
        searchType: Object.keys(filters).length > 0 ? "advanced" : "quick",
      });
    }

    res.json({
      success: true,
      data: combinedResults,
      meta: {
        total: combinedResults.length,
        subscriptions: subscriptionResults.length,
        services: serviceResults.length,
        query: searchQuery,
      },
    });
  } catch (error) {
    console.error("Global search error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Search only subscriptions
export const searchSubscriptions = async (req, res) => {
  try {
    const { query, filters = {} } = req.body;
    const userId = req.user._id;

    console.log("📋 Subscription search request:", { query, filters, userId });

    const results = await searchSubscriptionsData(userId, query, filters);

    // Format results
    const formattedResults = results.map((result) => ({
      ...result,
      id: result._id,
      type: "subscription",
    }));

    res.json({
      success: true,
      data: formattedResults,
      meta: {
        total: formattedResults.length,
        query: query || "",
      },
    });
  } catch (error) {
    console.error("Subscription search error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Search only services
export const searchServices = async (req, res) => {
  try {
    const { query, filters = {} } = req.body;

    console.log("🛒 Service search request:", { query, filters });

    const results = await searchServicesData(query, filters);

    const formattedResults = results.map((result) => ({
      ...result,
      id: result._id,
      type: "service",
    }));

    res.json({
      success: true,
      data: formattedResults,
      meta: {
        total: formattedResults.length,
        query: query || "",
      },
    });
  } catch (error) {
    console.error("Service search error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get search suggestions
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q: query } = req.query;
    const userId = req.user.id;

    console.log("🔍 Search suggestions request:", { query, userId });

    if (!query || query.length < 2) {
      return res.json({
        success: true,
        suggestions: [],
      });
    }
    const searchRegex = new RegExp(query, "i");
    // Get suggestions from subscriptions
    const subscriptionSuggestions = await Subscription.find({
      userId,
      $or: [{ name: searchRegex }, { serviceName: searchRegex }],
    })
      .select("name serviceName")
      .limit(5)
      .lean();

    // Get suggestions from services
    const serviceSuggestions = await Service.find({
      name: { $regex: query, $options: "i" },
      isActive: true,
    })
      .select("name")
      .limit(5)
      .lean();

    // Get popular searches from history
    const popularSearches = await SearchHistory.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: "$query",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]);

    const suggestions = [
      ...subscriptionSuggestions.map((s) => s.name),
      ...subscriptionSuggestions.map((s) => s.serviceName),
      ...serviceSuggestions.map((s) => s.name),
      ...popularSearches.map((s) => s._id),
    ]
      .filter(
        (value, index, self) =>
          value &&
          value.toLowerCase().includes(query.toLowerCase()) &&
          self.indexOf(value) === index
      )
      .slice(0, 8);

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("Suggestions error:", error);
    res.json({
      success: true,
      suggestions: [],
    });
  }
};

// Get popular services
export const getPopularServices = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularServices = await Service.getPopularServices(parseInt(limit));

    res.json({
      success: true,
      data: popularServices,
    });
  } catch (error) {
    console.error("💥 Get popular services error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get expiring subscriptions
export const getExpiringSubscriptions = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const userId = req.user.id;

    const expiringSubscriptions = await Subscription.getExpiringSubscriptions(
      userId,
      parseInt(days)
    );

    res.json({
      success: true,
      data: expiringSubscriptions,
      meta: {
        days: parseInt(days),
        total: expiringSubscriptions.length,
      },
    });
  } catch (error) {
    console.error("💥 Get expiring subscriptions error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get search history
export const getSearchHistory = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user.id;

    const history = await SearchHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select("query filters resultsCount createdAt")
      .lean();

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Get search history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Clear search history
export const clearSearchHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    await SearchHistory.deleteMany({ userId });

    res.json({
      success: true,
      message: "Search history cleared successfully",
    });
  } catch (error) {
    console.error("Clear search history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Helper function to search subscriptions
export const searchSubscriptionsData = async (userId, query, filters) => {
  const { category, minPrice, maxPrice, status, billingCycle, expiringSoon } =
    filters;

  let matchStage = {
    // userId,
    $or: [{ status: "active" }, { status: "inactive" }],
  };

  // Text search
  if (query && query.trim()) {
    const searchRegex = new RegExp(query.trim(), "i");
    matchStage.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { serviceName: searchRegex },
      { category: searchRegex },
      { tags: searchRegex },
    ];
  }

  // Category filter
  if (category) {
    matchStage.category = category;
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    matchStage["price.amount"] = {};
    if (minPrice !== undefined)
      matchStage["price.amount"].$gte = parseFloat(minPrice);
    if (maxPrice !== undefined)
      matchStage["price.amount"].$lte = parseFloat(maxPrice);
  }

  // Status filter
  if (status) {
    matchStage.status = status;
  }

  // Billing cycle filter
  if (billingCycle) {
    matchStage["price.billingCycle"] = billingCycle;
  }

  // Expiring soon filter
  if (expiringSoon) {
    const soon = new Date();
    soon.setDate(soon.getDate() + 7);
    matchStage["billingDate.nextBillingDate"] = { $lte: soon };
    matchStage.status = "active";
  }

  const results = await Subscription.aggregate([
    { $match: matchStage },
    {
      $addFields: {
        relevance: {
          $add: [
            {
              $cond: [
                { $regexMatch: { input: "$name", regex: query, options: "i" } },
                0.6,
                0,
              ],
            },
            {
              $cond: [
                {
                  $regexMatch: {
                    input: "$serviceName",
                    regex: query,
                    options: "i",
                  },
                },
                0.3,
                0,
              ],
            },
            {
              $cond: [
                {
                  $regexMatch: {
                    input: "$description",
                    regex: query,
                    options: "i",
                  },
                },
                0.1,
                0,
              ],
            },
          ],
        },
      },
    },
    { $sort: { relevance: -1, "billingDate.nextBillingDate": 1 } },
    { $limit: 20 },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        serviceName: 1,
        category: 1,
        price: 1,
        status: 1,
        billingDate: 1,
        importance: 1,
        tags: 1,
        relevance: 1,
      },
    },
  ]);

  return results;
};

// Helper function to search services
const searchServicesData = async (query, filters) => {
  const { category, minPrice, maxPrice, billingCycle } = filters;

  let matchStage = { isActive: true };

  // Text search
  if (query && query.trim()) {
    const searchRegex = new RegExp(query.trim(), "i");
    matchStage.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { category: searchRegex },
      { tags: searchRegex },
    ];
  }

  // Category filter
  if (category) {
    matchStage.category = category;
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    matchStage["pricing.price"] = {
      $elemMatch: {},
    };
    if (minPrice !== undefined)
      matchStage["pricing.price"].$elemMatch.$gte = parseFloat(minPrice);
    if (maxPrice !== undefined)
      matchStage["pricing.price"].$elemMatch.$lte = parseFloat(maxPrice);
  }

  // Billing cycle filter
  if (billingCycle) {
    matchStage["pricing.billingCycle"] = billingCycle;
  }

  const results = await Service.aggregate([
    { $match: matchStage },
    {
      $addFields: {
        relevance: {
          $add: [
            {
              $cond: [
                { $regexMatch: { input: "$name", regex: query, options: "i" } },
                0.7,
                0,
              ],
            },
            {
              $cond: [
                {
                  $regexMatch: {
                    input: "$description",
                    regex: query,
                    options: "i",
                  },
                },
                0.3,
                0,
              ],
            },
            { $multiply: ["$popularity", 0.001] },
          ],
        },
      },
    },
    { $sort: { relevance: -1, popularity: -1 } },
    { $limit: 20 },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        category: 1,
        website: 1,
        logo: 1,
        tags: 1,
        pricing: 1,
        popularity: 1,
        relevance: 1,
      },
    },
  ]);

  return results;
};
