import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const handleError = (res, status, message) => {
  return res.status(status).json({ success: false, message });
};

export const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password)
      return handleError(res, 400, "Username and password are required");

    const existingUser = await User.findOne({ username });
    if (existingUser) return handleError(res, 409, "Username already taken");

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hash,
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    return handleError(res, 500, "Something went wrong during registration");
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return handleError(res, 400, "Username and password are required");

    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return handleError(res, 401, "Invalid username or password");

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return handleError(res, 500, "Something went wrong during login");
  }
};
