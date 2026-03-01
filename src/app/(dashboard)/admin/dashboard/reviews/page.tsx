"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Star, CheckCircle, XCircle, Trash2 } from "lucide-react";

interface ReviewRow {
  id: string;
  rating: number;
  comment: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  moderatedAt: string | null;
  createdAt: string;
  patient: { user: { name: string | null; email: string | null } } | null;
  psychologist: { user: { name: string | null; email: string | null } } | null;
}

interface BlogPostRow {
  id: string;
  title: string;
  category: string | null;
  date: string;
  published: boolean;
  createdAt: string;
  author: { name: string; role: string } | null;
}

const reviewStatusTabs = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

const postStatusTabs = [
  { label: "All", value: "ALL" },
  { label: "Published", value: "true" },
  { label: "Draft", value: "false" },
];

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

const formatDate = (value: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const renderStars = (rating: number) =>
  Array.from({ length: 5 }).map((_, index) => (
    <Star
      key={index}
      size={14}
      className={cn(
        index < rating ? "text-amber-400 fill-amber-400" : "text-gray-200"
      )}
    />
  ));

export default function ModerationPage() {
  const [activeTab, setActiveTab] = useState<"reviews" | "posts">("reviews");

  const [reviewStatus, setReviewStatus] = useState("ALL");
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);

  const [postStatus, setPostStatus] = useState("ALL");
  const [postSearch, setPostSearch] = useState("");
  const [postPage, setPostPage] = useState(1);
  const [postTotalPages, setPostTotalPages] = useState(1);
  const [posts, setPosts] = useState<BlogPostRow[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const reviewLimit = 10;
  const postLimit = 10;

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    const params = new URLSearchParams({
      status: reviewStatus,
      search: reviewSearch.trim(),
      page: String(reviewPage),
      limit: String(reviewLimit),
    });

    try {
      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to load reviews.");
      }
      const payload = await res.json();
      setReviews(payload.reviews || []);
      setReviewTotalPages(payload.pagination?.totalPages || 1);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to load reviews.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [reviewPage, reviewSearch, reviewStatus]);

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    const params = new URLSearchParams({
      published: postStatus,
      search: postSearch.trim(),
      page: String(postPage),
      limit: String(postLimit),
    });

    try {
      const res = await fetch(`/api/admin/blog-posts?${params.toString()}`);
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to load blog posts.");
      }
      const payload = await res.json();
      setPosts(payload.posts || []);
      setPostTotalPages(payload.pagination?.totalPages || 1);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to load blog posts.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [postPage, postSearch, postStatus]);

  useEffect(() => {
    if (activeTab === "reviews") {
      const timer = setTimeout(() => loadReviews(), 250);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => loadPosts(), 250);
    return () => clearTimeout(timer);
  }, [activeTab, loadPosts, loadReviews]);

  const handleReviewStatus = async (id: string, status: ReviewRow["status"]) => {
    setIsUpdating(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to update review.");
      }
      await loadReviews();
      setMessage({ type: "success", text: "Review updated." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update review.",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;
    setIsUpdating(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to delete review.");
      }
      await loadReviews();
      setMessage({ type: "success", text: "Review deleted." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete review.",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleTogglePost = async (id: string, published: boolean) => {
    setIsUpdating(id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/blog-posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !published }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Failed to update post.");
      }
      await loadPosts();
      setMessage({ type: "success", text: "Post updated." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update post.",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const reviewStatusSummary = useMemo(() => {
    if (reviews.length === 0) return "No reviews";
    return `${reviews.length} review${reviews.length === 1 ? "" : "s"}`;
  }, [reviews.length]);

  const postStatusSummary = useMemo(() => {
    if (posts.length === 0) return "No posts";
    return `${posts.length} post${posts.length === 1 ? "" : "s"}`;
  }, [posts.length]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Moderation</h1>
          <p className="text-gray-500">Review content and keep the platform safe.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
              activeTab === "reviews"
                ? "bg-[#5B6CFF] text-white border-[#5B6CFF]"
                : "bg-white text-gray-600 border-[#E6EAF2] hover:border-[#5B6CFF]"
            )}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews
          </button>
          <button
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
              activeTab === "posts"
                ? "bg-[#5B6CFF] text-white border-[#5B6CFF]"
                : "bg-white text-gray-600 border-[#E6EAF2] hover:border-[#5B6CFF]"
            )}
            onClick={() => setActiveTab("posts")}
          >
            Blog Posts
          </button>
        </div>

        {message && (
          <div
            className={cn(
              "w-full rounded-xl border px-4 py-3 text-sm",
              message.type === "success"
                ? "bg-green-50 text-green-700 border-green-100"
                : "bg-red-50 text-red-700 border-red-100"
            )}
          >
            {message.text}
          </div>
        )}

        {activeTab === "reviews" ? (
          <>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {reviewStatusTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setReviewPage(1);
                      setReviewStatus(tab.value);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
                      reviewStatus === tab.value
                        ? "bg-[#5B6CFF] text-white border-[#5B6CFF]"
                        : "bg-white text-gray-600 border-[#E6EAF2] hover:border-[#5B6CFF]"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Search reviews"
                  value={reviewSearch}
                  onChange={(event) => {
                    setReviewPage(1);
                    setReviewSearch(event.target.value);
                  }}
                  className="w-full lg:w-[320px]"
                />
                <span className="text-sm text-gray-500">{reviewStatusSummary}</span>
              </div>
            </div>

            {isLoading ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-20 text-center text-gray-500">
                Loading reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-20 text-center text-gray-500">
                No reviews found.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white border border-[#E6EAF2] rounded-[20px] p-6 shadow-sm"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-xs text-gray-500">{review.rating}/5</span>
                        </div>
                        <p className="text-sm text-gray-700 max-w-2xl">{review.comment}</p>
                        <div className="text-xs text-gray-500">
                          Patient: {review.patient?.user?.name || "Unknown"} · Psychologist: {review.psychologist?.user?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-400">Submitted {formatDate(review.createdAt)}</div>
                      </div>
                      <div className="flex flex-col gap-3 min-w-[220px]">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold w-fit",
                            statusStyles[review.status]
                          )}
                        >
                          {review.status}
                        </span>
                        <div className="text-xs text-gray-400">
                          Moderated: {formatDate(review.moderatedAt)}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 gap-2"
                            disabled={isUpdating === review.id}
                            onClick={() => handleReviewStatus(review.id, "APPROVED")}
                          >
                            <CheckCircle size={14} /> Approve
                          </Button>
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 gap-2"
                            disabled={isUpdating === review.id}
                            onClick={() => handleReviewStatus(review.id, "PENDING")}
                          >
                            Pending
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 gap-2"
                            disabled={isUpdating === review.id}
                            onClick={() => handleReviewStatus(review.id, "REJECTED")}
                          >
                            <XCircle size={14} /> Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            disabled={isUpdating === review.id}
                            onClick={() => handleDeleteReview(review.id)}
                          >
                            <Trash2 size={14} /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Page {reviewPage} of {reviewTotalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={reviewPage <= 1}
                  onClick={() => setReviewPage((prev) => prev - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={reviewPage >= reviewTotalPages}
                  onClick={() => setReviewPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {postStatusTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => {
                      setPostPage(1);
                      setPostStatus(tab.value);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-semibold border transition-colors",
                      postStatus === tab.value
                        ? "bg-[#5B6CFF] text-white border-[#5B6CFF]"
                        : "bg-white text-gray-600 border-[#E6EAF2] hover:border-[#5B6CFF]"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Search posts"
                  value={postSearch}
                  onChange={(event) => {
                    setPostPage(1);
                    setPostSearch(event.target.value);
                  }}
                  className="w-full lg:w-[320px]"
                />
                <span className="text-sm text-gray-500">{postStatusSummary}</span>
              </div>
            </div>

            {isLoading ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-20 text-center text-gray-500">
                Loading posts...
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-[24px] py-20 text-center text-gray-500">
                No posts found.
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white border border-[#E6EAF2] rounded-[20px] p-6 shadow-sm"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="text-lg font-semibold text-gray-900">{post.title}</div>
                        <div className="text-xs text-gray-500">
                          {post.author?.name || "Unknown author"} · {post.category || "Uncategorized"}
                        </div>
                        <div className="text-xs text-gray-400">Published date: {formatDate(post.date)}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold",
                            post.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          )}
                        >
                          {post.published ? "Published" : "Draft"}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isUpdating === post.id}
                          onClick={() => handleTogglePost(post.id, post.published)}
                        >
                          {post.published ? "Unpublish" : "Publish"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                Page {postPage} of {postTotalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={postPage <= 1}
                  onClick={() => setPostPage((prev) => prev - 1)}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={postPage >= postTotalPages}
                  onClick={() => setPostPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
