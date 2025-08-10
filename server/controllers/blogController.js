import { Types } from 'mongoose';
import Blog from '../models/Blog.js';
import BlogBody from '../models/BlogBody.js';
import Vote from '../models/Vote.js';
import Comment from "../models/Comment.js";
const O = Types.ObjectId;
const isId = (s) => Types.ObjectId.isValid(String(s));

export const getPublicBlogs = async (req, res) => {
  const sort = req.query.sort === 'new' ? { createdAt: -1 } : { likesCount: -1, createdAt: -1 };
  const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);
  const blogs = await Blog.find({ deletedAt: null })
    .sort(sort)
    .limit(limit)
    .select('title authorId likesCount dislikesCount createdAt');
  res.json(blogs);
};

export const getBlogById = async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  const blog = await Blog.findOne({ _id: req.params.id, deletedAt: null });
  if (!blog) return res.status(404).json({ error: 'Not found' });
  const body = await BlogBody.findOne({ blogId: blog._id }).select('content');
  res.json({ ...blog.toObject(), content: body?.content || '' });
};

export const createBlog = async (req, res) => {
  const { title, content } = req.body || {};
  if (!title || !content) return res.status(400).json({ error: 'title and content required' });
  const blog = await Blog.create({ authorId: new O(req.user), title: String(title) });
  await BlogBody.create({ blogId: blog._id, content: String(content) });
  res.status(201).json({ id: blog._id });
};

export const deleteBlog = async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  const blog = await Blog.findOne({ _id: req.params.id, authorId: new O(req.user), deletedAt: null });
  if (!blog) return res.status(404).json({ error: 'Not found or not your blog' });
  blog.deletedAt = new Date();
  await blog.save();
  res.json({ ok: true });
};

export const getMyBlogs = async (req, res) => {
  const blogs = await Blog.find({ authorId: new O(req.user), deletedAt: null })
    .sort({ createdAt: -1 })
    .select('title likesCount dislikesCount createdAt');
  res.json(blogs);
};

export const voteBlog = async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  const { value } = req.body || {};
  if (!['like', 'dislike', 'none'].includes(value))
    return res.status(400).json({ error: 'value must be like|dislike|none' });

  const blogId = new O(req.params.id);
  const userId = new O(req.user);
  const existing = await Vote.findOne({ blogId, userId });

  const desired = value === 'none' ? 0 : value === 'like' ? 1 : -1;
  const current = existing ? existing.value : 0;
  if (desired === current) return res.json({ ok: true });

  const inc = { likesCount: 0, dislikesCount: 0 };
  if (current === 1) inc.likesCount--;
  if (current === -1) inc.dislikesCount--;
  if (desired === 1) inc.likesCount++;
  if (desired === -1) inc.dislikesCount++;

  if (desired === 0) { if (existing) await existing.deleteOne(); }
  else {
    await Vote.updateOne({ blogId, userId }, { $set: { value: desired } }, { upsert: true });
  }
  await Blog.updateOne({ _id: blogId }, { $inc: inc });
  res.json({ ok: true, delta: inc });
};

export const listComments = async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'Invalid blog id' });
  const blogId = new O(req.params.id);
  const parent = req.query.parentId ? (isId(req.query.parentId) ? new O(req.query.parentId) : null) : null;
  if (req.query.parentId && !parent) return res.status(400).json({ error: 'Invalid parentId' });

  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);

  const items = await Comment.find({ blogId, parentId: parent })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const ids = items.map((c) => c._id);
  const counts = await Comment.aggregate([
    { $match: { parentId: { $in: ids } } },
    { $group: { _id: '$parentId', n: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
  res.json(items.map((c) => ({ ...c, repliesCount: map[String(c._id)] || 0 })));
};

export const createComment = async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'Invalid blog id' });
  const blogId = new O(req.params.id);
  const { body, parentId } = req.body || {};
  if (!body) return res.status(400).json({ error: 'body required' });

  let pId = null;
  let ancestors = [];
  if (parentId) {
    if (!isId(parentId)) return res.status(400).json({ error: 'Invalid parentId' });
    pId = new O(parentId);
    const parent = await Comment.findOne({ _id: pId, blogId });
    if (!parent) return res.status(400).json({ error: 'parent not found in this blog' });
    ancestors = [...parent.ancestors, parent._id];
  }

  const comment = await Comment.create({
    blogId,
    userId: new O(req.user),
    body: String(body),
    parentId: pId,
    ancestors,
  });
  res.status(201).json({ id: comment._id });
};

export const getThread = async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ error: 'Invalid comment id' });
  const rootId = new O(req.params.id);
  const root = await Comment.findById(rootId).lean();
  if (!root) return res.status(404).json({ error: 'Not found' });
  const subtree = await Comment.find({ blogId: root.blogId, ancestors: rootId })
    .sort({ createdAt: 1 })
    .lean();

  const byId = new Map();
  [root, ...subtree].forEach((c) => byId.set(String(c._id), { ...c, children: [] }));
  const rootNode = byId.get(String(rootId));
  [root, ...subtree].forEach((c) => {
    if (c.parentId) byId.get(String(c.parentId))?.children.push(byId.get(String(c._id)));
  });
  res.json(rootNode);
};
