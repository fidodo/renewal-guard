// backend/routes/openai.routes.js
import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import { getSubscriptionAlternative } from "../controller/openai.controller.js";

const openaiRouter = Router();

// Add this route to your existing OpenAI routes
/**
 * @swagger
 * /api/openai/subscription-alternative:
 *   post:
 *     summary: Get AI-powered cheaper alternatives for a subscription
 *     tags: [OpenAI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subscriptionName
 *               - category
 *               - currentPrice
 *             properties:
 *               subscriptionName:
 *                 type: string
 *               category:
 *                 type: string
 *               currentPrice:
 *                 type: number
 *               frequency:
 *                 type: string
 *                 enum: [monthly, yearly, quarterly, weekly]
 *               subscriptionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: AI alternative suggestion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     estimatedPrice:
 *                       type: number
 *                     savingsAmount:
 *                       type: number
 *                     savingsPercentage:
 *                       type: number
 *                     description:
 *                       type: string
 *                     pros:
 *                       type: array
 *                       items:
 *                         type: string
 *                     cons:
 *                       type: array
 *                       items:
 *                         type: string
 *                     bestFor:
 *                       type: string
 *                     considerations:
 *                       type: string
 *                     website:
 *                       type: string
 *                 meta:
 *                   type: object
 */
openaiRouter.post(
  "/subscription-alternative",
  authorize,
  getSubscriptionAlternative
);

export default openaiRouter;
