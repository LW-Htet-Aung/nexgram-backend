import { ENV } from "../config/env.js";
import { signToken } from "../config/passport.js";
import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
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

export const googleMobileController = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) return res.status(400).json({ message: "Missing code" });
  try {
    const response = await fetch(ENV.GOOGLE_OAUTH_URL, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        code,
        client_id: ENV.GOOGLE_CLIENT_ID,
        client_secret: ENV.GOOGLE_CLIENT_SECRET,
        redirect_uri: "",
        grant_type: "authorization_code",
      }),
    });

    const data = await response.json();

    if (!data?.id_token)
      return res.status(400).json({ message: "Missing data token" });

    // const userInfoRes = await fetch(
    //   `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${data.id_token}`
    // );
    // const oauthUser = await userInfoRes.json();
    const oauthUser = jwt.decode(data.id_token);

    const user = await User.findOneAndUpdate(
      {
        email: oauthUser.email.toLowerCase(),
      },
      {
        $setOnInsert: {
          firstName: oauthUser?.given_name ?? "",
          lastName: oauthUser?.family_name ?? "",
          email: oauthUser?.email?.toLowerCase() ?? "",
          username: oauthUser?.name ?? "",
          oauthProvider: "google",
          oauthId: oauthUser?.sub,
          profilePicture: {
            fileId: null,
            url: oauthUser?.picture ?? "",
          },
          roles: ["user"],
        },
      },
      {
        new: true,
        upsert: true,
      }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = signToken(user);

    return res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    return res.status(500).json({ message: "Oauth Faield:" + error });
  }
});
