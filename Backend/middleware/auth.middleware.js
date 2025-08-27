const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const blacklistTokenModel = require("../models/blacklistToken.model");
const CaptainModel = require("../models/captain.model");
module.exports.authUser = async (req, res, next) => {
  try {
    // Safely check for token
    const authHeader = req.headers.authorization;
    const token = req.cookies.token || (authHeader && authHeader.split(" ")[1]);

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const isBlacklisted = await blacklistTokenModel.findOne({ token: token });
    if (isBlacklisted) {
      return res
        .status(401)
        .json({ message: "Token is blacklisted. Please login again." });
    }
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB
    const user = await userModel.findById(decoded._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    req.user = user; // ✅ Assign user properly
    return next();
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Unauthorized access. Invalid token." });
  }
};

module.exports.authCaptain = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const isBlacklisted = await blacklistTokenModel.findOne({ token: token });
  if (isBlacklisted) {
    return res
      .status(401)
      .json({ message: "Token is blacklisted. Please login again." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const captain = await CaptainModel.findById(decoded._id);
    req.captain = captain; // ✅ Assign captain properly
    return next();
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Unauthorized access. Invalid token." });
  }
};
