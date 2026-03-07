import React, { useState } from "react";
import { voteOnBlog } from "../services/blogService";

export default function VoteButton({ blogId, initialLikes = 0, onChange }) {
  const [likes, setLikes] = useState(initialLikes || 0);
  const [loading, setLoading] = useState(false);

  async function toggleLike() {
    if (!localStorage.getItem("token")) {
      alert("Please log in to like posts.");
      return;
    }

    setLoading(true);
    try {
      const res = await voteOnBlog(blogId, { value: "like" });
      const delta = res?.delta?.likesCount || 0;
      if (delta !== 0) {
        setLikes((l) => Math.max(0, l + delta));
        if (onChange) onChange(delta);
      }
    } catch (e) {
      console.error(e);
      alert("Vote failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
    >
      Like {likes}
    </button>
  );
}
