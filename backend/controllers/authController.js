const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

const getRefreshSecret = () =>
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, getRefreshSecret(), {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

// REGISTER
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateAccessToken(user._id);

    return res.status(201).json({ token });
  } catch (error) {
    return next(error);
  }
};

// LOGIN
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, getRefreshCookieOptions());

    return res.json({ token });
  } catch (error) {
    return next(error);
  }
};

// REFRESH ACCESS TOKEN
exports.refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, getRefreshSecret());
    } catch (error) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Refresh token not recognized" });
    }

    const token = generateAccessToken(user._id);
    return res.json({ token });
  } catch (error) {
    return next(error);
  }
};

// VERIFY TOKEN
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    return res.json({ valid: true, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    return next(error);
  }
};

// LOGOUT
exports.logoutUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await User.findOneAndUpdate(
        { refreshToken },
        { refreshToken: null },
        { new: false }
      );
    }

    res.clearCookie("refreshToken", getRefreshCookieOptions());
    return res.json({ message: "Logged out" });
  } catch (error) {
    return next(error);
  }
};
