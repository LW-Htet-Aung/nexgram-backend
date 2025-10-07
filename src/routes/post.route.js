import express from "express";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  getUserPosts,
  likePost,
} from "../controllers/post.controller.js";
import { jwtAuthMiddleware } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

// public
router.get("/", getPosts);
router.get("/:postId", getPost);
router.get("/user/username", getUserPosts);

// private
router.post("/", jwtAuthMiddleware, upload.single("image"), createPost);
router.post("/:postId/like", jwtAuthMiddleware, likePost);
router.delete("/:postId", jwtAuthMiddleware, deletePost);

export default router;
