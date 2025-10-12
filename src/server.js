import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import cors from "cors";
import "./config/passport.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import authRoutes from "./routes/auth.route.js";
import passport from "passport";
import { authLimiter, limit } from "./config/rate-limiter.js";
// import { rateLimit } from "./config/rate-limit.js";

const app = express();
const port = ENV.PORT;
// middleware
app.use(limit);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.get("/", async (req, res) => {
  res.end("Hello world");
});

app.use("/", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

// error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error", err.stack);
  res.status(500).json({ error: err.message || "Something went wrong" });
});

const startServer = async () => {
  try {
    await connectDB();
    if (ENV.NODE_ENV !== "production") {
      app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
      });
    }
  } catch (error) {
    console.log("Failed to start server:", error);
    process.exit(1);
  }
};
startServer();
export default app;
