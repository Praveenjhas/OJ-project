import React from "react";
export default function BlogCard({ blog, onClick, active }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer p-3 rounded-lg border ${
        active ? "border-brand bg-brand/10" : "border-gray-100 bg-white"
      } hover:shadow`}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-gray-800">{blog.title}</h3>
      </div>
      <div className="flex items-center gap-3 mt-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-green-600 font-semibold">
            {blog.likesCount}
          </span>{" "}
          likes
        </div>
        <div className="text-xs text-gray-400">
          by {String(blog.authorId).slice(-6)}
        </div>
      </div>
    </div>
  );
}
