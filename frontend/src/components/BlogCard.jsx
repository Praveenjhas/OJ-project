import React from "react";

function formatTime(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diff = Date.now() - date.getTime();
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  if (diff < hour) return "<1h ago";
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return date.toLocaleDateString();
}

const BlogCard = ({ blog, onClick, active }) => {
  const authorLabel = blog.authorName || `user-${String(blog.authorId || "").slice(-6)}`;

  return (
    <article
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border p-4 transition ${
        active
          ? "border-blue-300 bg-blue-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          @{authorLabel}
        </span>
        <span className="text-xs text-slate-500">{formatTime(blog.createdAt)}</span>
      </div>

      <h3 className="mt-3 text-base font-semibold leading-snug text-slate-900">
        {blog.title}
      </h3>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <span>{blog.likesCount || 0} likes</span>
        <span>{blog.dislikesCount || 0} dislikes</span>
        <span>Open thread</span>
      </div>
    </article>
  );
};

export default BlogCard;
