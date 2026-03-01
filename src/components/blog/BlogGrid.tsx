"use client";

import React, { useState } from "react";
import { BlogCard } from "@/components/blog/BlogCard";
import { LoadMoreButton } from "@/components/blog/LoadMoreButton";
import { BlogPost } from "@/lib/types";

interface BlogGridProps {
  initialPosts: BlogPost[];
}

export function BlogGrid({ initialPosts }: BlogGridProps) {
  const [visibleCount, setVisibleCount] = useState(6);
  const visiblePosts = initialPosts.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {visiblePosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
      
      {visibleCount < initialPosts.length && (
        <LoadMoreButton onClick={handleLoadMore} />
      )}

      {/* Spacing before footer if no button */}
      {visibleCount >= initialPosts.length && <div className="h-24"></div>}
    </div>
  );
}
