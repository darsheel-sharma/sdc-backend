import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import User from "../models/User.js";

const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hash = await bcrypt.hash(password, 12);

    const user = await User.create({ email, password: hash, name });

    const token = jwt.sign({ userId: user._id.toString() }, env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const userObject = user.toObject();
    const { password: _, ...userWithoutPassword } = userObject;

    res.status(201).json({
      message: "User created",
      success: true,
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already in use" });
    }

    console.error("Register Error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return res.json({ error: "Invalid Email" });
    }

    if (!user.password) {
      return res.json({ error: "Please login using google" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.json({ error: "Invalid Password" });
    }

    const token = jwt.sign({ userId: user._id.toString() }, env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(400).json({ error: "Invalid Google Token" });
    }

    const user = await User.findOneAndUpdate(
      { email: payload.email },
      {
        $set: { googleId: payload.sub, name: payload.name },
        $setOnInsert: { email: payload.email },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    const token = jwt.sign({ userId: user._id.toString() }, env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const { password, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ error: "Authentication failed" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { skills, bio, team } = req.body;

    const updateData = {};
    if (skills !== undefined) updateData.skills = skills;
    if (bio !== undefined) updateData.bio = bio;
    if (team !== undefined) updateData.team = team;

    const user = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
      runValidators: true,
    }).select("name email skills bio team");

    if (!user) {
      return res.json({ error: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    console.error("Update User Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
