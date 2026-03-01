import React from "react";
import { BlogHero } from "@/components/blog/BlogHero";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { RESOURCE_FALLBACK_BLOG_POSTS } from "@/lib/resource-fallback";

async function getBlogPosts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/blog`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return RESOURCE_FALLBACK_BLOG_POSTS;
    const data = await res.json();
    const posts = Array.isArray(data.posts) ? data.posts : [];
    return posts.length > 0 ? posts : RESOURCE_FALLBACK_BLOG_POSTS;
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return RESOURCE_FALLBACK_BLOG_POSTS;
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen bg-[#F6F1EA] flex flex-col">

      <main className="flex-grow">
        <BlogHero />
        <BlogGrid initialPosts={posts} />
      </main>
    </div>
  );
}
