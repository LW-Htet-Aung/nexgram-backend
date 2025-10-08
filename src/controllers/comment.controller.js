import asyncHandler from "express-async-handler";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

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

  const comment = await Comment.create({ user: id, post: postId, content });

  // link the comment to the post
  await Post.findByIdAndUpdate(postId, {
    $push: { comments: comment.id },
  });

  // create notification
  if (post.user.id.toString() !== user.id.toString()) {
    await Notification.create({
      from: user.id,
      to: post.user,
      types: "comment",
      comment: comment.id,
    });
  }

  return res.status(201).json({ comment });
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
  // remove comment from post
  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: commentId },
  });

  // delete the comment
  await Comment.findByIdAndDelete(commentId);

  return res.status(200).json({ message: "Comment deleted successfully" });
});
