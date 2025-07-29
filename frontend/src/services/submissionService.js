// src/services/submissionService.js

import axios from "axios";

const BASE_URL = "http://localhost:5000/api/submissions";

const submissionAPI = axios.create({ baseURL: BASE_URL });

// Attach JWT token to every request
submissionAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Submits a user's code for a specific problem.
 * @param {Object} data - { problem, code, language, user }
 * @returns {Promise<Object>} - Submission result with verdict and test case results
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
 * @param {Object} query - { problemId: string }
 * @returns {Promise<Array>} - List of user's submissions for the problem
 */
export const fetchSubmissions = async (query = {}) => {
  // query should be { problemId: theId }
  const res = await submissionAPI.get("/", { params: query });
  return res.data.submissions;
};
