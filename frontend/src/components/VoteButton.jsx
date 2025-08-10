import React, { useState } from "react";
import { voteOnBlog } from "../services/blogService";

export default function VoteButton({ blogId, initialLikes = 0, onChange }) {
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);
  async function toggle() {
    setLoading(true);
    try {
      await voteOnBlog(blogId, { value: "like" });
      setLikes((l) => l + 1);
      if (onChange) onChange(1);
    } catch (e) {
      console.error(e);
      alert("Vote failed");
    } finally {
      setLoading(false);
    }
  }
  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
    >
      👍 {likes}
    </button>
  );
}
