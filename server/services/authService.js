import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    authProvider: "local",
  });

  const token = generateToken(user._id);

  return {
    message: "User registered successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      authProvider: user.authProvider,
    },
    token,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.password) {
    throw new Error("This account uses Google sign-in");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user._id);

  return {
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      authProvider: user.authProvider,
    },
    token,
  };
};

export const authenticateWithGoogle = async (credential) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Google authentication is not configured");
  }

  if (!credential) {
    throw new Error("Google credential is required");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email || !payload.email_verified) {
    throw new Error("Google could not verify this email address");
  }

  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }],
  });

  if (user) {
    if (user.googleId && user.googleId !== payload.sub) {
      throw new Error("This email is linked to a different Google account");
    }

    user.googleId = payload.sub;
    user.profilePicture = payload.picture || user.profilePicture;
    await user.save();
  } else {
    user = await User.create({
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      authProvider: "google",
      googleId: payload.sub,
      profilePicture: payload.picture,
    });
  }

  return {
    message: "Google authentication successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      authProvider: user.authProvider,
      profilePicture: user.profilePicture,
    },
    token: generateToken(user._id),
  };
};
