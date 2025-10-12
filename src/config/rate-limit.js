export const rateLimit = (limit = 100, windowMs = 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const timestamp = Date.now();

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }
    const timestamps = requests.get(ip);

    // remove old timestamp outside of the window
    while (timestamps.length && timestamps[0] <= timestamp - windowMs) {
      timestamps.shift();
    }

    if (timestamps.length >= limit) {
      return res.status(429).json({
        error: "Too many requests. Please try again later.",
      });
    }
    timestamps.push(timestamp);
    requests.set(ip, timestamps);
    next();
  };
};
