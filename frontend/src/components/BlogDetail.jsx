import React, { useEffect, useState } from "react";
import { fetchBlogById } from "../services/blogService";
import CommentThread from "./CommentThread.jsx";
import VoteButton from "./VoteButton";
import Spinner from "./Spinner";

export default function BlogDetail({ blogId, onVoteChange }) {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [blogId]);

  async function load() {
    setLoading(true);
    try {
      const b = await fetchBlogById(blogId);
      setBlog(b);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Spinner />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Post not found.
      </div>
    );
  }

  const authorLabel =
    blog?.authorName || `user-${String(blog?.authorId || "").slice(-6)}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{blog.title}</h2>
          <div className="mt-1 text-xs text-slate-500">
            by @{authorLabel} | {new Date(blog.createdAt).toLocaleString()}
          </div>
        </div>
        <VoteButton
          blogId={blog._id}
          initialLikes={blog.likesCount}
          onChange={(delta) => {
            setBlog((s) => ({
              ...s,
              likesCount: Math.max(0, (s.likesCount || 0) + delta),
            }));
            if (onVoteChange) {
              onVoteChange({
                ...blog,
                likesCount: Math.max(0, (blog.likesCount || 0) + delta),
              });
            }
          }}
        />
      </div>

      <div
        className="prose prose-sm mt-5 max-w-none text-slate-800"
        dangerouslySetInnerHTML={{ __html: blog.content || "<i>No content</i>" }}
      />

      <div className="mt-6 border-t border-slate-200 pt-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Discussion
        </h3>
        <CommentThread blogId={blog._id} />
      </div>
    </div>
  );
}
