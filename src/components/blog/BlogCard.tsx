import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "@/lib/types";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/resources/blog/${post.id}`} className="group block h-full">
      <div className="flex flex-col gap-4 h-full">
        {/* Card Image */}
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[16px] bg-gray-100">
             <Image
                src={post.imageUrl || '/images/Blog1.png'}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ objectPosition: '50% 30%' }}
             />
        </div>

        {/* Card Content - Clean whitespace, no borders */}
        <div className="flex flex-col gap-2">
            <h3 className="text-[22px] md:text-[28px] lg:text-[32px] font-bold font-heading text-[#131E0D] leading-tight group-hover:text-gray-600 transition-colors">
                {post.title}
            </h3>
            <p className="text-[15px] md:text-[18px] lg:text-[20px] font-normal font-heading text-[#131E0D] line-clamp-3 leading-relaxed">
                {post.excerpt}
            </p>
        </div>
      </div>
    </Link>
  );

}
