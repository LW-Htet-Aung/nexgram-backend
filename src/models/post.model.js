import mongoose, { mongo } from "mongoose";
import { toIdPlugin } from "../config/mongoose.js";

const postSchema = new mongoose.Schema(
  {
    user: {
      typeof: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxLength: 200,
    },
    image: {
      type: String,
      default: "",
    },
    likes: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: true,
  }
);
postSchema.plugin(toIdPlugin);
const Post = mongoose.model("Post", postSchema);
