// src/pages/DiscussionPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { fetchPublicBlogs } from "../services/blogService";
import BlogList from "../components/BlogList";
import BlogDetail from "../components/BlogDetail";
import Spinner from "../components/Spinner";

/**
 * Modern, simple, and "dashing" Discussions page.
 * - No external libs
 * - Client-side search (simple & responsive)
 * - Sort (popular/new)
 * - Sticky left column with nice cards
 */

export default function DiscussionPage() {
  const [blogs, setBlogs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState("popular"); // "popular" | "new"
  const [search, setSearch] = useState("");

  // Load posts from server when component mounts or sort changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const list = await fetchPublicBlogs({
          sort: sort === "new" ? "new" : "popular",
          limit: 50,
        });
        if (!cancelled) {
          setBlogs(list || []);
          // choose a sensible default selection
          if (list && list.length > 0) {
            setSelected((prev) => {
              if (!prev) return list[0];
              const found = list.find((b) => b._id === prev._id);
              return found ?? list[0];
            });
          } else {
            setSelected(null);
          }
        }
      } catch (err) {
        console.error("Failed to fetch discussions:", err);
        if (!cancelled) {
          setBlogs([]);
          setSelected(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [sort]);

  // client-side filtered list (fast & avoids extra API calls)
  const filtered = useMemo(() => {
    if (!search.trim()) return blogs;
    const q = search.trim().toLowerCase();
    return blogs.filter((b) => {
      const title = (b.title || "").toLowerCase();
      const author = String(b.authorId || "").toLowerCase();
      const content = (b.content || "").toLowerCase();
      return title.includes(q) || author.includes(q) || content.includes(q);
    });
  }, [blogs, search]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT SIDEBAR */}
      <aside className="col-span-1">
        <div className="sticky top-20 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold leading-tight">Discussions</h2>
              <p className="text-sm text-gray-500 mt-1">
                Community posts, Q&A & announcements
              </p>
            </div>

            <div>
              <button
                onClick={() =>
                  setSort((s) => (s === "popular" ? "new" : "popular"))
                }
                className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg text-sm shadow-sm hover:opacity-95"
                title="Toggle sort (popular/new)"
              >
                {sort === "popular" ? "Popular" : "Newest"}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search titles, authors, content..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-3 text-xs text-gray-500 bg-white px-2 py-1 rounded"
              >
                Clear
              </button>
            )}
          </div>

          {/* Stats / quick info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>{filtered.length} posts</div>
            <div>
              Showing{" "}
              {blogs.length ? Math.min(filtered.length, blogs.length) : 0}{" "}
              results
            </div>
          </div>

          {/* List container */}
          <div className="bg-white rounded-2xl shadow p-3 h-[70vh] overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Spinner />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No posts found
              </div>
            ) : (
              <div className="space-y-3">
                <BlogList
                  blogs={filtered}
                  onSelect={(b) => setSelected(b)}
                  selectedId={selected ? selected._id : null}
                />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* RIGHT DETAIL */}
      <main className="col-span-2">
        {selected ? (
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">
                  {selected.title}
                </h1>
                <div className="mt-2 text-sm text-gray-500">
                  by{" "}
                  <span className="font-medium text-gray-700">
                    {String(selected.authorId).slice(-6)}
                  </span>
                  {" • "}
                  <span>{new Date(selected.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-md bg-green-50 text-green-700 border border-green-100">
                  👍 {selected.likesCount ?? 0}
                </div>
                <div className="px-3 py-1 rounded-md bg-gray-50 text-gray-700 border border-gray-100">
                  {selected.commentsCount ?? 0} comments
                </div>
              </div>
            </div>

            <div
              className="mt-6 prose max-w-none text-gray-800"
              dangerouslySetInnerHTML={{
                __html: selected.content || "<i>No content</i>",
              }}
            />

            <div className="mt-8 border-t pt-4">
              {/* Reuse BlogDetail for comments/actions */}
              <BlogDetail
                blogId={selected._id}
                onVoteChange={(updated) => {
                  // reflect updated likes/comments in selected and list
                  setSelected((s) => ({ ...s, ...updated }));
                  setBlogs((prev) =>
                    prev.map((b) =>
                      b._id === updated._id ? { ...b, ...updated } : b
                    )
                  );
                }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow p-6 flex items-center justify-center text-gray-500">
            Select a discussion to read — or refresh to load posts.
          </div>
        )}
      </main>
    </div>
  );
}
