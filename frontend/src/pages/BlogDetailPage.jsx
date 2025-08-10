// src/pages/BlogDetailPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import BlogDetail from "../components/BlogDetail";

export default function BlogDetailPage() {
  const { id } = useParams();
  return (
    <div className="container mx-auto">
      <BlogDetail blogId={id} />
    </div>
  );
}
