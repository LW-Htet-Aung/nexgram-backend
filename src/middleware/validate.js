import { validationResult } from "express-validator";
export const ValidateMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = {};
    errors.array().map((err) => (error[err.message] = err.msg));
    return res.status(422).json({ error });
  }
  next();
};
