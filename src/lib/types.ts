// Type definitions for the application

// Psychologist types
export interface Psychologist {
  id: number | string;
  name?: string;
  title?: string;
  credentials?: string;
  experience?: number;
  rating: number;
  reviewCount: number;
  specializations?: string[];
  conditions?: string[];
  hospital?: string;
  location?: string;
  languages?: string[];
  nextAvailable?: string;
  price?: number;
  priceRange?: string;
  photo?: string;
  image?: string;
  bio?: string;
  about?: string;
  verified?: boolean;
  sessionDuration?: string;
  licenseNumber?: string;
  highlights?: {
    icon: string;
    label: string;
    color: string;
  }[];
  photos?: string[];
  insurances?: string[];
  testimonials?: {
    name: string;
    text: string;
    role: string;
    image: string;
  }[];
  education?: {
    degree: string;
    institution?: string;
    school?: string;
    year: number | string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    year?: number;
  }[];
  qualifications?: {
    name: string;
    issuer: string;
  }[];
}

// Blog types
export interface Author {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  linkedinUrl: string;
  socialLabel?: string;
}

export interface BlogPostContent {
  type: 'heading' | 'paragraph' | 'list' | 'quote';
  value: string | string[];
}

export interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  imageUrl?: string;
  heroImage?: string;
  heroType?: 'illustration' | 'photo';
  author: string | Author;
  content?: BlogPostContent[];
}

// Guide types
export interface GuideItem {
  id: string;
  title: string;
  coverTitle?: string;
  theme: string;
  href: string;
  published?: boolean;
}

// Podcast types
export interface PodcastEpisode {
  id: string;
  episodeNumber: number;
  title: string;
  description?: string;
  host?: string;
  date?: string;
  duration?: string;
  spotifyUrl: string;
  youtubeUrl: string;
  published?: boolean;
}
