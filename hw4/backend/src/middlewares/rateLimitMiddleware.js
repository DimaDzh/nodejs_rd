import rateLimit from "express-rate-limit";

const postRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: "Too many requests, please try again later.",
});

export const rateLimitMiddleware = (req, res, next) => {
  if (req.method === "POST") {
    postRateLimiter(req, res, next);
  } else {
    next();
  }
};
