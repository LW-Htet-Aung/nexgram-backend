import asyncHandler from "express-async-handler";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import Comment from "../models/comment.model.js";
import cloudinary from "../config/cloudinary.js";

export const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture.url")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture.url",
      },
    });
  return res.status(200).json({ posts });
});

export const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId)
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture.url")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture.url",
      },
    });

  if (!post) return res.status(404).json({ error: "Post not found" });

  return res.status(200).json({ post });
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "User not found" });

  const posts = await Post.find({ user: user.id })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture.url")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture.url",
      },
    });
  return res.status(200).json({ posts });
});

export const createPost = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { content } = req.body;
  const imageFile = req.file;

  if (!content || !imageFile)
    return res.status(400).json({ error: "Content or Image is missing" });

  const user = await User.findById(id);

  if (!user) return res.status(404).json({ error: "User not found" });
  let imageUrl = "";
  if (imageFile) {
    try {
      const base64Image = `data:${
        req.file.mimetype
      };base64,${imageFile.buffer.toString("base64")}`;
      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "/nextgram/posts",
        resource_type: "image",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" },
          { format: "auto" },
        ],
      });
      imageUrl = uploadResponse;
    } catch (error) {
      return res.status(400).json({ error: "Error uploading image" });
    }
  }

  const post = await Post.create({
    content: content || "",
    user: id,
    image: {
      url: imageUrl.secure_url,
      fileId: imageUrl.public_id,
    },
  });

  return res.status(201).json({ post });
});

export const likePost = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { postId } = req.params;

  const user = await User.findById(id);

  const post = await Post.findById(postId);

  if (!user || !post)
    return res.status(404).json({ error: "User or Post not found" });

  const isLiked = post.likes.includes(id);
  if (isLiked) {
    // unlike
    await Post.findByIdAndUpdate(postId, {
      $pull: { likes: user.id },
    });
  } else {
    // like
    await Post.findByIdAndUpdate(postId, {
      $push: { likes: user.id },
    });
  }
  // create notification if  ot liking own post
  if (post.user.toString() !== user.id.toString()) {
    {
      await Notification.create({
        from: user.id,
        to: post.user,
        types: "like",
        post: postId,
      });
    }
  }

  return res.status(200).json({
    message: isLiked ? "Post unliked successfully" : "Post liked Successfully",
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { postId } = req.params;

  const user = await User.findById(id);
  const post = await Post.findById(postId);

  if (!user || !post)
    return res.status(404).json({ error: "User or Post not found" });

  if (post.user.toString() !== user.id.toString()) {
    return res
      .status(401)
      .json({ error: "You can only delete your own posts  " });
  }

  // delete all comments on this post
  await Comment.deleteMany({ post: postId });

  const imagesId = post.image.fileId;
  await cloudinary.uploader.destroy(imagesId);

  // delete post
  await Post.findByIdAndDelete(postId);

  return res.status(200).json({ message: "Post deleted successfully" });
});
