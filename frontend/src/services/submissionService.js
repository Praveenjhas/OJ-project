// src/services/submissionService.js
import axios from "axios";

const BASE_URL = "http://localhost:5000/api/submissions";
const submissionAPI = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request
submissionAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Submits a user's code for a specific problem.
 * @param {Object} data { problem, code, language, user }
 * @returns {Promise<Object>} - Submission result
 */
export const submitSolution = async (data) => {
  try {
    const res = await submissionAPI.post("/", data);
    return res.data;
  } catch (err) {
    throw new Error(
      err?.response?.data?.error || "Submission failed. Please try again."
    );
  }
};

/**
 * Fetches submissions for a specific problem by the logged-in user.
 * @param {string} problemId
 * @returns {Promise<Array>} - List of submissions
 */
export const fetchSubmissionsByProblem = async (problemId) => {
  const res = await submissionAPI.get("/", { params: { problemId } });
  return res.data.submissions;
};
