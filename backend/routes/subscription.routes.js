// import { Router } from "express";
// import authorize from "../middlewares/auth.middleware.js";
// import {
//   createSubscription,
//   getAllSubscriptions,
//   getSubscriptionById,
//   updateSubscription,
//   deleteSubscription,
//   cancelSubscription,
//   getUserSubscriptions,
//   getUpcomingRenewals,
// } from "../controller/subscription.controller.js";

// const subscriptionRouter = Router();

// /**
//  * @swagger
//  * tags:
//  *   name: Subscriptions
//  *   description: Subscription management and CRUD operations
//  */

// /**
//  * @swagger
//  * /subscriptions:
//  *   get:
//  *     summary: Get all subscriptions (Admin only)
//  *     tags: [Subscriptions]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: List of all subscriptions
//  *       401:
//  *         description: Unauthorized
//  */
// subscriptionRouter.get("/", authorize, getAllSubscriptions);

// /**
//  * @swagger
//  * /subscriptions/user:
//  *   get:
//  *     summary: Get all subscriptions for the authenticated user
//  *     tags: [Subscriptions]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: List of subscriptions for the user
//  *       401:
//  *         description: Unauthorized
//  */
// subscriptionRouter.get("/user", authorize, getUserSubscriptions);

// /**
//  * @swagger
//  * /subscriptions/upcoming-renewals:
//  *   get:
//  *     summary: Get upcoming subscription renewals for authenticated user
//  *     tags: [Subscriptions]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: List of upcoming renewals
//  *       401:
//  *         description: Unauthorized
//  */
// subscriptionRouter.get("/upcoming-renewals", authorize, getUpcomingRenewals);

// /**
//  * @swagger
//  * /subscriptions/{id}:
//  *   get:
//  *     summary: Get a subscription by ID
//  *     tags: [Subscriptions]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: Subscription ID
//  *     responses:
//  *       200:
//  *         description: Subscription details
//  *       404:
//  *         description: Subscription not found
//  */
// subscriptionRouter.get("/:id", authorize, getSubscriptionById);

// /**
//  * @swagger
//  * /subscriptions:
//  *   post:
//  *     summary: Create a new subscription
//  *     tags: [Subscriptions]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - name
//  *               - price
//  *               - startDate
//  *               - renewalDate
//  *               - billingCycle
//  *             properties:
//  *               name:
//  *                 type: string
//  *                 description: Subscription service name
//  *               category:
//  *                 type: string
//  *                 description: Subscription category
//  *               price:
//  *                 type: number
//  *                 description: Subscription price
//  *               currency:
//  *                 type: string
//  *                 default: "USD"
//  *               billingCycle:
//  *                 type: string
//  *                 enum: [daily, weekly, monthly, yearly]
//  *               startDate:
//  *                 type: string
//  *                 format: date
//  *               renewalDate:
//  *                 type: string
//  *                 format: date
//  *               autoRenew:
//  *                 type: boolean
//  *                 default: false
//  *               sendReminders:
//  *                 type: boolean
//  *                 default: true
//  *               paymentMethod:
//  *                 type: string
//  *               phone:
//  *                 type: string
//  *               notes:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: Subscription created successfully
//  *       400:
//  *         description: Invalid input data
//  *       401:
//  *         description: Unauthorized
//  */
// subscriptionRouter.post("/", authorize, createSubscription);

// /**
//  * @swagger
//  * /subscriptions/{id}:
//  *   put:
//  *     summary: Update a subscription
//  *     tags: [Subscriptions]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: Subscription ID
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               category:
//  *                 type: string
//  *               price:
//  *                 type: number
//  *               billingCycle:
//  *                 type: string
//  *                 enum: [daily, weekly, monthly, yearly]
//  *               startDate:
//  *                 type: string
//  *                 format: date
//  *               renewalDate:
//  *                 type: string
//  *                 format: date
//  *               autoRenew:
//  *                 type: boolean
//  *               sendReminders:
//  *                 type: boolean
//  *               paymentMethod:
//  *                 type: string
//  *               phone:
//  *                 type: string
//  *               notes:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Subscription updated
//  *       404:
//  *         description: Subscription not found
//  *       401:
//  *         description: Unauthorized
//  */
// subscriptionRouter.put("/:id", authorize, updateSubscription);

// /**
//  * @swagger
//  * /subscriptions/{id}/cancel:
//  *   patch:
//  *     summary: Cancel a subscription
//  *     tags: [Subscriptions]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: Subscription ID
//  *     responses:
//  *       200:
//  *         description: Subscription cancelled successfully
//  *       404:
//  *         description: Subscription not found
//  *       401:
//  *         description: Unauthorized
//  */
// subscriptionRouter.patch("/:id/cancel", authorize, cancelSubscription);

// /**
//  * @swagger
//  * /subscriptions/{id}:
//  *   delete:
//  *     summary: Delete a subscription permanently
//  *     tags: [Subscriptions]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: Subscription ID
//  *     responses:
//  *       200:
//  *         description: Subscription deleted permanently
//  *       404:
//  *         description: Subscription not found
//  *       401:
//  *         description: Unauthorized
//  */
// subscriptionRouter.delete("/:id", authorize, deleteSubscription);

// export default subscriptionRouter;
// backend/routes/subscription.routes.js
import { Router } from "express";
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
} from "../controller/subscription.controller.js";

const subscriptionRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Subscriptions
 *   description: Subscription management
 */

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
subscriptionRouter.get("/", authorize, getAllSubscriptions);

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
subscriptionRouter.get("/:id", authorize, getSubscriptionById);

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
