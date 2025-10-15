import express from "express";
import passport from "passport";
import {
  googleController,
  loginController,
  registerController,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleController
);

router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  loginController
);

router.post("/register", registerController);

export default router;
