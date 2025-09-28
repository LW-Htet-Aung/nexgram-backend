import mongoose from "mongoose";
import { toIdPlugin } from "../config/mongoose.js";

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxLength: 200,
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);
commentSchema.plugin(toIdPlugin);
const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
