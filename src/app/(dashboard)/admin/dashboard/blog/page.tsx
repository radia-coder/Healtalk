"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Plus, Pencil, Trash2, Eye, EyeOff, X, Check } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  category: string | null;
  date: string | null;
  published: boolean;
  createdAt: string;
  author: { name: string; role: string } | null;
}

interface BlogPostFormPayload {
  title: string;
  subtitle?: string;
  excerpt: string;
  imageUrl?: string;
  category: string;
  theme?: string;
  published: boolean;
}

const CATEGORIES = ["General", "News", "Review", "Announcement", "Mental Health", "Research"];

const categoryStyles: Record<string, string> = {
  General: "bg-gray-100 text-gray-700",
  News: "bg-blue-100 text-blue-700",
  Review: "bg-purple-100 text-purple-700",
  Announcement: "bg-amber-100 text-amber-700",
  "Mental Health": "bg-green-100 text-green-700",
  Research: "bg-teal-100 text-teal-700",
};

const formatDate = (value: string | null) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(value));
};

const emptyForm = {
  title: "",
  subtitle: "",
  excerpt: "",
  imageUrl: "",
  category: "General",
  theme: "",
  published: false,
};

type FormState = typeof emptyForm;

export default function BlogManagementPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [publishedFilter, setPublishedFilter] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const limit = 10;

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    const params = new URLSearchParams({
      search: search.trim(),
      page: String(page),
      limit: String(limit),
    });

    if (publishedFilter === "published") params.set("published", "true");
    if (publishedFilter === "draft") params.set("published", "false");

    try {
      const res = await fetch(`/api/admin/blog-posts?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load posts.");
      const payload = await res.json();
      setPosts(payload.posts || []);
      setTotalPages(payload.pagination?.totalPages || 1);
      setTotal(payload.pagination?.total || 0);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to load posts." });
    } finally {
      setIsLoading(false);
    }
  }, [page, search, publishedFilter]);

  useEffect(() => {
    const timer = setTimeout(() => loadPosts(), 250);
    return () => clearTimeout(timer);
  }, [loadPosts]);

  const openCreate = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setShowModal(true);
    setMessage(null);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      subtitle: "",
      excerpt: "",
      imageUrl: "",
      category: post.category || "General",
      theme: "",
      published: post.published,
    });
    setShowModal(true);
    setMessage(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPost(null);
    setForm(emptyForm);
  };

  const handleFieldChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setMessage({ type: "error", text: "Title is required." });
      return;
    }
    if (!editingPost && !form.excerpt.trim()) {
      setMessage({ type: "error", text: "Excerpt is required." });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const body: BlogPostFormPayload = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim() || undefined,
        excerpt: form.excerpt.trim(),
        imageUrl: form.imageUrl.trim() || undefined,
        category: form.category,
        theme: form.theme.trim() || undefined,
        published: form.published,
      };

      let res: Response;

      if (editingPost) {
        res = await fetch(`/api/admin/blog-posts/${editingPost.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/admin/blog-posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to save post.");
      }

      setMessage({ type: "success", text: editingPost ? "Post updated." : "Post created successfully." });
      closeModal();
      await loadPosts();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to save post." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    setTogglingId(post.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/blog-posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });
      if (!res.ok) throw new Error("Failed to update status.");
      await loadPosts();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to update." });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setDeletingId(post.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/blog-posts/${post.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post.");
      setMessage({ type: "success", text: "Post deleted." });
      await loadPosts();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to delete." });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Blog Management</h1>
            <p className="text-gray-500">Create, edit, and manage blog posts for the platform.</p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-[#5B6CFF] hover:bg-[#4a5ae8] text-white gap-2 self-start sm:self-auto"
          >
            <Plus size={16} /> New Post
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(["all", "published", "draft"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setPage(1); setPublishedFilter(f); }}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold border capitalize transition-colors",
                  publishedFilter === f
                    ? "bg-[#5B6CFF] text-white border-[#5B6CFF]"
                    : "bg-white text-gray-600 border-[#E6EAF2] hover:border-[#5B6CFF]"
                )}
              >
                {f === "all" ? "All" : f === "published" ? "Published" : "Drafts"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search posts"
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              className="w-full lg:w-[280px]"
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">{total} post{total !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* Alert */}
        {message && !showModal && (
          <div className={cn(
            "w-full rounded-xl border px-4 py-3 text-sm",
            message.type === "success"
              ? "bg-green-50 text-green-700 border-green-100"
              : "bg-red-50 text-red-700 border-red-100"
          )}>
            {message.text}
          </div>
        )}

        {/* Posts list */}
        {isLoading ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-20 text-center text-gray-500">
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-20 text-center text-gray-500">
            <FileText size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="mb-4">No blog posts found.</p>
            <Button onClick={openCreate} className="bg-[#5B6CFF] hover:bg-[#4a5ae8] text-white gap-2">
              <Plus size={16} /> Create First Post
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-[#E6EAF2] rounded-[20px] overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E6EAF2] bg-gray-50/50">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Title</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Author</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Category</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Date</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Status</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EAF2]">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900 line-clamp-1">{post.title}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-xs">
                      {post.author?.name || "—"}
                    </td>
                    <td className="px-5 py-4">
                      {post.category ? (
                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", categoryStyles[post.category] || "bg-gray-100 text-gray-700")}>
                          {post.category}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(post.date || post.createdAt)}</td>
                    <td className="px-5 py-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", post.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTogglePublish(post)}
                          disabled={togglingId === post.id}
                          title={post.published ? "Unpublish" : "Publish"}
                          className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            post.published
                              ? "text-green-600 hover:bg-green-50"
                              : "text-gray-400 hover:bg-gray-100"
                          )}
                        >
                          {post.published ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button
                          onClick={() => openEdit(post)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-[#5B6CFF] hover:bg-[#EEF0FF] transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
                          disabled={deletingId === post.id}
                          title="Delete"
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E6EAF2]">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPost ? "Edit Post" : "Create New Post"}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {message && (
                <div className={cn("rounded-xl border px-4 py-3 text-sm", message.type === "success" ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100")}>
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
                <Input
                  value={form.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  placeholder="Enter post title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subtitle</label>
                <Input
                  value={form.subtitle}
                  onChange={(e) => handleFieldChange("subtitle", e.target.value)}
                  placeholder="Optional subtitle"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Excerpt {!editingPost && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => handleFieldChange("excerpt", e.target.value)}
                  placeholder="Short summary or excerpt of the post"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover Image URL</label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) => handleFieldChange("imageUrl", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => handleFieldChange("category", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF] bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Theme</label>
                <select
                  value={form.theme}
                  onChange={(e) => handleFieldChange("theme", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5B6CFF]/20 focus:border-[#5B6CFF] bg-white"
                >
                  <option value="">None</option>
                  <option value="lilac">Lilac</option>
                  <option value="green">Green</option>
                  <option value="cream">Cream</option>
                  <option value="blue">Blue</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleFieldChange("published", !form.published)}
                  className={cn(
                    "relative w-11 h-6 rounded-full transition-colors flex-shrink-0",
                    form.published ? "bg-[#5B6CFF]" : "bg-gray-200"
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform",
                    form.published ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
                <label className="text-sm text-gray-700">
                  {form.published ? "Published" : "Save as Draft"}
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E6EAF2]">
              <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#5B6CFF] hover:bg-[#4a5ae8] text-white gap-2"
              >
                {isSubmitting ? "Saving..." : (
                  <><Check size={15} /> {editingPost ? "Update Post" : "Create Post"}</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
