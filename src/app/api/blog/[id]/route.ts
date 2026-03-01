import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getFallbackBlogPostById } from '@/lib/resource-fallback';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: true,
        content: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!post) {
      if (process.env.NODE_ENV !== 'production') {
        const fallbackPost = getFallbackBlogPostById(id);
        if (fallbackPost) {
          return NextResponse.json(fallbackPost);
        }
      }
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    if (!post.published && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Blog post not available' },
        { status: 403 }
      );
    }

    // Transform content back to original format
    const transformedPost = {
      ...post,
      content: post.content.map(c => {
        if (c.type !== 'list') {
          return { type: c.type, value: c.value };
        }
        try {
          return { type: c.type, value: JSON.parse(c.value) };
        } catch {
          return { type: c.type, value: [c.value] };
        }
      })
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}
