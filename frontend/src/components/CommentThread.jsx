import React, { useEffect, useState } from "react";
import { fetchComments } from "../services/blogService";
import CommentForm from "./CommentForm";

function CommentItem({ c, onReply }) {
  const userLabel = c.userName || `user-${String(c.userId).slice(-6)}`;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <strong className="text-slate-700">@{userLabel}</strong>
        <span>|</span>
        <span>{new Date(c.createdAt).toLocaleString()}</span>
      </div>
      <div className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{c.body}</div>
      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
        <button onClick={() => onReply(c._id)} className="font-medium text-blue-700 hover:underline">
          Reply
        </button>
        <span>{c.repliesCount || 0} replies</span>
      </div>
    </div>
  );
}

export default function CommentThread({ blogId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    load();
  }, [blogId]);

  async function load() {
    setLoading(true);
    try {
      const list = await fetchComments(blogId);
      setComments(list || []);
    } catch (e) {
      console.error(e);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <CommentForm blogId={blogId} onPosted={load} />

      {loading ? (
        <div className="text-sm text-slate-500">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500">
          No comments yet. Start the thread.
        </div>
      ) : (
        comments.map((c) => (
          <div key={c._id} className="space-y-2">
            <CommentItem c={c} onReply={(id) => setReplyTo(id)} />
            {replyTo === c._id && (
              <div className="ml-3 border-l border-slate-200 pl-3">
                <CommentForm
                  blogId={blogId}
                  parentId={c._id}
                  onPosted={() => {
                    setReplyTo(null);
                    load();
                  }}
                />
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
