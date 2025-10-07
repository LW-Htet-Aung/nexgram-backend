import { signToken } from "../config/passport.js";
import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";

export const registerController = async (req, res) => {
  const { firstName, lastName, username, email, password, confirmPassword } =
    req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  try {
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser = await User.create({
      firstName,
      lastName,
      username,
      email: email.toLowerCase(),
      password, // will hash in middleware (presave hook)
    });
    const token = signToken(newUser);
    return res.status(201).json({
      token,
      user: newUser,
      message: "User registered successfully",
    });
  } catch (error) {
    console.log("User registeration failed", error);
    return res.status(500).json({ message: "User registeration failed" });
  }
};

export const loginController = asyncHandler(async (req, res) => {
  const user = req.user;
  console.log(user, "user");
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  const token = signToken(user);

  res.json({ message: "Login successful", token, user });
});

export const googleController = asyncHandler((req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Oauth Faield" });
  const token = signToken(user);
  return res.status(200).json({ message: "Login successful", token, user });
});
