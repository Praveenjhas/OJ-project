import React from "react";
import BlogCard from "./BlogCard";
export default function BlogList({ blogs, onSelect, selectedId }) {
  return (
    <div className="space-y-3">
      {blogs.map((b) => (
        <BlogCard
          key={b._id}
          blog={b}
          onClick={() => onSelect(b)}
          active={b._id === selectedId}
        />
      ))}
    </div>
  );
}
