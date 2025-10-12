import mongoose from "mongoose";
import { toIdPlugin } from "../config/mongoose.js";

const notificationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["like", "comment", "follow"],
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
      default: null,
    },
    comment: {
      type: mongoose.Schema.ObjectId,
      ref: "Comment",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
notificationSchema.plugin(toIdPlugin);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
