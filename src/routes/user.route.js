import express from "express";
import {
  followUser,
  getCurrentUser,
  getUserProfile,
  updateProfile,
} from "../controllers/user.controller.js";
import { jwtAuthMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();
// public
router.get("/profile/:username", getUserProfile);

// protected
router.put("/profile", jwtAuthMiddleware, updateProfile);
router.get("/me", jwtAuthMiddleware, getCurrentUser);
router.post("/follow/:targerUserId", jwtAuthMiddleware, followUser);

export default router;
