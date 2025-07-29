// src/services/authService.js
import axios from "axios";

const BASE_URL = "http://localhost:5000/api/auth";

const authAPI = axios.create({ baseURL: BASE_URL });

/**
 * Registers a new user with username and password.
 * @param {{ username: string, password: string, email?: string }} data
 * @returns {Promise<Object>} Registered user data
 */
export const registerUser = async (data) => {
  try {
    const response = await authAPI.post("/register", data);
    return response.data;
  } catch (err) {
    throw new Error(err?.response?.data?.message || "Registration failed");
  }
};

/**
 * Logs in a user and stores the JWT token in localStorage.
 * @param {{ username: string, password: string }} data
 * @returns {Promise<Object>} Logged-in user data with token
 */
export const loginUser = async (data) => {
  try {
    const response = await authAPI.post("/login", data);
    const { token, user } = response.data;

    if (token) {
      localStorage.setItem("token", token);
    }

    return { token, user };
  } catch (err) {
    throw new Error(err?.response?.data?.message || "Login failed");
  }
};

/**
 * Logs out the current user by clearing the stored token.
 */
export const logoutUser = () => {
  localStorage.removeItem("token");
};
