import asyncHandler from "express-async-handler";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const user = await User.findById(id);

  if (!user) return res.status(404).json({ error: "User not found" });

  const notifications = await Notification.find({ user: req.user.id })
    .sort({
      createdAt: -1,
    })
    .populate("from", "username firstName lastName profilePicture.url")
    .populate("post", "content image.url")
    .populate("comment", "content");

  return res.status(200).json({ notifications });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { notificationId } = req.params;

  const user = await User.findById(id);

  if (!user) return res.status(404).json({ error: "User not found" });

  const notification = await Notification.findOneAndDelete({
    id: notificationId,
    to: user.id,
  });

  if (!notification)
    return res.status(404).json({ error: "Notification not found" });

  return res.status(200).json({ message: "Notification deleted successfully" });
});
