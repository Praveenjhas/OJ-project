import React, { useState } from "react";
import { postComment } from "../services/blogService";

export default function CommentForm({ blogId, parentId = null, onPosted }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  async function submit() {
    if (!token) {
      alert("Please log in to comment.");
      return;
    }

    if (!text.trim()) return;
    setLoading(true);
    try {
      await postComment(blogId, { body: text.trim(), parentId });
      setText("");
      if (onPosted) onPosted();
    } catch (e) {
      console.error(e);
      alert("Failed to post comment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full resize-none rounded-lg border border-slate-200 bg-white p-2 text-sm outline-none focus:border-blue-400"
        rows={3}
        placeholder="Write a comment..."
      />
      <div className="mt-2 flex justify-end">
        <button
          onClick={submit}
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
