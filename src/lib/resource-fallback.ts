import { BLOG_POSTS } from "@/lib/mock-blog-data";
import { GUIDES } from "@/lib/mock-guides-data";
import { PODCAST_EPISODES } from "@/lib/mock-podcast-data";

const fallbackAuthor = {
  name: "HealTalk Editorial Team",
  role: "Mental Health Editorial",
  bio: "Practical mental health resources from HealTalk clinicians and writers.",
  imageUrl: "/images/Me.png",
  linkedinUrl: "#",
  socialLabel: "LinkedIn",
};

export const RESOURCE_FALLBACK_BLOG_POSTS = BLOG_POSTS.map((post) => ({
  id: String(post.id),
  title: post.title,
  subtitle: post.subtitle,
  excerpt: post.excerpt,
  imageUrl: post.imageUrl,
  category: post.category || "Mental Health",
  date:
    post.date instanceof Date
      ? post.date.toISOString()
      : new Date(post.date).toISOString(),
  heroType: post.heroType || "photo",
  heroIllustration: null,
  theme: post.theme || "green",
  published: true,
  author: fallbackAuthor,
  content: Array.isArray(post.content) ? post.content : [],
}));

export const RESOURCE_FALLBACK_GUIDES = GUIDES.map((guide) => ({
  id: guide.id,
  title: guide.title,
  coverTitle: guide.coverTitle || guide.title,
  theme: guide.theme,
  href: guide.href,
  published: true,
}));

export const RESOURCE_FALLBACK_PODCASTS = PODCAST_EPISODES.map((episode) => ({
  id: episode.id,
  episodeNumber: episode.episodeNumber,
  title: episode.title,
  description: episode.description,
  host: episode.host,
  spotifyUrl: episode.spotifyUrl,
  youtubeUrl: episode.youtubeUrl,
  published: true,
}));

export const getFallbackBlogPostById = (id: string) =>
  RESOURCE_FALLBACK_BLOG_POSTS.find((post) => post.id === id) || null;
