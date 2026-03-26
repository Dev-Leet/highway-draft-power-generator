const validateHardwareKey = (req, res, next) => {
  const key = req.headers["x-api-key"];
  if (!key || key !== process.env.HARDWARE_API_KEY) {
    return res.status(401).json({ message: "Unauthorized hardware request" });
  }
  next();
};

module.exports = validateHardwareKey;