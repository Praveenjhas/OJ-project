import React, { useState } from "react";
import { postComment } from "../services/blogService";

export default function CommentForm({ blogId, parentId = null, onPosted }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await postComment(blogId, { body: text, parentId });
      setText("");
      if (onPosted) onPosted();
    } catch (e) {
      console.error(e);
      alert("Failed");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="bg-gray-50 border p-3 rounded">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-2 rounded resize-none"
        rows={3}
        placeholder="Write a comment..."
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={submit}
          disabled={loading}
          className="px-4 py-1 bg-brand text-white rounded"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
