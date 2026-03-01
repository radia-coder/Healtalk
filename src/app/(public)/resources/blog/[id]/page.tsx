import React from "react";
import { notFound } from "next/navigation";
import { BlogPostLayout } from "@/components/blog/BlogPostLayout";
import { HeroIllustration } from "@/components/blog/HeroIllustration";
import { HeroPhoto } from "@/components/blog/HeroPhoto";
import { AuthorBand } from "@/components/blog/AuthorBand";
import { getFallbackBlogPostById } from "@/lib/resource-fallback";

interface BlogPostContent {
  type: 'heading' | 'paragraph' | 'list' | 'quote';
  value: string | string[];
}

interface Author {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  linkedinUrl: string;
}

async function getBlogPost(id: string) {
  const fallbackPost = getFallbackBlogPostById(id);
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/blog/${id}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return fallbackPost;
    const data = await res.json();
    return data.post ?? data ?? fallbackPost;
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    return fallbackPost;
  }
}

// Helper to render content blocks
function BlogPostContentRenderer({ content }: { content?: BlogPostContent[] }) {
  if (!content) {
      return (
          <div className="max-w-[720px] mx-auto px-4 md:px-0 mb-20">
              <p className="text-lg text-gray-500 italic">Content pending...</p>
          </div>
      )
  }
  return (
    <div className="max-w-[720px] mx-auto px-4 md:px-0 mb-20 md:mb-32">
      <article className="max-w-none">
        {content.map((block, index) => {
          switch (block.type) {
            case 'heading':
              return <h2 key={index} className="text-3xl md:text-4xl mt-12 mb-6 text-[#1a1a1a]">{block.value}</h2>;
            case 'paragraph':
              return <p key={index} className="mb-6 text-[24px] font-normal text-[#131E0D] leading-relaxed font-heading">{block.value}</p>;
            case 'list':
              return (
                <ul key={index} className="my-8 space-y-2 list-none pl-0">
                  {(block.value as string[]).map((item, i) => (
                    <li key={i} className="flex gap-3 items-start">
                         <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#1a1a1a] mt-2.5" />
                         <span>{item}</span>
                    </li>
                  ))}
                </ul>
              );
            case 'quote':
              return (
                <blockquote key={index} className="border-l-4 border-black pl-6 italic text-2xl my-10 font-display text-[#1a1a1a]">
                  &ldquo;{block.value}&rdquo;
                </blockquote>
              );
            default:
              return null;
          }
        })}
      </article>
    </div>
  );
}

export default async function BlogPostPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const post = await getBlogPost(params.id);

  if (!post) {
    notFound();
  }

  // Normalize author data for AuthorBand
  const authorData: Author = typeof post.author === 'string' ? {
      name: post.author,
      role: "Contributor",
      bio: "Writes about recruitment, culture, and growth at Amby.",
      imageUrl: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1000&auto=format&fit=crop", // Generic placeholder
      linkedinUrl: "#"
  } : post.author;

  // Ensure heroImage handles the string / optional
  const postWithImage = {
      ...post,
      heroImage: post.imageUrl || "" // Map generic imageUrl to heroImage if missing
  }

  return (
    <BlogPostLayout>
      {/* 1. Hero Variant Switcher */}
      {post.heroType === 'illustration' ? (
        <HeroIllustration post={postWithImage} />
      ) : (
        <HeroPhoto post={postWithImage} />
      )}

      {/* 2. Article Content */}
      <BlogPostContentRenderer content={post.content} />

      {/* 3. Author Band */}
      <AuthorBand author={authorData} />
    </BlogPostLayout>
  );
}
