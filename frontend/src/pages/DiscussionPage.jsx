// src/pages/DiscussionPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createBlog,
  fetchPublicBlogs,
  fetchBlogById,
} from "../services/blogService";
import BlogList from "../components/BlogList";
import BlogDetail from "../components/BlogDetail";
import Spinner from "../components/Spinner";

function toSafeHtml(text) {
  const escaped = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/\n/g, "<br/>");
}

export default function DiscussionPage() {
  const [blogs, setBlogs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sort, setSort] = useState("popular");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [composer, setComposer] = useState({ title: "", content: "" });

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "Guest";

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
          const safeList = list || [];
          setBlogs(safeList);
          setSelectedId((prev) => {
            if (!safeList.length) return null;
            if (!prev) return safeList[0]._id;
            const exists = safeList.some((b) => b._id === prev);
            return exists ? prev : safeList[0]._id;
          });
        }
      } catch (err) {
        console.error("Failed to fetch discussions:", err);
        if (!cancelled) {
          setBlogs([]);
          setSelectedId(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sort, refreshKey]);

  const filteredBlogs = useMemo(() => {
    if (!search.trim()) return blogs;
    const q = search.trim().toLowerCase();
    return blogs.filter((b) => {
      const title = (b.title || "").toLowerCase();
      const author = String(b.authorId || "").toLowerCase();
      const authorName = (b.authorName || "").toLowerCase();
      return title.includes(q) || author.includes(q) || authorName.includes(q);
    });
  }, [blogs, search]);

  const selectedBlog = useMemo(
    () => blogs.find((b) => b._id === selectedId) || null,
    [blogs, selectedId],
  );

  const totalLikes = useMemo(
    () => blogs.reduce((sum, b) => sum + (b.likesCount || 0), 0),
    [blogs],
  );

  const activeToday = useMemo(() => {
    const today = new Date().toDateString();
    return blogs.filter(
      (b) => new Date(b.createdAt).toDateString() === today,
    ).length;
  }, [blogs]);

  async function submitPost(e) {
    e.preventDefault();
    if (!token) return;

    const title = composer.title.trim();
    const content = composer.content.trim();
    if (!title || !content) return;

    setCreating(true);
    try {
      const created = await createBlog({
        title,
        content: toSafeHtml(content),
      });

      setComposer({ title: "", content: "" });
      setSort("new");
      setRefreshKey((k) => k + 1);

      if (created?.id) {
        const fresh = await fetchBlogById(created.id);
        setSelectedId(fresh?._id || created.id);
      }
    } catch (err) {
      console.error("Failed to create post:", err);
      alert("Unable to create post. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-800">
        <div className="mx-auto max-w-7xl px-4 py-8 text-white sm:px-6 lg:px-8">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Discuss
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-blue-100 sm:text-base">
            Share ideas, ask coding questions, and learn from the community.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">Community Pulse</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-slate-500">Posts</span>
                    <span className="font-semibold text-slate-900">{blogs.length}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-slate-500">Likes</span>
                    <span className="font-semibold text-slate-900">{totalLikes}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-slate-500">Today</span>
                    <span className="font-semibold text-slate-900">{activeToday}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">Browse Feed</h2>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setSort("popular")}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      sort === "popular"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Popular
                  </button>
                  <button
                    onClick={() => setSort("new")}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      sort === "new"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    New
                  </button>
                </div>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title or author"
                  className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400"
                />
              </div>
            </div>
          </aside>

          <main className="space-y-4 lg:col-span-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Create a post</h2>
                  <p className="text-xs text-slate-500">Post as @{username}</p>
                </div>
              </div>

              {token ? (
                <form onSubmit={submitPost} className="space-y-3">
                  <input
                    value={composer.title}
                    onChange={(e) =>
                      setComposer((s) => ({ ...s, title: e.target.value }))
                    }
                    placeholder="Give your post a clear title"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                  <textarea
                    value={composer.content}
                    onChange={(e) =>
                      setComposer((s) => ({ ...s, content: e.target.value }))
                    }
                    placeholder="Share what you are building, ask for feedback, or start a coding thread..."
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Keep it clear and useful for other developers.
                    </span>
                    <button
                      type="submit"
                      disabled={creating}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {creating ? "Posting..." : "Share Post"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-3 text-sm text-blue-800">
                  Please <Link to="/login" className="font-semibold underline">log in</Link> to create posts, like, and comment.
                </div>
              )}
            </section>

            <section className="space-y-3">
              {loading ? (
                <div className="flex min-h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <Spinner />
                </div>
              ) : filteredBlogs.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                  No discussions match your filters.
                </div>
              ) : (
                <BlogList
                  blogs={filteredBlogs}
                  onSelect={(b) => setSelectedId(b._id)}
                  selectedId={selectedId}
                />
              )}
            </section>
          </main>

          <aside className="lg:col-span-4">
            <div className="sticky top-6">
              {selectedBlog ? (
                <BlogDetail
                  blogId={selectedBlog._id}
                  onVoteChange={(updated) => {
                    setBlogs((prev) =>
                      prev.map((b) =>
                        b._id === updated._id ? { ...b, ...updated } : b,
                      ),
                    );
                  }}
                />
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                  Select a post to open the full thread.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
