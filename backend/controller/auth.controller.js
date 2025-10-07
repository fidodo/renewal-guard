import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import TokenBlacklist from "../models/tokenBlacklist.model.js";

export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create(
      [
        {
          name,
          email,
          password: hashedPassword,
        },
      ],
      { session }
    );
    // Create JWT token
    const token = jwt.sign(
      { id: newUser[0]._id, email: newUser[0].email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRATION_TIME }
    );

    const refreshToken = jwt.sign(
      { id: newUser[0]._id, email: newUser[0].email },
      process.env.JWT_REFRESH_SECRET_KEY,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME } // e.g., "7d"
    );

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      success: true,
      token,
      refreshToken,
      message: "User created successfully",
      user: newUser[0],
      email: newUser[0].email,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRATION_TIME }
    );

    const refreshToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET_KEY,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME } // e.g., "7d"
    );

    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    const refreshToken = req.body.refreshToken; // or from cookies

    // Blacklist access token
    if (accessToken) {
      const decodedAccess = jwt.decode(accessToken);
      await TokenBlacklist.create({
        token: accessToken,
        expiresAt: new Date(decodedAccess.exp * 1000),
      });
    }

    // Blacklist refresh token
    if (refreshToken) {
      const decodedRefresh = jwt.decode(refreshToken);
      await TokenBlacklist.create({
        token: refreshToken,
        expiresAt: new Date(decodedRefresh.exp * 1000),
      });
    }

    res.status(200).json({
      success: true,
      message: "User signed out successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const userMe = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        isVerified: user.isVerified || false,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);

    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
    next(error);
  }
};
