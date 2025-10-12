import asyncHandler from "express-async-handler";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import mongoose from "mongoose";

export const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture.url");
  return res.status(200).json({ comments });
});

export const createComment = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { postId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === "")
    return res.status(400).json({ error: "Comment Content is required" });

  const user = await User.findById(id);

  const post = await Post.findById(postId);

  if (!user || !post)
    return res.status(404).json({ error: "User or Post not found" });

  const session = await mongoose.startSession();
  let comment;

  try {
    await session.withTransaction(async () => {
      // create comment
      comment = await Comment.create(
        { user: id, post: postId, content },
        {
          session,
        }
      );
      // link the comment to the post
      await Post.findByIdAndUpdate(
        postId,
        {
          $push: { comments: comment.id },
        },
        {
          session,
        }
      );
      // create notification
      if (post.user.toString() !== user.id.toString()) {
        await Notification.create(
          {
            from: user.id,
            to: post.user,
            type: "comment",
            comment: comment.id,
          },
          { session }
        );
      }
    });
    return res.status(201).json({ comment });
  } catch (e) {
    console.log("Comment Create Error", e);
    return res.status(500).json({ error: "Failed to create comment" });
  } finally {
    await session.endSession();
  }
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { commentId } = req.params;

  const user = await User.findById(id);
  const comment = await Comment.findById(commentId);

  if (!user || !comment)
    return res.status(404).json({ error: "User or Comment not found" });

  if (comment.user.toString() !== user.id.toString()) {
    return res
      .status(401)
      .json({ error: "You can only delete your own comments  " });
  }
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // remove comment from post
      await Post.findByIdAndUpdate(
        comment.post,
        {
          $pull: { comments: commentId },
        },
        { session }
      );

      // delete the comment
      await Comment.findByIdAndDelete(commentId, { session });
    });
    return res.status(200).json({ message: "Comment deleted successfully" });
  } catch (e) {
    return res.status(500).json({ error: "Failed to delete comment" });
  } finally {
    await session.endSession();
  }
});
