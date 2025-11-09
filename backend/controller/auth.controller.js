import mongoose from "mongoose";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import TokenBlacklist from "../models/tokenBlacklist.model.js";

// ==================== GOOGLE OAUTH ====================

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/v1/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Update tokens if they exist (for API access scenarios)
          user.googleAccessToken = accessToken;
          if (refreshToken) user.googleRefreshToken = refreshToken;
          await user.save();
          return done(null, user);
        }

        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          user.googleId = profile.id;
          user.googleAccessToken = accessToken;
          if (refreshToken) user.googleRefreshToken = refreshToken;
          await user.save();
          return done(null, user);
        }

        const newUser = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          googleAccessToken: accessToken,
          googleRefreshToken: refreshToken,
          isVerified: true,
          password: null,
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Routes
export const googleAuth = (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
};

export const googleAuthCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    {
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
    },
    async (err, user) => {
      try {
        if (err || !user) {
          return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=auth_failed`
          );
        }

        // Generate JWT tokens (same as your existing flow)
        const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET_KEY,
          { expiresIn: process.env.JWT_EXPIRATION_TIME }
        );

        const refreshToken = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_REFRESH_SECRET_KEY,
          { expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME }
        );

        // Redirect to frontend with tokens
        const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/success`);
        redirectUrl.searchParams.set("token", token);
        redirectUrl.searchParams.set("refreshToken", refreshToken);
        redirectUrl.searchParams.set(
          "user",
          JSON.stringify({
            id: user._id,
            name: user.name,
            email: user.email,
          })
        );

        res.redirect(redirectUrl.toString());
      } catch (error) {
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
      }
    }
  )(req, res, next);
};

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

export const refreshAuthToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided",
      });
    }

    const blacklisted = await TokenBlacklist.findOne({ token: refreshToken });
    if (blacklisted) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is invalid",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Refresh token expired, please login again",
          code: "REFRESH_TOKEN_EXPIRED",
        });
      }
      throw jwtError;
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newAccessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRATION_TIME }
    );

    const newRefreshToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET_KEY,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME }
    );

    const decodedOldRefresh = jwt.decode(refreshToken);
    await TokenBlacklist.create({
      token: refreshToken,
      expiresAt: new Date(decodedOldRefresh.exp * 1000),
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};
