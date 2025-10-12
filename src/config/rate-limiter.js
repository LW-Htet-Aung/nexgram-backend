import rateLimit from "express-rate-limit";

export const limit = rateLimit({
  limit: 100,
  windowMs: 60 * 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Try again later.",
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  message: { error: "Too many authentication attempts. Try again later." },
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Try again later." },
});
