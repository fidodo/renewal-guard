import { Router } from "express";
import authorize from "../middlewares/auth.middleware.js";
import {
  getSetting,
  updateSetting,
  getSettingByUserId,
} from "../controller/setting.controller.js";

const settingRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Settings management
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get all settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of settings
 */
settingRouter.get("/", authorize, getSetting);

/**
 * @swagger
 * /api/settings/{userId}:
 *   get:
 *     summary: Get settings by user ID
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Settings for the user
 *       404:
 *         description: Settings not found
 */
settingRouter.get("/:userId", authorize, getSettingByUserId);

/**
 * @swagger
 * /api/settings/{userId}:
 *   put:
 *     summary: Update settings by user ID
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               emailNotifications:
 *                 type: boolean
 *               pushNotifications:
 *                 type: boolean
 *               smsReminders:
 *                 type: boolean
 *               reminderDays:
 *                 type: array
 *                 items:
 *                   type: number
 *               currency:
 *                 type: string
 *               dateFormat:
 *                 type: string
 *               dataSharing:
 *                 type: boolean
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       404:
 *         description: Settings not found
 */
settingRouter.put("/:userId", authorize, updateSetting);

export default settingRouter;
