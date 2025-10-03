// backend/routes/search.routes.js
import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  globalSearch,
  searchSubscriptions,
  searchServices,
  getSearchSuggestions,
  getPopularServices,
  getSearchHistory,
  clearSearchHistory,
} from "../controller/search.controller.js";

const searchRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: Search operations for subscriptions and services
 */

/**
 * @swagger
 * /api/search/global:
 *   post:
 *     summary: Global search across subscriptions and services
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: "netflix"
 *               type:
 *                 type: string
 *                 enum: [all, subscription, service]
 *                 default: all
 *               filters:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                   minPrice:
 *                     type: number
 *                   maxPrice:
 *                     type: number
 *                   status:
 *                     type: string
 *                   billingCycle:
 *                     type: string
 *     responses:
 *       200:
 *         description: Search results
 */
searchRouter.post("/global", authorize, globalSearch);

/**
 * @swagger
 * /api/search/subscriptions:
 *   post:
 *     summary: Search user subscriptions
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 example: "premium"
 *               filters:
 *                 type: object
 *     responses:
 *       200:
 *         description: Subscription search results
 */
searchRouter.post("/subscriptions", authorize, searchSubscriptions);

/**
 * @swagger
 * /api/search/services:
 *   post:
 *     summary: Search service catalog
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 example: "streaming"
 *               filters:
 *                 type: object
 *     responses:
 *       200:
 *         description: Service search results
 */
searchRouter.post("/services", authorize, searchServices);

/**
 * @swagger
 * /api/search/suggestions:
 *   get:
 *     summary: Get search suggestions
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search suggestions
 */
searchRouter.get("/suggestions", authorize, getSearchSuggestions);

/**
 * @swagger
 * /api/search/services/popular:
 *   get:
 *     summary: Get popular services
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Number of popular services to return
 *     responses:
 *       200:
 *         description: Popular services list
 */
searchRouter.get("/services/popular", authorize, getPopularServices);

/**
 * @swagger
 * /api/search/history:
 *   get:
 *     summary: Get user search history
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Number of history items to return
 *     responses:
 *       200:
 *         description: Search history
 */
searchRouter.get("/history", authorize, getSearchHistory);

/**
 * @swagger
 * /api/search/history:
 *   delete:
 *     summary: Clear search history
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Search history cleared
 */
searchRouter.delete("/history", authorize, clearSearchHistory);

export default searchRouter;
