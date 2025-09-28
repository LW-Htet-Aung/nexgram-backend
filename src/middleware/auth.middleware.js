import passport from "passport";
import { signToken } from "../config/passport.js";

export const protectedRoute = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res
      .status(401)
      .json({ message: "Unauthorized you must be logged in" });
  }

  next();
};

export const localLoginMiddleware = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    const token = signToken(user);

    res.json({ message: "Login successful", token, user });
  })(req, res, next);
};

export const googleMiddleware = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: "OAuth failed", info });
    const token = signToken(user);

    return res.status(200).json({ message: "Login successful", token, user });
  })(req, res, next);
};

export const jwtAuthMiddleware = passport.authenticate("jwt", {
  session: false,
});
