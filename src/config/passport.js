// oauth (google)
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { ENV } from "./env.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, cb) => {
      try {
        console.log(email, password, "passport");
        const user = await User.findOne({
          email: email.toLowerCase(),
        }).select("+password");
        if (!user || !user.password)
          return cb(null, false, { message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return cb(null, false, { message: "Password is not correct" });
        }
        console.log(user, "user");
        return cb(null, user);
      } catch (error) {
        console.error("Error in LocalStrategy:", error);
        return cb(error, null);
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: ENV.JWT_SECRET,
    },
    async (payload, cb) => {
      try {
        const user = await User.findById(payload.sub);
        if (!user) return cb(null, false);
        return cb(null, user);
      } catch (error) {
        console.error("Error in JWTStrategy:", error);
        return cb(error, null);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      callbackURL: ENV.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const oauthId = profile.id;
        const email = profile.emails?.[0].value;
        const firstName = profile?.name?.givenName || "";
        const lastName = profile?.name?.familyName || "";

        let user = await User.findOne({ oauthProvider: "google", oauthId });
        if (!user && email) {
          user = await User.findOne({ email });
        }
        if (!user) {
          user = await User.create({
            firstName,
            lastName,
            email,

            username: email.split("@")[0],
            oauthProvider: "google",
            oauthId,
            profilePicture: profile?.photos?.[0].value,
            roles: ["user"],
          });
        } else if (!user.oauthId) {
          user.oauthId = oauthId;
          user.oauthProvider = "google";
          await user.save();
        }
        return cb(null, user);
      } catch (error) {
        console.error("Error in GoogleStrategy:", error);

        return cb(error, null);
      }
    }
  )
);

passport.serializeUser((user, cb) => cb(null, user.id));
passport.deserializeUser(async (id, cb) => {
  try {
    const user = await User.findById(id);
    return cb(null, user);
  } catch (error) {
    console.log("Failed Deserialize User:", error);
    return cb(error, null);
  }
});

export const signToken = (user) => {
  return jwt.sign({ sub: user.id, roles: user.roles }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });
};
