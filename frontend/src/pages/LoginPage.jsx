// src/pages/LoginPage.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // simple client‑side validation
    if (!form.username || form.password.length < 4) {
      setError("Username and password must be valid.");
      setLoading(false);
      return;
    }

    try {
      // loginUser should return { token, user }
      const { token, user } = await loginUser(form);

      // Persist auth data
      localStorage.setItem("token", token);
      localStorage.setItem("username", user.username);
      localStorage.setItem("userId", user.id);

      // Redirect home
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">
            {error}
          </div>
        )}

        <label className="block mb-3">
          <span className="text-gray-700 text-sm">Username</span>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded p-2 text-sm"
            placeholder="Enter your username"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700 text-sm">Password</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            className="mt-1 block w-full border rounded p-2 text-sm"
            placeholder="Enter your password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-center text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
