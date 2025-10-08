import express from "express";
import { jwtAuthMiddleware } from "../middleware/auth.middleware.js";
import {
  getComments,
  createComment,
  deleteComment,
} from "../controllers/comment.controller.js";
const router = express.Router();

// public route
router.get("/post/:postId", getComments);

// private route
router.post("/post/:postId", jwtAuthMiddleware, createComment);
router.delete(":commentId", jwtAuthMiddleware, deleteComment);

export default router;
