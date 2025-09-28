import { isSpoofedBot } from "@arcjet/inspect";
import express from "express";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import cors from "cors";
import "./config/passport.js";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import passport from "passport";

const app = express();
const port = ENV.PORT;

// middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.get("/", async (req, res) => {
  res.end(JSON.stringify({ message: "Hello World" }));
});

app.use("/api/users", userRoutes);
app.use("/auth", authRoutes);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
    });
  } catch (error) {
    console.log("Failed to start server:", error);
    process.exit(1);
  }
};
startServer();
