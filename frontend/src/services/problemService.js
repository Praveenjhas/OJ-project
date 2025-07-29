import axios from "axios";

const BASE_URL = "http://localhost:5000/api/problems";
const problemAPI = axios.create({ baseURL: BASE_URL });

// Attach JWT token to requests (for solvedByUser)
problemAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Fetches all problems with optional filters.
 * @param {{ difficulty?: string, category?: string, userId?: string }} filters
 * @returns {Promise<Array>} Array of problem objects
 */
export const fetchProblems = async (filters = {}) => {
  try {
    console.log("➡️  fetchProblems filters:", filters);
    const res = await problemAPI.get("/", { params: filters });
    console.log("⬅️  fetchProblems got:", res.data.problems.length);
    return res.data.problems;
  } catch (err) {
    console.error("fetchProblems error:", err.response?.data || err);
    throw new Error(err?.response?.data?.message || "Failed to fetch problems");
  }
};

/**
 * Fetches a single problem by its ID.
 * @param {string} id
 * @returns {Promise<Object>} Problem detail object
 */
export const fetchProblemById = async (id) => {
  try {
    const res = await problemAPI.get(`/${id}`);
    return res.data.problem;
  } catch (err) {
    throw new Error(err?.response?.data?.message || "Failed to fetch problem");
  }
};
