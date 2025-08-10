import React, { useEffect, useState } from "react";
import { fetchBlogById } from "../services/blogService";
import CommentThread from "./CommentThread.jsx";
import CommentForm from "./CommentForm";
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

  if (loading)
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <Spinner />
      </div>
    );
  if (!blog)
    return <div className="bg-white rounded-lg shadow p-6">Not found</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{blog.title}</h1>
          <div className="text-sm text-gray-500 mt-1">
            by {String(blog.authorId).slice(-6)} •{" "}
            {new Date(blog.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <VoteButton
            blogId={blog._id}
            initialLikes={blog.likesCount}
            onChange={(delta) => {
              setBlog((s) => ({ ...s, likesCount: s.likesCount + delta }));
              if (onVoteChange)
                onVoteChange({ ...blog, likesCount: blog.likesCount + delta });
            }}
          />
        </div>
      </div>

      <div
        className="prose max-w-none mt-6 text-gray-800"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />

      <div className="mt-8">
        <h3 className="font-semibold mb-3">Comments</h3>
        <CommentForm
          blogId={blog._id}
          onPosted={() => {
            load();
          }}
        />
        <div className="mt-4">
          <CommentThread blogId={blog._id} />
        </div>
      </div>
    </div>
  );
}
