import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { toIdPlugin } from "../config/mongoose.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.oauthProvider;
      },
      select: false,
    },

    profilePicture: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    bannerImage: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    bio: {
      type: String,
      default: "",
      maxLength: 160,
    },
    location: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    oauthId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    oauthProvider: {
      type: String,
      default: null,
    },
    roles: {
      type: [String],
      default: ["user"],
    },
    permission: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const saltRound = 10;
    this.password = await bcrypt.hash(this.password, saltRound);
    return next();
  } catch (error) {
    console.log("Failed to hash password:", error);
    return next(error);
  }
});

userSchema.plugin(toIdPlugin);

const User = mongoose.model("User", userSchema);

export default User;
