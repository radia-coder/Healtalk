import { BLOG_POSTS } from '../../src/lib/mock-blog-data';

// Extract unique authors from blog posts
export const blogAuthorSeedData = [
  {
    name: "Musab Mohamed Ali",
    role: "CEO / Partner",
    bio: "Musab Mohamed Ali is the CEO and Partner at HealTalk, dedicated to making mental health support accessible and stigma-free for everyone.",
    imageUrl: "/images/Me.png",
    linkedinUrl: "https://www.instagram.com/maahir.03?igsh=anY3cXUzanhwNTNj&utm_source=qr",
    socialLabel: "Instagram"
  },
  {
    name: "Radia Ahmed Abdirahman",
    role: "Head of Care Operations",
    bio: "Radia Ahmed is a licensed therapist specializing in depression, family dynamics, and relationship counseling.",
    imageUrl: "/images/Ciro.png",
    linkedinUrl: "#"
  },
  {
    name: "Ugbad Bashir Barre",
    role: "Client Director",
    bio: "Ugbaad is a mental health counselor focused on stress management, work-life balance, and building emotional resilience.",
    imageUrl: "/images/Mustaf.png",
    linkedinUrl: "#"
  },
  {
    name: "Sabirin Ali Isack",
    role: "Director of Operations",
    bio: "Sabiriin is a mental health professional specializing in holistic wellness and community mental health.",
    imageUrl: "/images/Koonfur.png",
    linkedinUrl: "#"
  },
  {
    name: "Abdulkadir Mohamed Abdi",
    role: "Head of People",
    bio: "Abdulkadir is a mental health advocate focused on organizational wellness and employee mental health.",
    imageUrl: "/images/Koonfur.png",
    linkedinUrl: "#"
  }
];

export const blogPostSeedData = BLOG_POSTS.map(post => {
  // Handle author - can be string or object
  const authorName = typeof post.author === 'string'
    ? post.author
    : post.author.name;

  // Parse date to DateTime
  const date = new Date(post.date);

  return {
    title: post.title,
    subtitle: post.subtitle,
    excerpt: post.excerpt,
    imageUrl: post.imageUrl,
    category: post.category || 'Mental Health',
    date: date,
    heroType: post.heroType || 'photo',
    heroIllustration: post.heroIllustration,
    theme: post.theme || 'green',
    published: true,
    authorName: authorName, // Will be resolved to authorId
    content: post.content || [] // BlogPostContent array
  };
});
