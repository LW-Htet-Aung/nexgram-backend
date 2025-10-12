import express from "express";
import { jwtAuthMiddleware } from "../middleware/auth.middleware.js";
import {
  deleteNotification,
  getNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", jwtAuthMiddleware, getNotifications);
router.delete("/:notificationId", jwtAuthMiddleware, deleteNotification);

export default router;
