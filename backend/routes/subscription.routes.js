// export default subscriptionRouter;
// backend/routes/subscription.routes.js
import { Router } from "express";
import multer from "multer";
import authorize from "../middlewares/auth.middleware.js";
import {
  createSubscription,
  getAllSubscriptions,
  getUserSubscriptions,
  getSubscriptionById,
  getUpcomingRenewals,
  updateSubscription,
  cancelSubscription,
  deleteSubscription,
  extractSubscriptionFromImage,
} from "../controller/subscription.controller.js";
import cacheMiddleware from "../middlewares/cache.middleware.js";

const subscriptionRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Subscription management
 */

/**
 * @swagger
 * /api/subscriptions/extract-from-image:
 *   post:
 *     summary: Extract subscription details from receipt/screenshot image
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Extracted subscription data
 *       400:
 *         description: No image provided
 *       500:
 *         description: Extraction failed
 */
subscriptionRouter.post(
  "/extract-from-image",
  authorize,
  upload.single("image"),
  extractSubscriptionFromImage,
);

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Create a new subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - serviceName
 *               - category
 *               - price
 *               - billingDate
 *             properties:
 *               name:
 *                 type: string
 *               serviceName:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                   currency:
 *                     type: string
 *                   billingCycle:
 *                     type: string
 *               billingDate:
 *                 type: object
 *                 properties:
 *                   startDate:
 *                     type: string
 *                   nextBillingDate:
 *                     type: string
 *               paymentMethod:
 *                 type: string
 *               autoRenew:
 *                 type: boolean
 *               sendReminders:
 *                 type: boolean
 *               notes:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscription created successfully
 */
subscriptionRouter.post("/", authorize, createSubscription);

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get all subscriptions for user
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subscriptions
 */
subscriptionRouter.get(
  "/",
  authorize,
  cacheMiddleware(120),
  getAllSubscriptions,
);

/**
 * @swagger
 * /api/subscriptions/user:
 *   get:
 *     summary: Get user subscriptions (alias for getAllSubscriptions)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user subscriptions
 */
subscriptionRouter.get("/user", authorize, getUserSubscriptions);

/**
 * @swagger
 * /api/subscriptions/upcoming:
 *   get:
 *     summary: Get upcoming renewals (next 30 days)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of upcoming renewals
 */
subscriptionRouter.get("/upcoming", authorize, getUpcomingRenewals);

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   get:
 *     summary: Get subscription by ID
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription data
 */
subscriptionRouter.get(
  "/:id",
  authorize,
  cacheMiddleware(120),
  getSubscriptionById,
);

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   put:
 *     summary: Update subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               serviceName:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: object
 *               billingDate:
 *                 type: object
 *               paymentMethod:
 *                 type: string
 *               autoRenew:
 *                 type: boolean
 *               sendReminders:
 *                 type: boolean
 *               notes:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 */
subscriptionRouter.put("/:id", authorize, updateSubscription);

/**
 * @swagger
 * /api/subscriptions/{id}/cancel:
 *   patch:
 *     summary: Cancel subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 */
subscriptionRouter.patch("/:id/cancel", authorize, cancelSubscription);

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   delete:
 *     summary: Delete subscription permanently
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription deleted successfully
 */
subscriptionRouter.delete("/:id", authorize, deleteSubscription);

export default subscriptionRouter;
