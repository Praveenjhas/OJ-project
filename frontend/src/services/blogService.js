import api from "./api";

export async function fetchPublicBlogs({ sort = "popular", limit = 20 } = {}) {
  const res = await api.get("/discussions/public", { params: { sort, limit } });
  return res.data;
}

export async function fetchBlogById(id) {
  const res = await api.get(`/discussions/${id}`);
  return res.data;
}

export async function fetchComments(blogId) {
  const res = await api.get(`/discussions/${blogId}/comments`);
  return res.data;
}

export async function postComment(blogId, body) {
  const res = await api.post(`/discussions/${blogId}/comments`, body);
  return res.data;
}

export async function voteOnBlog(blogId, payload) {
  const res = await api.post(`/discussions/${blogId}/vote`, payload);
  return res.data;
}
