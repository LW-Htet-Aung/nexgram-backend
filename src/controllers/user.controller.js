import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  console.log(req.params);
  const user = await User.findOne({ username });

  if (!user) return res.status(404).json({ error: "User not found" });

  return res.status(200).json({ user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { id } = req.user;

  const user = await User.findByIdAndUpdate(id, req.body, { new: true });

  if (!user) return res.status(404).json({ error: "User not found" });
  return res.status(200).json({ user });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.status(200).json({ user });
});

export const followUser = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { targetUserId } = req.params;

  if (id === targetUserId)
    return res.status(400).json({ error: "You cannot follow yourself" });

  const currentUser = await User.findById(id);
  const targetUser = await User.findById(targetUserId);

  if (!currentUser || !targetUser)
    return res.status(404).json({ error: "User not found" });

  const isFollowing = currentUser.following.includes(targetUserId);

  if (isFollowing) {
    // unfollow
    await User.findByIdAndUpdate(currentUser.id, {
      $pull: { following: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUser.id },
    });
  } else {
    // follow
    await User.findByIdAndUpdate(currentUser.id, {
      $push: { following: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $push: { followers: currentUser.id },
    });
  }
  await Notification.create({
    from: currentUser.id,
    to: targetUserId,
    type: "follow",
  });

  return res
    .status(200)
    .json({
      message: isFollowing
        ? "User unfollowed successfully"
        : "User followed succesfully",
    });
});
