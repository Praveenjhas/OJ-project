import React, { useEffect, useState } from "react";
import { fetchComments } from "../services/blogService";
import CommentForm from "./CommentForm";

function CommentItem({ c, onReply }) {
  return (
    <div className="mb-3">
      <div className="text-sm text-gray-700">
        <strong>{String(c.userId).slice(-6)}</strong> •{" "}
        <span className="text-xs text-gray-400">
          {new Date(c.createdAt).toLocaleString()}
        </span>
      </div>
      <div className="mt-1 text-gray-800">{c.body}</div>
      <div className="mt-2 text-xs text-gray-500 flex items-center gap-3">
        <button onClick={() => onReply(c._id)} className="hover:underline">
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
      setComments(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {loading ? (
        <div className="text-gray-500">Loading comments…</div>
      ) : (
        <div className="space-y-4">
          <CommentForm blogId={blogId} onPosted={load} />
          {comments.map((c) => (
            <div key={c._id} className="p-3 bg-white border rounded">
              <CommentItem c={c} onReply={(id) => setReplyTo(id)} />
              {replyTo === c._id && (
                <div className="mt-2">
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
          ))}
        </div>
      )}
    </div>
  );
}
