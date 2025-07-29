import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/authService";

export default function RegisterPage() {
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

    if (form.username.length < 3 || form.password.length < 4) {
      setError(
        "Username and password must be at least 3 and 4 characters respectively."
      );
      setLoading(false);
      return;
    }

    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">
            {error}
          </div>
        )}

        <label className="block mb-3">
          <span className="text-gray-700 text-sm">Username</span>
          <input
            name="username"
            required
            value={form.username}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2 text-sm"
            placeholder="Choose a username"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700 text-sm">Password</span>
          <input
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            className="mt-1 block w-full border rounded p-2 text-sm"
            placeholder="Create a password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white transition ${
            loading
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Registering..." : "Sign Up"}
        </button>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
